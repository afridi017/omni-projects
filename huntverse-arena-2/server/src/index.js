import express from "express";
import cors from "cors";
import helmet from "helmet";
import jwt from "jsonwebtoken";
import crypto from "node:crypto";
import { PrismaClient } from "@prisma/client";
const app = express();
const prisma = new PrismaClient();
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_ORIGIN || "http://localhost:3000" }));
app.use(express.json());
const rooms = new Map();
const hash = (value) => crypto.createHash("sha256").update(value).digest("hex");
function auth(req, res, next) {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");
    req.user = jwt.verify(token, process.env.JWT_SECRET || "dev-only-secret");
    next();
  } catch {
    return res.status(401).json({ error: "AUTH_REQUIRED" });
  }
}
app.get("/health", (_, res) =>
  res.json({
    service: "huntverse-api",
    status: "ok",
    time: new Date().toISOString(),
  }),
);
app.post("/auth/demo", async (req, res) => {
  const username = String(req.body.username || "hunter").slice(0, 32);
  const user = await prisma.user.upsert({
    where: { username },
    update: {},
    create: {
      username,
      email: `${username}@demo.huntverse`,
      passwordHash: hash("demo"),
    },
  });
  const token = jwt.sign(
    { sub: user.id, username: user.username },
    process.env.JWT_SECRET || "dev-only-secret",
    { expiresIn: "2h" },
  );
  res.json({
    token,
    user: { id: user.id, username: user.username, reputation: user.reputation },
  });
});
app.post("/rooms", auth, async (req, res) => {
  const code = crypto.randomBytes(3).toString("hex").toUpperCase();
  const room = await prisma.room.create({
    data: {
      code,
      flagSeed: crypto.randomBytes(24).toString("hex"),
      members: { create: { userId: req.user.sub } },
    },
  });
  rooms.set(code, { id: room.id, seed: room.flagSeed });
  res.status(201).json({ code, roomId: room.id });
});
app.post("/rooms/:code/join", auth, async (req, res) => {
  const room = await prisma.room.findUnique({
    where: { code: req.params.code },
  });
  if (!room) return res.status(404).json({ error: "ROOM_NOT_FOUND" });
  await prisma.roomMember.upsert({
    where: { roomId_userId: { roomId: room.id, userId: req.user.sub } },
    update: {},
    create: { roomId: room.id, userId: req.user.sub },
  });
  res.json({ code: room.code, status: room.status });
});
app.post("/rooms/:code/submit", auth, async (req, res) => {
  const room = await prisma.room.findUnique({
    where: { code: req.params.code },
  });
  if (!room) return res.status(404).json({ error: "ROOM_NOT_FOUND" });
  const expected = hash(`${room.flagSeed}:${req.body.challengeSlug}`);
  const received = hash(String(req.body.flag || ""));
  const accepted =
    expected.length === received.length &&
    crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(received));
  res.json({
    accepted,
    points: accepted ? 100 : 0,
    message: accepted ? "FLAG_ACCEPTED" : "FLAG_REJECTED",
  });
});
app.listen(Number(process.env.PORT || 4000), () =>
  console.log("HuntVerse API listening"),
);
