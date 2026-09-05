const express = require("express");
const path = require("path");
const crypto = require("crypto");

const app = express();
const PORT = process.env.PORT || 10000;
const sessions = new Map();

app.use(express.json({ limit: "32kb" }));
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

const games = [
  { id: 1, name: "Golden Fortune", category: "Slots", image: "/assets/game-1.webp" },
  { id: 2, name: "Royal Spin", category: "Slots", image: "/assets/game-2.webp" },
  { id: 3, name: "Dragon Arena", category: "Arcade", image: "/assets/game-3.webp" },
  { id: 4, name: "Lucky Reels", category: "Slots", image: "/assets/game-4.webp" },
  { id: 5, name: "Crystal Quest", category: "Arcade", image: "/assets/game-5.webp" },
  { id: 6, name: "Mega Stars", category: "Slots", image: "/assets/game-6.webp" },
  { id: 7, name: "Ocean King", category: "Arcade", image: "/assets/game-7.webp" },
  { id: 8, name: "Diamond Rush", category: "Slots", image: "/assets/game-8.webp" }
];

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "Paqaobet30", time: new Date().toISOString() });
});

app.get("/api/games", (_req, res) => {
  res.json({ games });
});

app.post("/api/register", (req, res) => {
  const username = String(req.body.username || "").trim();
  if (username.length < 3) return res.status(400).json({ error: "Username must be at least 3 characters." });

  const token = crypto.randomBytes(24).toString("hex");
  const user = { username, createdAt: new Date().toISOString() };
  sessions.set(token, user);

  res.json({ token, user });
});

app.post("/api/login", (req, res) => {
  const username = String(req.body.username || "").trim();
  if (username.length < 3) return res.status(400).json({ error: "Enter a valid username." });

  const token = crypto.randomBytes(24).toString("hex");
  const user = { username, lastLogin: new Date().toISOString() };
  sessions.set(token, user);

  res.json({ token, user });
});

app.get("/api/me", (req, res) => {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, "");
  const user = token ? sessions.get(token) : null;
  if (!user) return res.status(401).json({ error: "Not authenticated." });
  res.json({ user });
});

app.post("/api/contact", (req, res) => {
  const name = String(req.body.name || "").trim();
  const email = String(req.body.email || "").trim();
  const message = String(req.body.message || "").trim();

  if (!name || !email || !message) {
    return res.status(400).json({ error: "Name, email and message are required." });
  }

  console.log(`[CONTACT] ${new Date().toISOString()} ${email}: ${message}`);
  res.json({ ok: true, message: "Message received." });
});

app.get("*", (_req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Paqaobet30 running on port ${PORT}`);
});
