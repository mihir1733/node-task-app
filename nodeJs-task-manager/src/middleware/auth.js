const jwt = require("jsonwebtoken")
const User = require("../models/user")

/**
 * Middleware for user authentication using JSON Web Tokens (JWT).
 *
 * @async
 * @function
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {function} next - Next middleware function.
 */
async function auth(req, res, next) {
  try {
    // Extract the JWT token from the Authorization header
    const token = req.header("Authorization").replace("Bearer ", "")

    // Verify the JWT token using the secret key
    // eslint-disable-next-line no-undef
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // Find the user associated with the token
    const user = await User.findOne({ _id: decoded._id, "tokens.token": token })

    // If no user is found, throw an error
    if (!user) {
      throw new Error()
    }

    // Attach the token and user object to the request for further use
    req.token = token
    req.user = user

    // Continue to the next middleware or route
    next()
  } catch (error) {
    // Send a 401 Unauthorized response if authentication fails
    res.status(401).send("Error: Please authenticate.")
  }
}

module.exports = auth
