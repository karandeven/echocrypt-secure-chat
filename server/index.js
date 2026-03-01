require("dotenv").config();

const User = require("./models/User");
const bcrypt = require("bcrypt");
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const cors = require("cors");
const Message = require("./models/Message");
const jwt = require("jsonwebtoken");
const authMiddleware = require("./middleware/authMiddleware");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
});

io.use((socket, next) => {
  try {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error("Authentication error"));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = decoded; // attach user data to socket

    next();
  } catch (err) {
    next(new Error("Authentication error"));
  }
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


app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check fields
    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login successful",
      token,
      userId: user._id,
      username: user.username,
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Basic validation
    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Compare password with hashed one
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login successful",
      token,
      userId: user._id,
      username: user.username,
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/* ================= Fetch Old Messages ================= */

app.get("/messages", authMiddleware, async (req, res) => {
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

  socket.on("join", () => {
  const userId = socket.user.userId;
  users.set(socket.id, userId);

  console.log("User joined:", userId);
  io.emit("online-users", Array.from(users.values()));
});

  socket.on("sendMessage", async (data) => {
    console.log("Incoming message:", data);

    try {
      const user = await User.findById(socket.user.userId);

const newMessage = await Message.create({
  user: user._id,
  username: user.username,
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

app.post("/api/auth/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Basic validation
    if (!username || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Create new user (password not hashed yet)
    const hashedPassword = await bcrypt.hash(password, 10);

const newUser = new User({
  username,
  email,
  password: hashedPassword,
});

    await newUser.save();

    const token = jwt.sign(
  { userId: newUser._id },
  process.env.JWT_SECRET,
  { expiresIn: "7d" }
);

res.status(201).json({
  message: "User registered successfully",
  token,
  userId: newUser._id,
  username: newUser.username,
});

  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
