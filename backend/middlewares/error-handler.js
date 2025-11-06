/**
 * Wraps an async Express route handler to catch errors and pass them to `next()`.
 *
 * @template {import('express').Request} Req
 * @template {import('express').Response} Res
 * @template {import('express').NextFunction} Next
 * @param {(req: Req, res: Res, next: Next) => Promise<any>} fn - The async route handler.
 * @returns {(req: Req, res: Res, next: Next) => void} A wrapped handler with automatic error handling.
 */
exports.asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
