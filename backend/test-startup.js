/**
 * Quick test to check if all modules load correctly
 */

console.log("Testing module imports...\n");

try {
  console.log("1. Loading config...");
  const config = require("./src/config");
  console.log("   ✓ Config loaded");

  console.log("2. Loading models...");
  const models = require("./src/models");
  console.log("   ✓ Models loaded:", Object.keys(models).join(", "));

  console.log("3. Loading services...");
  const services = require("./src/services");
  console.log("   ✓ Services loaded");

  console.log("4. Loading controllers...");
  const authController = require("./src/controllers/authController");
  const invitationController = require("./src/controllers/invitationController");
  console.log("   ✓ Controllers loaded");

  console.log("5. Loading routes...");
  const routes = require("./src/routes");
  console.log("   ✓ Routes loaded");

  console.log("6. Loading app...");
  const app = require("./src/app");
  console.log("   ✓ App loaded");

  console.log("\n✅ All modules loaded successfully!");
  console.log("The server should start without errors.");
  process.exit(0);
} catch (error) {
  console.error("\n❌ Error loading modules:");
  console.error(error.message);
  console.error("\nStack trace:");
  console.error(error.stack);
  process.exit(1);
}
