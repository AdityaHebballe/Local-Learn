const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3002;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../client/build')));

app.post('/api/course-structure', (req, res) => {
  const { coursePath } = req.body;

  if (!coursePath || !fs.existsSync(coursePath)) {
    return res.status(400).json({ error: 'Invalid course path' });
  }

  const courseStructure = getCourseStructure(coursePath);
  res.json(courseStructure);
});

app.get('/video', (req, res) => {
  const { path } = req.query;
  if (!path || !fs.existsSync(path)) {
    return res.status(404).send('File not found');
  }
  res.sendFile(path);
});

app.get('/resource', (req, res) => {
  const { path } = req.query;
  if (!path || !fs.existsSync(path)) {
    return res.status(404).send('File not found');
  }
  res.sendFile(path);
});

function getCourseStructure(dir) {
    const structure = [];
    const items = fs.readdirSync(dir).sort();

    items.forEach(item => {
        const itemPath = path.join(dir, item);
        const stats = fs.statSync(itemPath);

        if (stats.isDirectory()) {
            structure.push({
                name: item,
                type: 'directory',
                children: getCourseStructure(itemPath)
            });
        } else if (item.endsWith('.mp4')) {
            const subtitles = items
                .filter(subItem => subItem.startsWith(path.parse(item).name) && subItem.endsWith('.vtt'))
                .map(subtitleFile => {
                    const lang = path.parse(subtitleFile).name.replace(path.parse(item).name, '').trim();
                    return {
                        src: `http://localhost:3002/resource?path=${encodeURIComponent(path.join(dir, subtitleFile))}`,
                        srclang: lang.toLowerCase().substring(0, 2),
                        label: lang
                    };
                });
            structure.push({
                name: item,
                type: 'file',
                path: itemPath,
                subtitles: subtitles
            });
        } else if (!item.endsWith('.vtt')) {
            structure.push({
                name: item,
                type: 'file',
                path: itemPath
            });
        }
    });

    return structure;
}

module.exports = { app, port };
