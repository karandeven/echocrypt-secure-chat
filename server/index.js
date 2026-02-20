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
  },
});

// 🟢 In-memory user registry
const users = new Map();

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join", (username) => {
    users.set(socket.id, username);

    console.log(username, "joined");

    io.emit("online-users", Array.from(users.values()));
  });

  socket.on("message", (data) => {
    io.emit("message", data);
  });

  socket.on("disconnect", () => {
    const username = users.get(socket.id);

    if (username) {
      users.delete(socket.id);
      console.log(username, "disconnected");

      io.emit("online-users", Array.from(users.values()));
    }
  });
});

server.listen(5000, () => {
  console.log("Server running on port 5000");
});
