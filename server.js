const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(cors()); // Enable CORS for cross-origin requests

// Determine if running locally or in production
const isLocal = process.env.NODE_ENV !== "production";
const JSON_FILE = isLocal
  ? path.join(__dirname, "updates.json")  // Local path
  : path.join("/tmp", "updates.json"); // Use /tmp/ for Render (writable)
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
app.listen(PORT, () => console.log(`✅ Backend running on port ${PORT} (${isLocal ? "Local" : "Render"})`));