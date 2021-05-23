const express = require("express");
const app = express();
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const dbpath = path.join(__dirname, "userData.db");
let db = null;

const initializerdbserver = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`Db error ${e.message}`);
    process.exit(1);
  }
};

initializerdbserver();

app.post("/register", async (request, response) => {
  const { username, name, password, gender, location } = request.body;
  if (password.length < 5) {
    response.status = 400;
    response.send("Password is too short");
  } else {
    const hashedPass = await bcrypt.hash(password, 10);
    const verifyQuery = `select * from user where username = '${username}'`;
    dbUser = await db.get(verifyQuery);
    if (dbUser === undefined) {
      const createQuery = `
        INSERT into 
        user(username,name,password,gender,location)
        VALUES
        (
            '${username}',
            '${name}',
            '${hashedPass}',
            '${gender}',
            '${location}'
        )
        `;

      const dbResponse = await db.run(createQuery);
      response.status = 200;
      response.send(`User Created Successfully`);
    } else {
      response.status = 400;
      response.send("'User already exists");
    }
  }
});

app.post("/login", async (request, response) => {
  const { username, password } = request.body;
  const selectUser = `select * from user where username = '${username}'`;
  const dbUser = await db.get(selectUser);
  if (dbUser === undefined) {
    response.status = 400;
    response.send("Invalid user");
  } else {
    const isPasswordmatched = await bcrypt.compare(password, dbUser.password);

    if (isPasswordmatched === true) {
      response.status = 200;
      response.send("Login success!");
    } else {
      response.status = 400;
      response.send("Invalid password");
    }
  }
});

app.put("/change-password", async (request, response) => {
  const { username, oldPassword, newPassword } = request.body;
  const userfetch = `select * from user where username = '${username}'`;
  const dbUser = await db.get(userfetch);
  if (dbUser === undefined) {
    response.status(400);
    response.send("Invalid User");
  } else {
    const isPassmatched = await bcrypt.compare(oldPassword, dbUser.password);
    if (isPassmatched === true) {
      if (newPassword.length < 5) {
        response.status = 400;
        response.send("Password is too short");
      } else {
        const hashednewpass = await bcrypt.hash(newPassword, 10);
        const updatePass = `insert into 
          user(password)
          values(
            '${hashednewpass}'
          )
          `;
        const dbResponse = await db.run(updatePass);
        response.status = 200;
        response.send("Password updated");
      }
    } else {
      response.status = 400;
      response.send("Invalid current password");
    }
  }
});

module.exports = app;
