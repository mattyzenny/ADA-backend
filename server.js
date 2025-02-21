const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors()); // ✅ Enable CORS

// ✅ Route to fetch contentBundle.json directly from GitHub
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

// ✅ Health check route (optional)
app.get('/health', (req, res) => {
  res.json({ status: 'Backend is running smoothly 🚀' });
});

// ✅ Start the backend
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Backend running on port ${PORT}`));