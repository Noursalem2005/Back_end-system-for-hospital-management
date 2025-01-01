const sanitizeInput = (input) => {
  if (typeof input === 'string') {
    // Remove potentially dangerous characters
    return input.replace(/[<>{}]/g, '');
  }
  return input;
};

const sanitizeSqlInput = (input) => {
  if (typeof input === 'string') {
    return input.replace(/['";\\]/g, '');
  }
  return input;
};

module.exports = {
  sanitizeInput,
  sanitizeSqlInput
}; 