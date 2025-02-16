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
  : path.join("/app", "updates.json"); // Adjust for Render's environment

// Get the port number from environment variables or default to 1000 for local
const PORT = process.env.PORT || (process.env.NODE_ENV === "production" ? 3000 : 1000);

app.get("/last-updated", (req, res) => {
  console.log("📥 Received request:", req.query);

  const filePath = req.query.filePath;
  if (!filePath) {
    return res.status(400).json({ error: "Missing filePath" });
  }

  // Read the updates.json file
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