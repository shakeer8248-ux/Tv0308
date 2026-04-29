const express = require('express');
const app = express();

app.use(express.static(__dirname));
app.use(express.json()); // Allows server to read JSON data

const linkMap = new Map(); // Stores { "1234": "https://terabox.com/..." }

// Mobile sends the TeraBox link here
app.post('/send-link', (req, res) => {
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    linkMap.set(code, req.body.url);
    res.json({ code: code });
});

// TV asks for the link using the code
app.get('/get-link/:code', (req, res) => {
    const videoUrl = linkMap.get(req.params.code);
    if (videoUrl) {
        res.json({ url: videoUrl });
    } else {
        res.status(404).json({ error: "Code not found" });
    }
});

app.listen(process.env.PORT || 3000, () => {
    console.log("Server running for URL casting");
});
