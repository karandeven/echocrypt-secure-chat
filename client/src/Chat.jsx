import { useEffect, useState, useRef } from "react";
import socket from "./socket";
import { Box, Typography, TextField, Button } from "@mui/material";

function Chat() {
  const username = localStorage.getItem("username") || "guest";

  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [input, setInput] = useState("");

  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Fetch old messages
    fetch("http://localhost:5000/messages")
      .then((res) => res.json())
      .then((data) => {
        setMessages(data);
      })
      .catch((err) => console.error("Fetch error:", err));

    socket.emit("join", username);

    socket.on("message", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    socket.on("online-users", (users) => {
      setOnlineUsers(users);
    });

    return () => {
      socket.off("message");
      socket.off("online-users");
    };
  }, [username]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim()) return;

    socket.emit("sendMessage", {
      username,
      text: input,
    });

    setInput("");
  };

  return (
    <Box sx={{ height: "100vh", display: "flex" }}>
      {/* Online Users */}
      <Box sx={{ width: "20%", borderRight: "1px solid gray", p: 2 }}>
        <Typography variant="h6">Online ({onlineUsers.length})</Typography>
        {onlineUsers.map((user, index) => (
          <Typography key={index}>{user}</Typography>
        ))}
      </Box>

      {/* Chat Area */}
      <Box sx={{ flex: 1, p: 2, display: "flex", flexDirection: "column" }}>
        <Typography variant="h5">EchoCrypt</Typography>

        <Box sx={{ flex: 1, overflowY: "auto", my: 2 }}>
          {messages.map((msg, index) => (
            <Typography key={index}>
              <strong>{msg.username}:</strong> {msg.text}
            </Typography>
          ))}
          <div ref={messagesEndRef} />
        </Box>

        <Box sx={{ display: "flex", gap: 1 }}>
          <TextField
            fullWidth
            placeholder="Type a message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <Button variant="contained" onClick={sendMessage}>
            Send
          </Button>
        </Box>
      </Box>
    </Box>
  );
}

export default Chat;