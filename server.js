const express = require("express");
const cors = require("cors");
const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");

const app = express();
app.use(cors());

const GIT_PROJECT_ROOT = path.resolve(__dirname, ".."); // Ensure Git runs from the project root

// Check if .git exists before running git commands
const gitPath = path.join(GIT_PROJECT_ROOT, ".git");

if (!fs.existsSync(gitPath)) {
  console.error("❌ ERROR: .git folder is missing! Git commands will fail.");
} else {
  console.log("✅ .git folder exists! Git commands should work.");
}

app.get("/last-updated", (req, res) => {
  console.log("📥 Received request:", req.query);

  const filePath = req.query.filePath;
  const startLine = Number(req.query.startLine);
  const endLine = Number(req.query.endLine);

  if (!filePath) {
    console.error("❌ ERROR: filePath is undefined!");
    return res.status(400).json({ error: "filePath is required" });
  }

  console.log(`📂 Processing file: ${filePath} from line ${startLine} to ${endLine}`);

  if (!fs.existsSync(gitPath)) {
    console.error("❌ ERROR: .git folder is missing! Cannot run git commands.");
    return res.status(500).json({ updated: "Unknown", error: ".git folder is missing in deployment." });
  }

  const command = `cd ${GIT_PROJECT_ROOT} && \
  git log -1 --format="%cr" -L ${startLine},${endLine}:$(git ls-files | grep -i -m 1 "${filePath}") | head -1`;

  exec(command, { cwd: GIT_PROJECT_ROOT }, (error, stdout, stderr) => {
    if (error || stderr) {
      const errorMsg = stderr.trim() || error.message;
      console.error("❌ Git error:", errorMsg);
      return res.status(500).json({ updated: "Unknown", error: errorMsg });
    }

    console.log("✅ Git output:", stdout.trim());
    res.json({ updated: stdout.trim() });
  });
});

app.listen(3000, () => console.log("✅ Backend running on http://localhost:3000"));