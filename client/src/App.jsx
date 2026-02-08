import { useState } from "react";
import Chat from "./Chat";

function App() {
  const [username, setUsername] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);

  const handleLogin = () => {
    if (!username.trim()) {
      alert("Please enter a username");
      return;
    }
    setLoggedIn(true);
  };

  const handleLogout = () => {
    setUsername("");
    setLoggedIn(false);
  };

  if (loggedIn) {
    return <Chat username={username} onLogout={handleLogout} />;
  }

  return (
    <div className="app">
      <h1>EchoCrypt</h1>

      <div className="login-box">
        <input
          type="text"
          placeholder="Enter username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <button onClick={handleLogin}>Login</button>
      </div>
    </div>
  );
}

export default App;

