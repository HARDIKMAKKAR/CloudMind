const jwt = require("jsonwebtoken");

const User =
  require("../models/User");

const JWT_SECRET =
  "cloudmind_secret_key";

async function auth(
  req,
  res,
  next
) {

  try {

    /* -----------------------------
       GET TOKEN
    ----------------------------- */

    const authHeader =
      req.headers.authorization;

    if (!authHeader) {

      return res.status(401).json({
        error:
          "No token provided"
      });

    }

    /* -----------------------------
       EXTRACT TOKEN
    ----------------------------- */

    const token =
      authHeader.split(" ")[1];

    if (!token) {

      return res.status(401).json({
        error:
          "Invalid token format"
      });

    }

    /* -----------------------------
       VERIFY TOKEN
    ----------------------------- */

    const decoded =
      jwt.verify(
        token,
        JWT_SECRET
      );

    /* -----------------------------
       FIND USER
    ----------------------------- */

    const user =
      await User.findById(
        decoded.id
      ).select("-password");

    if (!user) {

      return res.status(401).json({
        error:
          "User not found"
      });

    }

    /* -----------------------------
       ATTACH USER
    ----------------------------- */

    req.user = user;

    next();

  } catch (err) {

    res.status(401).json({
      error:
        "Unauthorized"
    });

  }

}

module.exports = auth;