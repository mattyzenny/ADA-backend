const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(cors()); // ✅ Enable CORS

// ✅ Existing route to fetch directly from GitHub
app.get('/content-bundle', async (req, res) => {
  const githubRawURL = 'https://raw.githubusercontent.com/mattyzenny/accessibility-training/main/src/assets/contentBundle/contentBundle.json';

  try {
    console.log("🌐 Fetching contentBundle.json from GitHub...");
    const response = await axios.get(githubRawURL);

    console.log("✅ Successfully fetched contentBundle.json");
    res.json(response.data);
  } catch (error) {
    console.error("❌ Failed to fetch from GitHub:", error.message);
    res.status(500).json({
      error: 'Failed to fetch content bundle from GitHub',
      details: error.message
    });
  }
});

// ✅ 🔥 NEW ROUTE for /last-updated (to fix 404)
app.get('/last-updated', (req, res) => {
  const filePath = req.query.filePath;

  if (!filePath || filePath !== 'contentBundle.json') {
    return res.status(400).json({ error: 'Invalid or missing filePath parameter' });
  }

  // Use GitHub as the source for consistency
  const githubRawURL = 'https://raw.githubusercontent.com/mattyzenny/accessibility-training/main/src/assets/contentBundle/contentBundle.json';

  axios.get(githubRawURL)
    .then(response => res.json(response.data))
    .catch(err => {
      console.error("❌ Error fetching from GitHub in /last-updated:", err.message);
      res.status(500).json({ error: 'Failed to fetch content bundle', details: err.message });
    });
});

// ✅ Health check route
app.get('/health', (req, res) => {
  res.json({ status: 'Backend is running smoothly 🚀' });
});

// ✅ Start the backend
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Backend running on port ${PORT}`));