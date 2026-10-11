// Deliberately has no local execution fallback. A trusted, isolated runner must
// be configured before submitted source code can be compiled or executed.
const judgeService = {
  isAvailable: () => false,
  unavailableResult: () => ({
    verdict: "unavailable",
    executionMetadata: {
      status: "unavailable",
      executed: false,
      message: "Code execution is unavailable until a secure isolated judge service is configured.",
    },
  }),
};

export default judgeService;
