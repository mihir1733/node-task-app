const express = require("express")
const dbConnection = require("./db/mongoose")
const userRoutes = require("./routers/user-routes")
const taskRoutes = require("./routers/task-routes")

/**
 * Creates and configures an Express application.
 * @type {express.Application}
 */
const app = express()

// Connect to the database
dbConnection()

// Parse incoming JSON data
app.use(express.json())

// Configure user routes
app.use(userRoutes)

// Configure task routes
app.use(taskRoutes)

module.exports = app
