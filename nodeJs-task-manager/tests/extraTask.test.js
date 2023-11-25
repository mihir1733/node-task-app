const request = require("supertest")
const app = require("../src/app")
const Task = require("../src/models/task")
const {
  userOne,
  userOneId,
  userTwo,
  userTwoId,
  taskOne,
  taskTwo,
  taskThree,
  setupDatabase,
} = require("./fixtures/db")

beforeEach(setupDatabase)

test("Should not create task with invalid description/completed", async () => {
  await request(app)
    .post("/tasks")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send({
      completed: true,
    })
    .expect(400)
})

test("Should not update task with invalid description/completed", async () => {
  await request(app)
    .patch(`/tasks/${taskOne._id}`)
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send({
      description: "hi",
    })
    .expect(400)

  const task = await Task.findById(taskOne._id)
  expect(task.description).not.toBe("hi")
})

test("Should delete user task", async () => {
  await request(app)
    .delete(`/tasks/${taskOne._id}`)
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .expect(200)

  const task = await Task.findById(taskOne._id)
  expect(task).toBeNull()
})

test("Should not delete task if unauthenticated", async () => {
  await request(app).delete(`/tasks/${taskOne._id}`).expect(401)
})

test("Should not update other users task", async () => {
  await request(app)
    .patch(`/tasks/${taskThree._id}`)
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send({
      description: "hello",
    })
    .expect(400)
})

test("Should fetch user task by id", async () => {
  await request(app)
    .get(`/tasks/${taskOne._id}`)
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .expect(200)
})

test("Should not fetch user task by id if unauthenticated", async () => {
  await request(app).get(`/tasks/${taskOne._id}`).expect(401)
})

test("Should not fetch other users task by id", async () => {
  await request(app)
    .get(`/tasks/${taskThree._id}`)
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .expect(404)
})

test("Should fetch only completed tasks", async () => {
  await request(app)
    .get("/tasks?completed=true")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .expect(200)
})

test("Should fetch only incomplete tasks", async () => {
  await request(app)
    .get("/tasks?completed=false")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .expect(200)
})

test("Should sort tasks by description/completed/createdAt/updatedAt", async () => {
  await request(app)
    .get("/tasks?sortBy=createdAt")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .expect(200)
})

test("Should fetch only incomplete tasks", async () => {
  await request(app)
    .get("/tasks?limit=5")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .expect(200)
})
