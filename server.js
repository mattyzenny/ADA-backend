const express = require("express");
const cors = require("cors");
const { exec } = require("child_process");
const path = require("path");

const app = express(); // Initialize Express
app.use(cors()); // Enable CORS for cross-origin requests

const GITHUB_REPO = "mattyzenny/accessibility-training"; // Your GitHub repo
const BRANCH = "master"; // Use the correct branch
const GIT_PROJECT_ROOT = path.join(__dirname, ".."); // Ensure Git runs from the project root

app.get("/last-updated", (req, res) => {
  console.log("📥 Received request:", req.query);

  const filePath = req.query.filePath;
  const startLine = Number(req.query.startLine);
  const endLine = Number(req.query.endLine);

  // Validate filePath, startLine, and endLine
  if (!filePath || isNaN(startLine) || isNaN(endLine)) {
    return res.status(400).json({ error: "Invalid parameters" });
  }

  // Handle case sensitivity by checking multiple path formats
  const possiblePaths = [
    filePath,                     // User-provided path
    filePath.toLowerCase(),        // Lowercase variant
    filePath.replace(/\/([a-z])/g, (m, p1) => `/${p1.toUpperCase()}`), // Capitalize folders
  ];

  // Loop through the possible paths
  try {
    for (let path of possiblePaths) {
      const command = `cd ${GIT_PROJECT_ROOT} && git log -1 --format="%cr" -L ${startLine},${endLine}:${path}`;

      exec(command, (error, stdout, stderr) => {
        if (error || stderr) {
          console.error("❌ Git error:", error || stderr);
          return res.status(500).json({ updated: "Unknown", error: error || stderr });
        }

        console.log(`✅ Commit found for ${path}:`, stdout.trim());
        return res.json({ updated: stdout.trim() });
      });
    }
  } catch (error) {
    console.error("❌ GitHub API Error:", error.message);
    return res.status(500).json({ updated: "Unknown", error: error.message });
  }
});

const PORT = process.env.PORT || 10000; // Port used by Render or default to 10000 for local testing
app.listen(PORT, () => console.log(`✅ Backend running on port ${PORT}`));