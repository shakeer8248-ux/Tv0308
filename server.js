const express = require('express');
const app = express();
const path = require('path');

app.use(express.json());
app.use(express.static(__dirname));

const linkMap = new Map();

// Helper to clean Google Drive links
function cleanDriveUrl(url) {
    if (url.includes('drive.google.com')) {
        const fileId = url.split('/d/')[1]?.split('/')[0];
        if (fileId) return `https://drive.google.com/uc?export=download&id=${fileId}&confirm=t`;
    }
    return url;
}

app.post('/send-link', (req, res) => {
    const rawUrl = req.body.url;
    if (!rawUrl) return res.status(400).json({ error: "No URL provided" });

    const cleanUrl = cleanDriveUrl(rawUrl);
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    
    linkMap.set(code, cleanUrl);
    console.log(`Code Generated: ${code} for URL: ${cleanUrl}`);
    res.json({ code: code });
});

app.get('/get-link/:code', (req, res) => {
    const url = linkMap.get(req.params.code);
    if (url) {
        res.json({ url: url });
    } else {
        res.status(404).json({ error: "Not found" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
