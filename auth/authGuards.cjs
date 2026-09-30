exports.requireLogin = (req, res, next) => {
  if (!req.session || !req.session.user) {
    return res.status(401).json({
      message: "Authentication required"
    });
  }

  next();
};

exports.requireRole = (role) => {
  return (req, res, next) => {
    if (!req.session || !req.session.user) {
      return res.status(401).json({
        message: "Authentication required"
      });
    }

    if (req.session.user.role !== role) {
      return res.status(403).json({
        message: "Access denied"
      });
    }

    next();
  };
};