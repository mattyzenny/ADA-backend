const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());

app.get("/last-updated", (req, res) => {
  const { filePath } = req.query;

  // ✅ Correct path to contentBundle.json
  const fileToRead = path.join(__dirname, filePath);

  console.log("🔍 Trying to read file:", fileToRead);

  fs.readFile(fileToRead, 'utf-8', (err, data) => {
    if (err) {
      console.error("❌ Error reading file:", err);
      return res.status(500).json({ message: "Failed to read contentBundle.json", error: err.message });
    }

    try {
      const jsonData = JSON.parse(data);
      res.json(jsonData);
    } catch (parseErr) {
      console.error("❌ Error parsing JSON:", parseErr);
      res.status(500).json({ message: "Invalid JSON format", error: parseErr.message });
    }
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Backend running on port ${PORT}`));