const User = require("../models/userModel.cjs");
const bcrypt = require("bcrypt");

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // username + pass required
    if (!username || !password) {
      return res.status(400).json({
        message: "Username and password are required"
      });
    }

    // finds user
    const user = await User.findOne({
      username: username
    });

    if (!user) {
      return res.status(401).json({
        message: "Invalid username or password"
      });
    }

    // compare entered pass with stored hash
    const passwordMatch = await bcrypt.compare(
      password,
      user.passwordHash
    );

    if (!passwordMatch) {
      return res.status(401).json({
        message: "Invalid username or password"
      });
    }

    req.session.user = {
        userId: user.userId,
        username: user.username,
        role: user.role,
        sourceKey: user.sourceKey
    };

    // Successful login
    res.json({
      message: "Login successful",
      user: {
        userId: user.userId,
        username: user.username,
        role: user.role,
        sourceKey: user.sourceKey
      }
    });

  } catch (err) {
    console.error("Login error:", err.message);

    res.status(500).json({
      message: "Login failed",
      error: err.message
    });
  }
};


//simple since authGuard requires user to exist
exports.getCurrentUser = async (req, res) => {
  res.json({
    user: req.session.user
  });
};


exports.logout = async (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({
        message: "Logout failed"
      });
    }

    res.clearCookie("connect.sid");

    res.json({
      message: "Logout successful"
    });
  });
};