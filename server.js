const express = require("express");
const cors = require("cors");
const axios = require("axios"); // Use Axios for API requests

const app = express(); // Initialize Express app
app.use(cors()); // Enable CORS for cross-origin requests

const GITHUB_REPO = "mattyzenny/accessibility-training"; // Your GitHub repo
const BRANCH = "master"; // Use the correct branch

app.get("/last-updated", async (req, res) => {
  console.log("📥 Received request:", req.query);

  const filePath = req.query.filePath;
  if (!filePath) {
    return res.status(400).json({ error: "filePath is required" });
  }

  // Handle case sensitivity by checking multiple path formats
  const possiblePaths = [
    filePath,                     // User-provided path
    filePath.toLowerCase(),        // Lowercase variant
    filePath.replace(/\/([a-z])/g, (m, p1) => `/${p1.toUpperCase()}`), // Capitalize folders
  ];

  try {
    for (let path of possiblePaths) {
      const headers = {
        "User-Agent": "GitHub-API-Request",
        // No Authorization header is needed for public repos
      };

      const response = await axios.get(`https://api.github.com/repos/${GITHUB_REPO}/commits`, {
        params: { sha: BRANCH, path: path, per_page: 1 },
        headers: headers, // Pass headers without the token
      });

      if (response.data.length > 0) {
        const lastCommit = response.data[0].commit.committer.date;
        console.log(`✅ Commit found for ${path}:`, lastCommit);
        return res.json({ updated: new Date(lastCommit).toLocaleString() });
      }
    }

    throw new Error("No commits found for this file.");
  } catch (error) {
    console.error("❌ GitHub API Error:", error.message);
    return res.status(500).json({ updated: "Unknown", error: error.message });
  }
});

const PORT = process.env.PORT || 10000; // Port used by Render
app.listen(PORT, () => console.log(`✅ Backend running on port ${PORT}`));