import { useState } from "react";
import Chat from "./Chat";
import Login from "./Login";
import Register from "./Register";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem("token")
  );
  const [showRegister, setShowRegister] = useState(false);

  if (isLoggedIn) {
    return <Chat />;
  }

  if (showRegister) {
    return (
      <Register
        onRegister={() => setIsLoggedIn(true)}
        switchToLogin={() => setShowRegister(false)}
      />
    );
  }

  return (
    <Login
      onLogin={() => setIsLoggedIn(true)}
      switchToRegister={() => setShowRegister(true)}
    />
  );
}

export default App;