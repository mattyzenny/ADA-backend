const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());

app.get('/content-bundle', (req, res) => {
  const filePath = path.join(__dirname, 'dist/accessibility-training/assets/contentBundle/contentBundle.json');

  console.log("📁 Attempting to read file at:", filePath);

  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error("❌ Error reading contentBundle.json:", err);
      return res.status(500).json({ error: 'Failed to read contentBundle.json', details: err.message });
    }
    res.json(JSON.parse(data));
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Backend running on port ${PORT}`));