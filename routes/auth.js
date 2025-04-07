const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  // Get the token from the Authorization header
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ message: "Access denied. No token provided or invalid format." });
  }

  // Extract the token (remove 'Bearer ' prefix)
  const token = authHeader.split(" ")[1];

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Add the user data to the request object
    req.user = decoded;

    // Debug log
    console.log("Token verified successfully. User ID:", decoded.id);

    next();
  } catch (error) {
    console.error("Token verification failed:", error.message);
    return res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = { verifyToken };
