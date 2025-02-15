const express = require("express");
const cors = require("cors");
const axios = require("axios"); // Use Axios for API requests

const app = express();
app.use(cors());

const GITHUB_REPO = "mattyzenny/ADA-backend"; // Your GitHub repo

app.get("/last-updated", async (req, res) => {
  console.log("📥 Received request:", req.query);

  const filePath = req.query.filePath;
  if (!filePath) {
    console.error("❌ ERROR: filePath is missing!");
    return res.status(400).json({ error: "filePath is required" });
  }

  try {
    const response = await axios.get(`https://api.github.com/repos/${GITHUB_REPO}/commits`, {
      params: { path: filePath, per_page: 1 },
      headers: { "User-Agent": "GitHub-API-Request" },
    });

    if (response.data.length > 0) {
      const lastCommit = response.data[0].commit.committer.date;
      console.log("✅ GitHub API Commit Date:", lastCommit);
      return res.json({ updated: new Date(lastCommit).toLocaleString() });
    } else {
      throw new Error("No commits found for this file.");
    }
  } catch (error) {
    console.error("❌ GitHub API Error:", error.message);
    return res.status(500).json({ updated: "Unknown", error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Backend running on port ${PORT}`));