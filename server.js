const express = require("express");
const cors = require("cors");
const axios = require("axios"); // Use Axios for API requests

const app = express();
app.use(cors()); // Enable CORS for cross-origin requests

// GitHub repository and branch configuration
const GITHUB_REPO = "mattyzenny/accessibility-training"; // Your GitHub repo
const BRANCH = "master"; // Branch name (could be dynamic)

app.get("/last-updated", async (req, res) => {
  console.log("📥 Received request:", req.query);

  const { filePath, startLine, endLine } = req.query;

  // Handle case sensitivity and format file path variations
  const possiblePaths = generatePossiblePaths(filePath);

  try {
    for (let path of possiblePaths) {
      // Fetch commit data using GitHub API
      const response = await fetchCommitData(path, startLine, endLine);

      if (response.data.length > 0) {
        const lastCommit = response.data[0].commit.committer.date;
        console.log(`✅ Commit found for ${path} from line ${startLine} to ${endLine}:`, lastCommit);
        return res.json({ updated: new Date(lastCommit).toLocaleString() });
      }
    }

    throw new Error("No commits found for this file.");
  } catch (error) {
    console.error("❌ GitHub API Error:", error.message);
    return res.status(500).json({ updated: "Unknown", error: error.message });
  }
});

// Helper function to generate possible paths (case variations)
function generatePossiblePaths(filePath) {
  return [
    filePath,                     // User-provided path
    filePath.toLowerCase(),       // Lowercase variant
    filePath.replace(/\/([a-z])/g, (m, p1) => `/${p1.toUpperCase()}`), // Capitalize folders
  ];
}

// Helper function to fetch commit data from GitHub API
async function fetchCommitData(path, startLine, endLine) {
  const headers = {
    "User-Agent": "GitHub-API-Request",
  };

  // If token is present in environment, use it for authentication
  if (process.env.GITHUB_TOKEN) {
    headers["Authorization"] = `token ${process.env.GITHUB_TOKEN}`;
  }

  const command = `git log -1 --format="%cr" -L ${startLine},${endLine}:${path}`;
  return await axios.get(`https://api.github.com/repos/${GITHUB_REPO}/commits`, {
    params: { sha: BRANCH, path: path, per_page: 1 },
    headers: headers,
  });
}

// Set the port used by Render or fall back to 10000 for local testing
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`✅ Backend running on port ${PORT}`));