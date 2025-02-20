const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());

app.get('/last-updated', (req, res) => {
  const filePath = req.query.filePath;

  if (!filePath || filePath !== 'contentBundle.json') {
    return res.status(400).json({ error: 'Invalid or missing filePath parameter' });
  }

  const contentBundlePath = path.join(__dirname, 'contentBundle.json');

  fs.readFile(contentBundlePath, 'utf8', (err, data) => {
    if (err) {
      console.error("❌ Error reading contentBundle.json:", err);
      return res.status(500).json({ error: 'Unable to read contentBundle.json' });
    }

    res.json(JSON.parse(data));
  });
});

const PORT = 3000;
app.listen(PORT, () => console.log(`✅ Backend running on http://localhost:${PORT}`));