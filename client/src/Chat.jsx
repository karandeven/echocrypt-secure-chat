import { useEffect, useState, useRef } from "react";
import socket from "./socket";
import { Box, Typography, TextField } from "@mui/material";

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

    socket.emit("message", {
      user: username,
      text: input,
    });

    setInput("");
  };

  return (
    <Box
      sx={{
        height: "100vh",
        background:
          "linear-gradient(135deg, #0f172a 0%, #111827 50%, #0b1120 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 2,
      }}
    >
      <Box
        sx={{
          width: "100%",
          maxWidth: 900,
          height: "90vh",
          backdropFilter: "blur(20px)",
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: "24px",
          display: "flex",
          overflow: "hidden",
        }}
      >
        {/* Sidebar */}
        <Box
          sx={{
            width: 220,
            borderRight: "1px solid rgba(255,255,255,0.08)",
            padding: 2,
          }}
        >
          <Typography variant="subtitle1" sx={{ mb: 2 }}>
            Online ({onlineUsers.length})
          </Typography>

          {onlineUsers.map((user, index) => (
            <Typography
              key={index}
              sx={{
                mb: 1,
                opacity: user === username ? 1 : 0.7,
                fontWeight: user === username ? 600 : 400,
              }}
            >
              {user}
            </Typography>
          ))}
        </Box>

        {/* Chat Area */}
        <Box
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Box
            sx={{
              padding: 2,
              borderBottom: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <Typography variant="h6">EchoCrypt</Typography>
          </Box>

          <Box
            sx={{
              flex: 1,
              overflowY: "auto",
              padding: 3,
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            {messages.map((msg, index) => {
              const isMe = msg.user === username;

              return (
                <Box
                  key={index}
                  sx={{
                    display: "flex",
                    justifyContent: isMe
                      ? "flex-end"
                      : "flex-start",
                  }}
                >
                  <Box
                    sx={{
                      maxWidth: "65%",
                      padding: "12px 16px",
                      borderRadius: "20px",
                      background: isMe
                        ? "linear-gradient(135deg, #4f8cff, #2563eb)"
                        : "rgba(255,255,255,0.08)",
                      color: "#fff",
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{ opacity: 0.6 }}
                    >
                      {msg.user}
                    </Typography>
                    <Typography>{msg.text}</Typography>
                  </Box>
                </Box>
              );
            })}
            <div ref={messagesEndRef} />
          </Box>

          <Box
            sx={{
              padding: 2,
              display: "flex",
              gap: 1,
              borderTop: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <TextField
              fullWidth
              size="small"
              placeholder="Type a message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" && sendMessage()
              }
            />
            <Box
              onClick={sendMessage}
              sx={{
                padding: "10px 20px",
                borderRadius: "14px",
                background:
                  "linear-gradient(135deg, #4f8cff, #2563eb)",
                cursor: "pointer",
                fontWeight: 500,
              }}
            >
              Send
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default Chat;
