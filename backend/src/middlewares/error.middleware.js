const handleJsonParseError = (error, req, res, next) => {
  if (error.type === "entity.parse.failed" && error.status === 400) {
    return res.status(400).json({
      message:
        "Invalid JSON body. Use double-quoted property names and strings, and remove trailing commas.",
    });
  }

  return next(error);
};

export { handleJsonParseError };
