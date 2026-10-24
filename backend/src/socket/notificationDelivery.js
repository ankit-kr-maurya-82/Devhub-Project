let socketServer = null;

const setNotificationSocketServer = (server) => {
  socketServer = server;
};

const emitNotification = (notification) => {
  if (!socketServer || !notification?.recipient || !notification?._id) return;

  const idOf = (value) => value?._id?.toString() || value?.toString();
  socketServer.to(`user:${idOf(notification.recipient)}`).emit("notificationCreated", {
    _id: idOf(notification._id),
    type: notification.type,
    message: notification.message,
    relatedQuestion: idOf(notification.relatedQuestion),
    relatedAnswer: idOf(notification.relatedAnswer),
    relatedComment: idOf(notification.relatedComment),
    isRead: Boolean(notification.isRead),
    createdAt: notification.createdAt,
  });
};

export { emitNotification, setNotificationSocketServer };
