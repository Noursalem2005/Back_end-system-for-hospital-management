const { poolPromise, sql } = require('../config/db');

const sanitizeInput = (input) => {
  if (typeof input === 'string') {
    // Remove SQL injection patterns
    return input.replace(/['";\\]/g, '');
  }
  return input;
};

const withTransaction = async (callback) => {
  const pool = await poolPromise;
  const transaction = new sql.Transaction(pool);

  try {
    await transaction.begin();
    
    // Create a proxy for the transaction to sanitize inputs
    const secureTransaction = new Proxy(transaction, {
      get: (target, prop) => {
        if (prop === 'request') {
          return () => {
            const request = target.request();
            const originalInput = request.input;
            
            request.input = (name, type, value) => {
              return originalInput.call(request, name, type, sanitizeInput(value));
            };
            
            return request;
          };
        }
        return target[prop];
      }
    });

    const result = await callback(secureTransaction);
    await transaction.commit();
    return result;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

module.exports = { withTransaction }; 