import Notification from "../models/notification.model.js";
import { emitNotification } from "../socket/notificationDelivery.js";

const createNotification = async ({
  recipient,
  sender,
  type,
  message,
  relatedQuestion,
  relatedAnswer,
  relatedComment,
}) => {
  if (!recipient) return null;
  if (sender && recipient.toString() === sender.toString()) return null;

  const notification = await Notification.create({
    recipient,
    sender,
    type,
    message,
    relatedQuestion,
    relatedAnswer,
    relatedComment,
  });
  emitNotification(notification);
  return notification;
};

export default createNotification;
