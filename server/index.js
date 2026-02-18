const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join", (username) => {
    socket.username = username;
    console.log(`${username} joined`);
  });

  socket.on("send_message", (data) => {
    io.emit("receive_message", {
      user: data.user,
      text: data.text,
    });
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.username);
  });
});

server.listen(5000, () => {
  console.log("Server running on port 5000");
});

