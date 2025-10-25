const express = require('express');
const morgan = require('morgan');
const path = require('path');

const app = express();
app.use(morgan('tiny'));

// Serve static UI (put index.html in /public)
app.use(express.static(path.join(__dirname, 'public')));

// Simple in-memory user store for demo (replace with DB)
const users = {
  mikeph: { password: 'mikeph', allowed: true }
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
'#EXTINF:-1 tvg-id="ae-us-eastern-feed" tvg-name="A&E US Eastern Feed" tvg-logo="" group-title="Live",A&E US Eastern Feed',
'https://tvpass.org/live/AEEast/sd',
'#EXTINF:-1 tvg-id="abc-kabc-los-angeles-ca" tvg-name="ABC (KABC) Los Angeles" tvg-logo="" group-title="Live",ABC (KABC) Los Angeles',
'https://tvpass.org/live/abc-kabc-los-angeles-ca/sd',
'#EXTINF:-1 tvg-id="abc-wabc-new-york-ny" tvg-name="ABC (WABC) New York, NY" tvg-logo="" group-title="Live",ABC (WABC) New York, NY',
'https://tvpass.org/live/WABCDT1/sd',
'#EXTINF:-1 tvg-id="acc-network" tvg-name="ACC Network" tvg-logo="" group-title="Live",ACC Network',
'https://tvpass.org/live/ACCNetwork/sd',
'#EXTINF:-1 tvg-id="altitude-sports-denver" tvg-name="Altitude Sports Denver" tvg-logo="" group-title="Live",Altitude Sports Denver',
'https://tvpass.org/live/altitude-sports-denver/sd',
'#EXTINF:-1 tvg-id="amc-eastern-feed" tvg-name="AMC Eastern Feed" tvg-logo="" group-title="Live",AMC Eastern Feed',
'https://tvpass.org/live/AMCEast/sd',
'#EXTINF:-1 tvg-id="american-heroes-channel" tvg-name="American Heroes Channel" tvg-logo="" group-title="Live",American Heroes Channel',
'https://tvpass.org/live/AmericanHeroesChannel/sd',
'#EXTINF:-1 tvg-id="animal-planet-us-east" tvg-name="Animal Planet US East" tvg-logo="" group-title="Live",Animal Planet US East',
'https://tvpass.org/live/AnimalPlanetEast/sd',
'#EXTINF:-1 tvg-id="bbc-america-east" tvg-name="BBC America East" tvg-logo="" group-title="Live",BBC America East',
'https://tvpass.org/live/BBCAmericaEast/sd',
'#EXTINF:-1 tvg-id="bbc-news-north-america-hd" tvg-name="BBC News North America HD" tvg-logo="" group-title="Live",BBC News North America HD',
'https://tvpass.org/live/BBCWorldNewsNorthAmerica/sd',
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
