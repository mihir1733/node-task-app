const request = require("supertest")
const app = require("../src/app")
const User = require("../src/models/user")
const { userOne, userOneId, setupDatabase } = require("./fixtures/db")

beforeEach(setupDatabase)

test("should signup a new user", async () => {
  const response = await request(app)
    .post("/users")
    .send({
      name: "mihir",
      email: "mihir@example.com",
      password: "mypass123",
    })
    .expect(201)

  //assert that the database was changed correctly
  const user = await User.findById(response.body.user._id)
  expect(user).not.toBeNull()

  //assertions about the response
  expect(response.body).toMatchObject({
    user: {
      name: "mihir",
      email: "mihir@example.com",
    },
    token: user.tokens[0].token,
  })
  expect(user.password).not.toBe("mypass123")
})

test("Should login existing user", async () => {
  const response = await request(app)
    .post("/users/login")
    .send({
      email: userOne.email,
      password: userOne.password,
    })
    .expect(200)

  //assert that the database was changed correctly
  const user = await User.findById(response.body.user._id)
  expect(response.body.token).toBe(user.tokens[1].token)
})

test("Should not login non-existing user", async () => {
  await request(app)
    .post("/users/login")
    .send({
      email: userOne.email,
      password: "123456789",
    })
    .expect(400)
})

test("Should get profile for user", async () => {
  await request(app)
    .get("/users/me")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200)
})

test("Should not get profile for authenticated user", async () => {
  await request(app).get("/users/me").send().expect(401)
})

test("Should update valid user fields", async () => {
  await request(app)
    .patch("/users/me")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send({
      name: "John",
    })
    .expect(200)

  const user = await User.findById(userOneId)
  expect(user.name).not.toBe(userOne.name)
})

test("Should not update invalid user fields", async () => {
  await request(app)
    .patch("/users/me")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send({
      location: "America",
    })
    .expect(400)
})

test("Should delete profile for user", async () => {
  await request(app)
    .delete("/users/me")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200)
  const user = await User.findById(userOneId)
  expect(user).toBeNull()
})

test("Should not delete profile for authenticated user", async () => {
  await request(app).delete("/users/me").send().expect(401)
})

test("Should upload avatar image", async () => {
  await request(app)
    .post("/users/me/avatar")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .attach("avatar", "tests/fixtures/profile-pic.jpg")
    .expect(200)

  const user = await User.findById(userOneId)
  expect(user.avatar).toEqual(expect.any(Buffer))
})
