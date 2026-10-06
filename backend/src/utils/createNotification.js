import Notification from "../models/notification.model.js";

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

  return Notification.create({
    recipient,
    sender,
    type,
    message,
    relatedQuestion,
    relatedAnswer,
    relatedComment,
  });
};

export default createNotification;
