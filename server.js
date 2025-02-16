const express = require("express");
const cors = require("cors");
const { exec } = require("child_process");

const app = express();
app.use(cors()); // Enable CORS for cross-origin requests

// GitHub repository and branch configuration
const GITHUB_REPO = "mattyzenny/accessibility-training"; // Your GitHub repo
const BRANCH = "master"; // Branch name (could be dynamic)

app.get("/last-updated", (req, res) => {
  console.log("📥 Received request:", req.query);

  const { filePath, startLine, endLine } = req.query;

  // Ensure that filePath, startLine, and endLine are valid
  if (!filePath || !startLine || !endLine) {
    return res.status(400).json({ error: "Missing filePath, startLine, or endLine" });
  }

  // Handle case sensitivity and format file path variations
  const possiblePaths = [
    filePath,                     // User-provided path
    filePath.toLowerCase(),       // Lowercase variant
    filePath.replace(/\/([a-z])/g, (m, p1) => `/${p1.toUpperCase()}`), // Capitalize folders
  ];

  let isFound = false;

  for (let path of possiblePaths) {
    console.log("Checking path:", path);

    // Construct the git log -L command to fetch commit data for the specific lines
    const command = `git log -1 --format="%cr" -L ${startLine},${endLine}:${path}`;
    console.log("Running command:", command); // Log the exact command being run

    exec(command, (error, stdout, stderr) => {
      if (error || stderr) {
        const errorMsg = stderr.trim() || error.message;
        console.error("❌ Git error:", errorMsg);
        return; // Do not send a response here, handle at the end
      }

      if (stdout.trim()) {
        console.log("✅ Commit found:", stdout.trim());
        res.json({ updated: stdout.trim() }); // Send response once
        isFound = true;
      }
    });

    // Prevent sending multiple responses
    if (isFound) {
      break;
    }
  }

  if (!isFound) {
    res.status(404).json({ updated: "Unknown", error: "No commits found for this file." });
  }
});

// Set the port used by Render or fall back to 10000 for local testing
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`✅ Backend running on port ${PORT}`));