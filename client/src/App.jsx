import { useState } from "react";

function App() {
  const [username, setUsername] = useState("");

  const handleLogin = () => {
    if (!username.trim()) {
      alert("Please enter a username");
      return;
    }
    alert(`Logged in as ${username}`);
  };

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

