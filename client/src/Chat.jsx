import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

function Chat({ username, onLogout }) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    socket.emit("join", username);

    socket.on("receive-message", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    return () => {
      socket.off("receive-message");
    };
  }, [username]);

  const sendMessage = () => {
    if (!message.trim()) return;

    const msgData = {
      user: username,
      text: message,
    };

    socket.emit("send-message", msgData);
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

