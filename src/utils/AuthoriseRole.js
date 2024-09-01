export function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    const user = req.user;
    console.log(user);
    if (!user || !allowedRoles.includes(user.role)) {
      return res.status(403).json({
        message: "Forbidden: You do not have the required permission.",
      });
    }
    next();
  };
}
