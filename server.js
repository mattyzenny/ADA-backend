const express = require("express");
const cors = require("cors");
const { exec } = require("child_process");
const path = require("path");

const app = express();
app.use(cors());

const GIT_PROJECT_ROOT = path.join(__dirname, ".."); // Ensure Git runs from the project root

app.get("/last-updated", (req, res) => {
  const startLine = Number(req.query.startLine);
  const endLine = Number(req.query.endLine);
  const fullPath = req.query.filePath;

  const filePath = path.join("src/app", fullPath); // Ensure fullPath is defined before using

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