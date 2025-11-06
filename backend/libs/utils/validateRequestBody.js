exports.validateRequestBody = (requestBody, keys) => {
  if (!requestBody || typeof requestBody !== "object" || !Array.isArray(keys)) {
    return false;
  }

  return keys.every((key) =>
    Object.prototype.hasOwnProperty.call(requestBody, key)
  );
};
