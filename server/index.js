const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // User joins with username
  socket.on("join", (username) => {
    socket.username = username;
    console.log(username, "joined");
  });

  // Receive message from one client → broadcast to all
  socket.on("message", (data) => {
    console.log("Message received:", data);

    io.emit("message", {
      user: data.user,
      text: data.text,
    });
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.username || socket.id);
  });
});

server.listen(5000, () => {
  console.log("Server running on port 5000");
});

