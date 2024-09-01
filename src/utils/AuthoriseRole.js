// middleware/authorizeRoles.js
export function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    const user = req.user; // Ensure that user is attached to req in authentication middleware
    console.log(user);
    if (!user || !allowedRoles.includes(user.role)) {
      return res.status(403).json({
        message: "Forbidden: You do not have the required permission.",
      });
    }
    next();
  };
}
