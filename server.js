const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const app = express();

// 1. Setup storage (Save files in /tmp for Render)
const upload = multer({ dest: '/tmp/' });
const videoMap = new Map(); // Stores { "1234": "filename.mp4" }

app.use(express.static(__dirname));

// 2. Mobile Uploads Video
app.post('/upload', upload.single('video'), (req, res) => {
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    videoMap.set(code, req.file.path);
    res.json({ code: code });
});

// 3. TV Streams Video
app.get('/stream/:code', (req, res) => {
    const filePath = videoMap.get(req.params.code);
    if (!filePath) return res.status(404).send("Code not found");

    const stat = fs.statSync(filePath);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (range) {
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
        const chunksize = (end - start) + 1;
        const file = fs.createReadStream(filePath, {start, end});
        const head = {
            'Content-Range': `bytes ${start}-${end}/${fileSize}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': chunksize,
            'Content-Type': 'video/mp4',
        };
        res.writeHead(206, head);
        file.pipe(res);
    } else {
        const head = {
            'Content-Length': fileSize,
            'Content-Type': 'video/mp4',
        };
        res.writeHead(200, head);
        fs.createReadStream(filePath).pipe(res);
    }
});

app.listen(process.env.PORT || 3000);
