import { useEffect, useState } from "react";
import socket from "./socket";

function Chat({ username, onLogout }) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  // 🔒 JOIN ONCE (critical)
  useEffect(() => {
    socket.emit("join", username);

    const handleMessage = (data) => {
      setMessages((prev) => [...prev, data]);
    };

    socket.on("message", handleMessage);

    return () => {
      socket.off("message", handleMessage);
    };
  }, [username]);

  const sendMessage = () => {
    if (!message.trim()) return;

    socket.emit("message", {
      user: username,
      text: message,
    });

    setMessage("");
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <span>EchoCrypt</span>
        <button onClick={onLogout}>Logout</button>
      </div>

      <div className="chat-messages">
        {messages.length === 0 && (
          <p className="empty">No messages yet</p>
        )}

        {messages.map((msg, index) => (
          <div key={index} className="chat-message">
            <strong>{msg.user}:</strong> {msg.text}
          </div>
        ))}
      </div>

      <div className="chat-input">
        <input
          type="text"
          placeholder="Type a message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}

export default Chat;

