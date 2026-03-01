import { useEffect, useState, useRef } from "react";
import { connectSocket, getSocket } from "./socket";
import { Box, Typography, TextField, Button } from "@mui/material";

function Chat() {
  const username = localStorage.getItem("username") || "guest";

  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [input, setInput] = useState("");

  const messagesEndRef = useRef(null);

  useEffect(() => {
  const token = localStorage.getItem("token");

  fetch("http://localhost:5000/messages", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((res) => res.json())
    .then((data) => {
      if (Array.isArray(data)) {
        setMessages(data);
      } else if (
        data.message === "No token provided" ||
        data.message === "Unauthorized"
      ) {
        localStorage.removeItem("token");
        localStorage.removeItem("username");
        window.location.reload();
      } else {
        setMessages([]);
      }
    })
    .catch((err) => console.error("Fetch error:", err));

  const socket = connectSocket();
  if (!socket) return;

  socket.on("connect_error", () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    window.location.reload();
  });

  socket.emit("join");

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
}, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim()) return;

    const socket = getSocket();
if (!socket) return;

socket.emit("sendMessage", {
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
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
  <Typography variant="h5">EchoCrypt</Typography>

  <Button
    variant="outlined"
    color="error"
    onClick={() => {
      localStorage.removeItem("token");
      localStorage.removeItem("username");
      window.location.reload();
    }}
  >
    Logout
  </Button>
</Box>

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