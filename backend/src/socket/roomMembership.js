import Room from "../models/room.model.js";

const isMember = (room, userId) => room?.members.some((member) => member.equals(userId));

export async function joinRoomAndRecheckMembership(socket, roomId, userId) {
  await socket.join(roomId);
  let membershipConfirmed = false;
  try {
    const currentRoom = await Room.findById(roomId).select("members");
    membershipConfirmed = isMember(currentRoom, userId);
    return membershipConfirmed;
  } finally {
    if (!membershipConfirmed) await socket.leave(roomId);
  }
}
