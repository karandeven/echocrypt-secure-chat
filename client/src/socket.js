import { io } from "socket.io-client";

const SOCKET_URL = "http://localhost:5000";

let socket = null;

export const connectSocket = () => {
  const token = localStorage.getItem("token");

  if (!token) {
    console.warn("No token found. Socket not connected.");
    return null;
  }

  socket = io(SOCKET_URL, {
    transports: ["websocket"],
    auth: {
      token: token,
    },
  });

  return socket;
};

export const getSocket = () => socket;