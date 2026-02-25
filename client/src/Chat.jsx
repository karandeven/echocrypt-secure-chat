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
      username: username,
      text: input,
    });

    setInput("");
  };

  return (
    <Box sx={{ display: "flex", height: "100vh" }}>
      <Box sx={{ width: "250px", borderRight: "1px solid #ccc", p: 2 }}>
        <Typography variant="h6">Online ({onlineUsers.length})</Typography>
        {onlineUsers.map((user, index) => (
          <Typography key={index}>{user}</Typography>
        ))}
      </Box>

      <Box sx={{ flex: 1, display: "flex", flexDirection: "column", p: 2 }}>
        <Typography variant="h5" gutterBottom>
          EchoCrypt
        </Typography>

        <Box sx={{ flex: 1, overflowY: "auto", mb: 2 }}>
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
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
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
