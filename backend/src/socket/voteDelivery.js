let socketServer = null;

const setVoteSocketServer = (server) => {
  socketServer = server;
};

const emitVoteUpdate = (update) => {
  socketServer?.emit("voteUpdated", update);
};

export { emitVoteUpdate, setVoteSocketServer };
