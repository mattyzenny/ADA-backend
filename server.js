const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(cors()); // Enable CORS for cross-origin requests

// Determine if running locally or in production
const isLocal = process.env.NODE_ENV !== "production";
const JSON_FILE = isLocal
  ? path.join(__dirname, "updates.json") // Local path
  : path.join("/tmp", "updates.json"); // Use /tmp/ in Render

// Ensure updates.json persists in Render by copying from the repo at startup
if (!isLocal) {
  const PERSISTENT_JSON = path.join(__dirname, "updates.json"); // Git-tracked file

  if (fs.existsSync(PERSISTENT_JSON)) {
    console.log("📂 Copying updates.json from repo to /tmp...");
    fs.copyFileSync(PERSISTENT_JSON, JSON_FILE);
  } else {
    console.log("⚠️ No updates.json found in repo. Creating a new one...");
    fs.writeFileSync(JSON_FILE, "{}");
  }
}

// Get the port number from environment variables or default to 1000 for local
const PORT = process.env.PORT || (process.env.NODE_ENV === "production" ? 3000 : 1000);

app.get("/last-updated", (req, res) => {
  console.log("📥 Received request:", req.query);

  const filePath = req.query.filePath;
  if (!filePath) {
    return res.status(400).json({ error: "Missing filePath" });
  }

  // Ensure updates.json exists before reading
  if (!fs.existsSync(JSON_FILE)) {
    console.log("⚠️ updates.json not found, creating a new one...");
    fs.writeFileSync(JSON_FILE, "{}");
  }

  fs.readFile(JSON_FILE, "utf8", (err, data) => {
    if (err) {
      console.error("❌ Error reading updates.json:", err);
      return res.status(500).json({ error: "Could not read updates file" });
    }

    const updates = JSON.parse(data);
    const lastUpdated = updates[filePath] || "Unknown";

    res.json({ updated: lastUpdated });
  });
});

// Start the Express server
app.listen(PORT, () =>
  console.log(`✅ Backend running on port ${PORT} (${isLocal ? "Local" : "Render"})`)
);