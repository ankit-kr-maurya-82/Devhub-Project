const SAFE_ERROR_NAME = /^[A-Za-z][A-Za-z0-9]{0,63}$/;

export function logSafeError(context, error) {
  const name = error instanceof Error && SAFE_ERROR_NAME.test(error.name)
    ? error.name
    : "Error";
  console.error(context, { errorType: name });
}
