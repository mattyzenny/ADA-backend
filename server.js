const express = require("express");
const cors = require("cors");
const { exec } = require("child_process");
const path = require("path");

const app = express();
app.use(cors());

const GIT_PROJECT_ROOT = path.join(__dirname, ".."); // Ensure Git runs from the project root

app.get("/last-updated", (req, res) => {
  const fs = require("fs");
  const path = require("path");
  
  const gitPath = path.join(__dirname, ".git");
  
  // Check if .git exists
  if (!fs.existsSync(gitPath)) {
    console.error("❌ ERROR: .git folder is missing! Git commands will fail.");
  } else {
    console.log("✅ .git folder exists! Git commands should work.");
  }
  console.log("📥 Received request with:", { filePath, startLine, endLine });

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