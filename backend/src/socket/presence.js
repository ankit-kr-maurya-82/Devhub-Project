const userSockets = new Map();

const addUserSocket = (userId, socketId) => {
  const key = String(userId);
  let sockets = userSockets.get(key);
  const isFirstSocket = !sockets;
  if (!sockets) {
    sockets = new Set();
    userSockets.set(key, sockets);
  }
  sockets.add(socketId);
  return isFirstSocket;
};

const removeUserSocket = (userId, socketId) => {
  const key = String(userId);
  const sockets = userSockets.get(key);
  if (!sockets) return false;
  sockets.delete(socketId);
  if (sockets.size > 0) return false;
  userSockets.delete(key);
  return true;
};

const isUserOnline = (userId) => (userSockets.get(String(userId))?.size ?? 0) > 0;
const getOnlineUserIds = () => [...userSockets.keys()];

export { addUserSocket, removeUserSocket, isUserOnline, getOnlineUserIds };
