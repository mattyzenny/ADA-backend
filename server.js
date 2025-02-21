const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();

app.get('/last-updated', (req, res) => {
    const filePathFromRequest = req.query.filePath; // Get the filePath from query parameter
    console.log("filePathFromRequest: ", filePathFromRequest)

    if (!filePathFromRequest) {
        return res.status(400).send({ error: 'filePath is required' });
    }

    const filePath = path.join(__dirname, filePathFromRequest); // Construct the full path

    console.log("filePath: ", filePath)

    fs.stat(filePath, (err, stats) => {
        if (err) {
            console.error('Error accessing file:', err);
            return res.status(500).send({ error: 'Error accessing file' });
        }

        if (stats.isFile()){

            fs.readFile(filePath, 'utf8', (err, data) => {
                if (err) {
                    console.error('Error reading file:', err);
                    return res.status(500).send({ error: 'Error reading file' });
                }
                try {
                    const jsonData = JSON.parse(data); // Try to parse as JSON
                    res.json(jsonData);
                } catch (jsonErr) {
                    console.error('Error parsing JSON:', jsonErr);
                    res.status(500).send({ error: 'Error parsing JSON' });
                }
            });
        } else {
            console.error('File path does not exist:', filePath);
            return res.status(500).send({error: `File path does not exist: ${filePath}`});
        }

    });
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});