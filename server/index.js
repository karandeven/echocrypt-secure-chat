require("dotenv").config();

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const cors = require("cors");
const Message = require("./models/Message");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
});

const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const users = new Map();

/* ================= MongoDB ================= */

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => {
    console.log("MongoDB Error:", err);
    process.exit(1);
  });

/* ================= Routes ================= */

app.get("/", (req, res) => {
  res.send("EchoCrypt Server Running 🚀");
});


/* ================= Fetch Old Messages ================= */

app.get("/messages", async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: 1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});


/* ================= Socket ================= */

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join", (username) => {
    users.set(socket.id, username);
    console.log(username, "joined");
    io.emit("online-users", Array.from(users.values()));
  });

  socket.on("sendMessage", async (data) => {
    console.log("Incoming message:", data);

    try {
      const newMessage = await Message.create({
        username: data.username,
        text: data.text,
      });

      io.emit("message", newMessage);
    } catch (error) {
      console.log("Message save error:", error);
    }
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

/* ================= Start Server ================= */

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
