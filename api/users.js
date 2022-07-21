const express = require("express");
const jwt = require("jsonwebtoken")
const usersRouter = express.Router();
const { getAllUsers,getUserByUsername, createUser } = require('../db');



usersRouter.use((req, res, next) => {
  console.log("A request is being made to /users");

  next(); // THIS IS DIFFERENT
});

usersRouter.get("/", async (req, res) => {
  const users = await getAllUsers();
  res.send({
    users,
  });
});

usersRouter.post("/login", async (req, res, next) => {
  const { username, password } = req.body;

  // request must have both
  if (!username || !password) {
    next({
      name: "MissingCredentialsError",
      message: "Please supply both a username and password",
    });
  }

  try {
    const user = await getUserByUsername(username);
    console.log(user)
    if (user && user.password == password) {
      // create token & return to user
      // let id = user.id;
      // let usern = user.username;
      console.log(user.id, user.username);
      const signedtoken = jwt.sign({ id: user.id, username }, process.env.JWT_SECRET);
      console.log(signedtoken);
      // curl http://localhost:3000/api -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NSwidXNlcm5hbWUiOiJzeXp5Z3lzIiwiaWF0IjoxNjU4NDE3MDk0LCJleHAiOjE2NTkwMjE4OTR9.T5QjBhGwrXzR_GTXlMj9tEIZitEp9vD3j8FfFP7ctIM'

      // localStorage.setItem("jwttoken", signedtoken)
      res.send({ message: "you're logged in!", token: `${signedtoken}` });
    } else {
      next({
        name: "IncorrectCredentialsError",
        message: "Username or password is incorrect",
      });
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});

usersRouter.post("/register", async (req, res, next) => {
  const { username, password, name, location } = req.body;

  try {
    const _user = await getUserByUsername(username);

    if (_user) {
      next({
        name: "UserExistsError",
        message: "A user by that username already exists",
      });
    }

    const user = await createUser({
      username,
      password,
      name,
      location,
    });

    const token = jwt.sign(
      {
        id: user.id,
        username,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1w",
      }
    );

    res.send({
      message: "thank you for signing up",
      token,
    });
  } catch ({ name, message }) {
    next({ name, message });
  }
});

module.exports = usersRouter;
