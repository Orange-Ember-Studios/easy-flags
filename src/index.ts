import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";

dotenv.config();

import routes from "./routes";
import { signToken } from "./authMiddlewares";
import { pageAuthMiddleware } from "./pageMiddlewares";
import { UserRepository } from "./infrastructure/repositories/userRepository";
import { AuthService } from "./application/services/authService";

const PORT = Number(process.env.PORT || 3000);

const userRepository = new UserRepository();
const authService = new AuthService(userRepository);

const app = express();
app.use(cors());
app.use(express.json());
app.use(cookieParser());

// Set view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "..", "views"));

// Static assets
app.use(express.static(path.join(__dirname, "..", "public")));

// Ensure admin user exists from env
async function ensureAdmin() {
  const adminUser = process.env.ADMIN_USER || "admin";
  const adminPass = process.env.ADMIN_PASS || "password";
  await authService.ensureAdminUser(adminUser, adminPass);
}

// Ensure DB and admin then start server
ensureAdmin()
  .then(() => {
    // Login page (public)
    app.get("/", (req, res) => {
      res.render("index");
    });

    app.post("/auth/login", async (req, res) => {
      const { username, password } = req.body;
      if (!username || !password)
        return res
          .status(400)
          .json({ error: "Username and Password required" });
      const user = await authService.authenticate(username, password);
      if (!user) return res.status(401).json({ error: "Invalid credentials" });
      const token = signToken({ username: user.username, id: user.id });
      // Set secure httpOnly cookie
      res.cookie("ff_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 8 * 60 * 60 * 1000, // 8 hours
      });
      res.json({ token });
    });

    // Add logout endpoint to clear cookie
    app.post("/auth/logout", (req, res) => {
      res.clearCookie("ff_token");
      res.json({ success: true });
    });

    // Protected page routes
    app.get("/environments", pageAuthMiddleware, (req, res) => {
      res.render("layout", {
        title: "Environments | Feature Flags",
        pageView: "envs",
      });
    });

    app.get("/features", pageAuthMiddleware, (req, res) => {
      res.render("layout", {
        title: "Features | Feature Flags",
        pageView: "features",
      });
    });

    app.get("/docs", pageAuthMiddleware, (req, res) => {
      res.render("layout", {
        title: "API Documentation | Feature Flags",
        pageView: "docs",
      });
    });

    // API routes with authentication
    app.use("/api", routes);
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to initialize DB", err);
    process.exit(1);
  });
