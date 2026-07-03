import { io } from "socket.io-client";

// const SOCKET_URL = "http://localhost:5000";
// const SOCKET_URL = "https://server-digitalmenu.onrender.com";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

let socket = null;

export const connectSocket = (token) => {
  if (socket?.connected) return socket; // متصل بالفعل

  socket = io(SOCKET_URL, {
    auth: { token: token || localStorage.getItem("token") }
  });

  socket.on("connect", () => console.log("✅ Socket.io متصل"));
  socket.on("disconnect", () => console.log("❌ Socket.io منفصل"));

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const subscribeToNewOrder = (callback) => {
  if (!socket) return;
  socket.off("newOrder"); // نزع أي استماع سابق
  socket.on("newOrder", callback);
};

export const unsubscribeFromNewOrder = () => {
  if (socket) {
    socket.off("newOrder");
  }
};
