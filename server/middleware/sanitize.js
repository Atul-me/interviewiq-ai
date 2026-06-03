/**
 * Recursively sanitizes an object to remove keys starting with '$' or containing '.'
 * to prevent NoSQL Query Injection attacks.
 * @param {object} obj - The object to sanitize
 */
const sanitize = (obj) => {
  if (obj && typeof obj === 'object') {
    Object.keys(obj).forEach((key) => {
      // Check if key is a string and starts with '$' or contains '.'
      if (typeof key === 'string' && (key.startsWith('$') || key.includes('.'))) {
        delete obj[key];
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        sanitize(obj[key]);
      }
    });
  }
  return obj;
};

/**
 * Express middleware to sanitize request body, query params, and route params.
 */
const sanitizeMiddleware = (req, res, next) => {
  if (req.body) sanitize(req.body);
  if (req.params) sanitize(req.params);
  
  // Since req.query is a getter-only in Express v5, we mutate the object it returns in-place
  if (req.query) {
    sanitize(req.query);
  }
  
  next();
};

module.exports = sanitizeMiddleware;
