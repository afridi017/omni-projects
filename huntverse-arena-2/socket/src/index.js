import express from "express";
import cors from "cors";
import { createServer } from "node:http";
import { Server } from "socket.io";
const app = express();
app.use(cors());
const server = createServer(app);
const io = new Server(server, {
  cors: { origin: process.env.CLIENT_ORIGIN || "http://localhost:3000" },
});
app.get("/health", (_, res) =>
  res.json({ service: "huntverse-realtime", status: "ok" }),
);
io.on("connection", (socket) => {
  socket.on("room:join", ({ code, username }) => {
    socket.join(code);
    io.to(code).emit("room:presence", {
      username,
      online: io.sockets.adapter.rooms.get(code)?.size || 1,
    });
  });
  socket.on("room:chat", ({ code, username, message }) =>
    io.to(code).emit("room:chat", { username, message, at: Date.now() }),
  );
  socket.on("flag:accepted", ({ code, username, challenge, points }) =>
    io
      .to(code)
      .emit("feed:kill", { username, challenge, points, at: Date.now() }),
  );
  socket.on("room:leave", (code) => socket.leave(code));
});
server.listen(Number(process.env.PORT || 4001), () =>
  console.log("HuntVerse realtime listening"),
);
