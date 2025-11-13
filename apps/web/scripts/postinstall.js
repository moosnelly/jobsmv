const fs = require("fs");
const path = require("path");

// Skip in Docker - npm install handles dependencies correctly in containers
if (process.env.DOCKER_BUILD === "true" || fs.existsSync("/.dockerenv")) {
  process.exit(0);
}

const localNodeModules = path.join(__dirname, "../node_modules");
const rootNodeModules = path.join(__dirname, "../../../node_modules");
const packageName = "lucide-react";

const localPackagePath = path.join(localNodeModules, packageName);
const rootPackagePath = path.join(rootNodeModules, packageName);

// Exit gracefully if package already exists locally (normal case)
if (fs.existsSync(localPackagePath)) {
  process.exit(0);
}

// Create local node_modules directory if it doesn't exist
if (!fs.existsSync(localNodeModules)) {
  fs.mkdirSync(localNodeModules, { recursive: true });
}

// If package doesn't exist locally but exists in root, copy it
// This handles npm workspace hoisting in local development
if (!fs.existsSync(localPackagePath) && fs.existsSync(rootPackagePath)) {
  // Use symlink on Unix systems, copy on Windows
  try {
    fs.symlinkSync(
      path.relative(localNodeModules, rootPackagePath),
      localPackagePath,
      "dir"
    );
    console.log(`✓ Created symlink for ${packageName}`);
  } catch (error) {
    // Fallback to copying on Windows or if symlink fails
    if (error.code === "EPERM" || process.platform === "win32") {
      const copyRecursiveSync = (src, dest) => {
        const exists = fs.existsSync(src);
        const stats = exists && fs.statSync(src);
        const isDirectory = exists && stats.isDirectory();
        if (isDirectory) {
          fs.mkdirSync(dest, { recursive: true });
          fs.readdirSync(src).forEach((childItemName) => {
            copyRecursiveSync(
              path.join(src, childItemName),
              path.join(dest, childItemName)
            );
          });
        } else {
          fs.copyFileSync(src, dest);
        }
      };
      copyRecursiveSync(rootPackagePath, localPackagePath);
      console.log(`✓ Copied ${packageName} to local node_modules`);
    } else {
      throw error;
    }
  }
}

