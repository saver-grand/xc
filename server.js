const express = require('express');
const morgan = require('morgan');
const path = require('path');

const app = express();
app.use(morgan('tiny'));

// Serve static UI (put index.html in /public)
app.use(express.static(path.join(__dirname, 'public')));

// Simple in-memory user store for demo (replace with DB)
const users = {
  demo: { password: 'demo', allowed: true }
};

// Utility: authenticate by query
function checkAuth(q) {
  const { username, password } = q;
  if (!username || !password) return false;
  const u = users[username];
  return u && u.password === password && u.allowed;
}

// GET /get.php?username=...&password=...&type=m3u_plus
app.get('/get.php', (req, res) => {
  const { type = '', username = '', password = '' } = req.query;
  if (!checkAuth(req.query)) {
    return res.status(401).send('Unauthorized');
  }

  if (type === 'm3u_plus') {
    // Return a simple M3U playlist as an example.
    const m3u = [
      '#EXTM3U',
      '#EXTINF:-1 tvg-id="channel1" tvg-name="Demo Channel 1" tvg-logo="" group-title="Demo",Demo Channel 1',
      'http://example.com/stream/channel1/playlist.m3u8',
      '#EXTINF:-1 tvg-id="channel2" tvg-name="Demo Channel 2" tvg-logo="" group-title="Demo",Demo Channel 2',
      'http://example.com/stream/channel2/playlist.m3u8'
    ].join('\n');
    res.set('Content-Type', 'audio/mpegurl; charset=utf-8');
    return res.send(m3u);
  }

  // Other types can be added (ts, etc.)
  return res.status(400).send('Unsupported type');
});

// GET /xmltv.php?username=...&password=...
app.get('/xmltv.php', (req, res) => {
  if (!checkAuth(req.query)) {
    return res.status(401).send('Unauthorized');
  }

  // Minimal XMLTV sample — replace with real EPG generation or proxy.
  const sampleXml = `<?xml version="1.0" encoding="UTF-8"?>
  <tv source-info-name="demo" generator-info-name="xtream-sim">
    <channel id="channel1">
      <display-name>Demo Channel 1</display-name>
    </channel>
    <programme start="20250101000000 +0000" stop="20250101003000 +0000" channel="channel1">
      <title>Demo Show</title>
      <desc>Short demo description</desc>
    </programme>
  </tv>`;
  res.set('Content-Type', 'application/xml; charset=utf-8');
  res.send(sampleXml);
});

// Simple health
app.get('/health', (req, res) => res.json({ ok: true }));

// Start server (Render provides PORT env var)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
