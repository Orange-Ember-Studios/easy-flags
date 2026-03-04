import express from "express";
import { EnvironmentService } from "../application/services/environmentService";
import { requirePermission } from "../authorizationMiddlewares";
import { asyncHandler } from "../utils/errorHandler";
import { HTTP_STATUS, ERROR_MESSAGES } from "../utils/constants";

export default function createEnvironmentRouter(
  environmentService: EnvironmentService,
) {
  const router = express.Router();

  // List environments
  router.get("/", requirePermission("view_environments"), asyncHandler(async (req, res) => {
    const rows = await environmentService.listEnvironments();
    res.json(rows);
  }));

  // Create environment
  router.post(
    "/",
    requirePermission("create_environments"),
    asyncHandler(async (req, res) => {
      const { name } = req.body;
      if (!name) return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: "name required" });
      const env = await environmentService.createEnvironment(name);
      res.status(HTTP_STATUS.CREATED).json(env);
    }),
  );

  // Delete environment
  router.delete(
    "/:id",
    requirePermission("delete_environments"),
    asyncHandler(async (req, res) => {
      const id = Number(req.params.id);
      const deleted = await environmentService.deleteEnvironment(id);
      if (deleted) return res.json({ success: true });
      return res.status(HTTP_STATUS.NOT_FOUND).json({ error: ERROR_MESSAGES.ENVIRONMENT_NOT_FOUND });
    }),
  );

  // Update environment
  router.put(
    "/:id",
    requirePermission("update_environments"),
    asyncHandler(async (req, res) => {
      const id = Number(req.params.id);
      const { name } = req.body;
      if (!name) return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: "name required" });
      const env = await environmentService.updateEnvironmentName(id, name);
      if (env) return res.json(env);
      return res.status(HTTP_STATUS.NOT_FOUND).json({ error: ERROR_MESSAGES.ENVIRONMENT_NOT_FOUND });
    }),
  );

  return router;
}
