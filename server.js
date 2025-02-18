const express = require('express');
const cors = require('cors');
const execSync = require('child_process').execSync;  // Required to execute git command
const fs = require('fs'); // To read file contents

const app = express();
const allowedOrigins = ['https://mattyzenny.github.io/accessibility-training/', 'http://localhost:3000', 'http://localhost:1000']; // Add your front-end URL

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true); // Allow the request
    } else {
      callback(new Error('Not allowed by CORS')); // Block the request
    }
  }
}));

const GITHUB_REPO = "mattyzenny/accessibility-training";  // Your GitHub repo
const BRANCH = "master";  // The branch you want to check

// ### GetLastUpdated Helper Functions ###

function buildGitCommand(filePath, startLine, endLine) {
  return `git log -L ${startLine},${endLine}:${filePath}`;
}

function extractCommitDate(output) {
  const dateMatch = output.match(/Date:\s*(.*)/);
  return dateMatch ? dateMatch[1] : 'Unknown';
}

// ### GetTermAndDefinition Helper Functions ###

function extractTerm(content) {
  const termMatch = content.match(/term:\s*'([^']+)'/);
  return termMatch ? termMatch[1] : 'Unknown Term';
}

function extractDefinition(content) {
  const definitionMatch = content.match(/definition:\s*'([^']+)'/);
  return definitionMatch ? definitionMatch[1] : 'No definition available';
}

// ### Main Logic Functions ###

// Function to get last updated date using git log
function getLastUpdated(filePath, startLine, endLine) {
  try {
    const command = buildGitCommand(filePath, startLine, endLine);
    const output = execSync(command).toString();
    return extractCommitDate(output);
  } catch (error) {
    console.error("Error running git log:", error);
    return 'Unknown';
  }
}

// Function to read file and extract term and definition
function getTermAndDefinition(filePath, startLine, endLine) {
  try {
    const lines = fs.readFileSync(filePath, 'utf-8').split('\n');
    const relevantLines = lines.slice(startLine - 1, endLine).join(' ');
    return { 
      term: extractTerm(relevantLines), 
      definition: extractDefinition(relevantLines) 
    };
  } catch (error) {
    console.error("Error reading file:", error);
    throw new Error("Unable to retrieve term/definition");
  }
}

// ### API Endpoint ###

app.get("/last-updated", async (req, res) => {
  const { filePath, startLine, endLine } = req.query;
  console.log(`Received request: filePath=${filePath}, startLine=${startLine}, endLine=${endLine}`);

  // Get last updated information using git log
  const lastUpdated = getLastUpdated(filePath, startLine, endLine);
  
  // Get term and definition dynamically from the file content
  const { term, definition } = getTermAndDefinition(filePath, parseInt(startLine), parseInt(endLine));

  // Respond with the full object containing term, definition, and updated date
  return res.json({ term, definition, updated: lastUpdated });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log( `✅ Backend running on port ${PORT}`));