const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(cors()); // Allow cross-origin requests

// ✅ Serve contentBundle.json from the backend root
app.get('/content-bundle', (req, res) => {
  const bundlePath = path.join(__dirname, 'contentBundle.json');

  fs.readFile(bundlePath, 'utf8', (err, data) => {
    if (err) {
      console.error("❌ Error reading contentBundle.json:", err);
      return res.status(500).json({ error: 'Unable to read contentBundle.json' });
    }
    res.json(JSON.parse(data));
  });
});

// ✅ Existing route for /last-updated if still needed
app.get('/last-updated', (req, res) => {
  const filePath = req.query.filePath || 'contentBundle.json';
  const bundlePath = path.join(__dirname, filePath);

  fs.readFile(bundlePath, 'utf8', (err, data) => {
    if (err) {
      console.error("❌ Error reading contentBundle.json:", err);
      return res.status(500).json({ error: 'Unable to read contentBundle.json' });
    }
    res.json(JSON.parse(data));
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Backend running on http://localhost:${PORT}`));