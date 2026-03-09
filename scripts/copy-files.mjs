import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, "..");

// Directories to copy
const dirsToCopy = [
  { src: "views", dest: "dist/views" },
  { src: "public", dest: "dist/public" },
];

console.log("📋 Copying static files to dist...");

for (const { src, dest } of dirsToCopy) {
  const srcPath = path.join(rootDir, src);
  const destPath = path.join(rootDir, dest);

  // Remove destination if it exists
  if (fs.existsSync(destPath)) {
    fs.rmSync(destPath, { recursive: true, force: true });
  }

  // Copy directory
  if (fs.existsSync(srcPath)) {
    fs.cpSync(srcPath, destPath, { recursive: true });
    console.log(`✓ Copied ${src} → ${dest}`);
  } else {
    console.warn(`✗ Source directory not found: ${src}`);
  }
}

console.log("✓ All files copied successfully!");
