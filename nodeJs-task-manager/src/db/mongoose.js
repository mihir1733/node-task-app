const mongoose = require("mongoose")

/**
 * Establish a connection to the MongoDB database.
 * @async
 * @function
 * @throws {Error} If there's an error connecting to the database.
 */
async function dbConnection() {
  try {
    /**
     * Connect to the MongoDB database using the provided URL.
     * @function
     * @param {string} process.env.MONGODB_URL - The MongoDB connection URL.
     * @param {Object} options - Additional connection options.
     * @param {boolean} options.useNewUrlParser - Whether to use the new URL parser.
     */
    // eslint-disable-next-line no-undef
    await mongoose.connect(process.env.MONGODB_URL, {
      useNewUrlParser: true,
    })

    // If the connection is successful, log a message
    console.log("Connected to the database...")
  } catch (error) {
    // If there is an error during the connection attempt, log the error
    console.log(error)
  }
}

// Export the dbConnection function for use in other parts of the application
module.exports = dbConnection
