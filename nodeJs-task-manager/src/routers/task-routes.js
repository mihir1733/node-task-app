const express = require("express")
const Task = require("../models/task")
const auth = require("../middleware/auth")
const router = new express.Router()

/**
 * Create a new task.
 *
 * @name POST /tasks
 * @function
 * @async
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
router.post("/tasks", auth, async (req, res) => {
  try {
    const task = new Task({
      ...req.body,
      owner: req.user._id,
    })
    await task.save()
    res.status(201).send(task)
  } catch (error) {
    res.status(400).send("Error: " + error)
  }
})

/**
 * Get a list of tasks with optional filtering and sorting.
 *
 * @name GET /tasks
 * @function
 * @async
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
//GET /tasks?completed=true
//GET /tasks?limit=10&skip=10
//GET /tasks?sortBy=createdAt:desc
router.get("/tasks", auth, async (req, res) => {
  const match = {}
  const sort = {}

  if (req.query.completed) {
    match.completed = req.query.completed === "true"
  }

  if (req.query.sortBy) {
    const parts = req.query.sortBy.split(":")
    sort[parts[0]] = parts[1] === "desc" ? -1 : 1
  }

  try {
    await req.user.populate({
      path: "tasks",
      match,
      options: {
        limit: parseInt(req.query.limit),
        skip: parseInt(req.query.skip),
        sort,
      },
    })
    res.send(req.user.tasks)
  } catch (error) {
    res.status(500).send("Error: " + error)
  }
})

/**
 * Get a single task by its ID.
 *
 * @name GET /tasks/:id
 * @function
 * @async
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
router.get("/tasks/:id", auth, async (req, res) => {
  try {
    const _id = req.params.id
    const task = await Task.findOne({ _id, owner: req.user._id })
    !task ? res.status(404).send("No tasks found") : res.send(task)
  } catch (error) {
    res.status(500).send("Error: " + error)
  }
})

/**
 * Update a task by its ID.
 *
 * @name PATCH /tasks/:id
 * @function
 * @async
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
router.patch("/tasks/:id", auth, async (req, res) => {
  const updates = Object.keys(req.body)
  const allowedUpdates = ["description", "completed"]
  const isValidUpdate = updates.every((update) =>
    allowedUpdates.includes(update),
  )
  if (!isValidUpdate) {
    return res.status(400).send("Error: Invalid updates")
  }
  try {
    const _id = req.params.id
    const task = await Task.findOne({ _id, owner: req.user._id })
    if (!task) {
      return res.status(400).send()
    }
    updates.forEach((update) => (task[update] = req.body[update]))
    await task.save()
    res.send(task)
  } catch (error) {
    res.status(400).send("Error: " + error)
  }
})

/**
 * Delete a task by its ID.
 *
 * @name DELETE /tasks/:id
 * @function
 * @async
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
router.delete("/tasks/:id", auth, async (req, res) => {
  try {
    const _id = req.params.id
    const task = await Task.findOneAndDelete({ _id, owner: req.user._id })
    !task ? res.status(404).send() : res.send(task)
  } catch (error) {
    res.status(500).send("Error: " + error)
  }
})

module.exports = router
