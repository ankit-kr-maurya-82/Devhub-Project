import Room from "../models/room.model.js";

const membershipLocks = new Map();
const isMember = (room, userId) => room?.members.some((member) => member.equals(userId));

export async function withRoomMembershipLock(userId, roomId, operation) {
  const key = `${userId.toString().toLowerCase()}:${roomId.toString().toLowerCase()}`;
  const previous = membershipLocks.get(key);
  let release;
  const current = new Promise((resolve) => { release = resolve; });
  membershipLocks.set(key, current);

  if (previous) await previous;
  try {
    return await operation();
  } finally {
    release();
    if (membershipLocks.get(key) === current) membershipLocks.delete(key);
  }
}

export async function joinRoomAndRecheckMembership(socket, roomId, userId) {
  let membershipConfirmed = false;
  let membershipError;
  try {
    await socket.join(roomId);
    const currentRoom = await Room.findById(roomId).select("members");
    membershipConfirmed = isMember(currentRoom, userId);
  } catch (error) {
    membershipError = error;
  }

  if (!membershipConfirmed) {
    try {
      await socket.leave(roomId);
    } catch (cleanupError) {
      socket.disconnect(true);
      if (!membershipError) throw cleanupError;
    }
  }

  if (membershipError) throw membershipError;
  return membershipConfirmed;
}
