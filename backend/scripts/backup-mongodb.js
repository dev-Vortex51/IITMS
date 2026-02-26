/**
 * MongoDB Backup Script
 * Backs up the current MongoDB database before migration
 * Usage: node scripts/backup-mongodb.js
 */

const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

const MONGODB_URI = process.env.MONGODB_URI;
const BACKUP_DIR = path.join(__dirname, "..", "backup", "mongodb");
const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
const BACKUP_PATH = path.join(BACKUP_DIR, `backup-${timestamp}`);

// Ensure backup directory exists
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

console.log("🔄 Starting MongoDB backup...");
console.log(`📁 Backup location: ${BACKUP_PATH}`);
console.log(
  `🔗 MongoDB URI: ${MONGODB_URI ? "[CONFIGURED]" : "[NOT CONFIGURED]"}`,
);

if (!MONGODB_URI) {
  console.error("❌ Error: MONGODB_URI not found in .env file");
  process.exit(1);
}

// Build mongodump command
const command = `mongodump --uri="${MONGODB_URI}" --out="${BACKUP_PATH}"`;

console.log("\n⏳ Running backup (this may take a few minutes)...\n");

exec(command, (error, stdout, stderr) => {
  if (error) {
    console.error("❌ Backup failed:", error.message);
    console.error("\nDetails:", stderr);

    // Check if mongodump is installed
    console.log("\n💡 Make sure MongoDB Database Tools are installed:");
    console.log(
      "   Download from: https://www.mongodb.com/try/download/database-tools",
    );
    console.log("   Or install via: npm install -g mongodb-database-tools");

    process.exit(1);
  }

  if (stderr) {
    console.log("⚠️  Warnings:", stderr);
  }

  console.log("✅ MongoDB backup completed successfully!\n");
  console.log(stdout);
  console.log("\n📊 Backup Summary:");
  console.log(`   Location: ${BACKUP_PATH}`);
  console.log(`   Timestamp: ${new Date().toLocaleString()}`);

  // List backed up collections
  const dbPath = path.join(BACKUP_PATH, "siwes_management");
  if (fs.existsSync(dbPath)) {
    const files = fs.readdirSync(dbPath);
    const collections = files
      .filter((f) => f.endsWith(".bson"))
      .map((f) => f.replace(".bson", ""));
    console.log(`   Collections backed up: ${collections.length}`);
    console.log(`   Collections: ${collections.join(", ")}`);
  }

  console.log("\n✨ You can now proceed with the PostgreSQL migration");
  console.log("   To restore this backup later, run:");
  console.log(
    `   mongorestore --uri="${MONGODB_URI.split("?")[0]}" "${BACKUP_PATH}"`,
  );
});
