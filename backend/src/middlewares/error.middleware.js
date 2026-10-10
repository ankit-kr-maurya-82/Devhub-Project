const handleJsonParseError = (error, req, res, next) => {
  if (error.type === "entity.parse.failed" && error.status === 400) {
    return res.status(400).json({
      message:
        "Invalid JSON body. Use double-quoted property names and strings, and remove trailing commas.",
    });
  }

  return next(error);
};

const handleError = (error, req, res, next) => {
  if (res.headersSent) return next(error);
  const status = Number.isInteger(error.status) && error.status >= 400 && error.status < 500 ? error.status : 500;
  if (process.env.NODE_ENV !== "production") console.error("Request error:", error.message);
  return res.status(status).json({ success: false, message: status === 500 ? "Internal server error" : (error.message || "Request failed") });
};

export { handleJsonParseError, handleError };
