const express = require("express");
const path = require("path");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
const bcrypt = require("bcrypt");
const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "userData.db");

let db = null;
const connectDbServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("successfully run http://");
    });
  } catch (e) {
    console.log(`error: ${e.message}`);
    process.exit(1);
  }
};
connectDbServer();

app.post("/register", async (request, response) => {
  const { username, name, password, gender, location } = request.body;
  const hashPassword = await bcrypt.hash(password, 10);
  const dbObject = `SELECT * FROM user WHERE username = '${username}';`;
  const dbuser = await db.get(dbObject);
  if (dbuser === undefined) {
    if (password.length > 4) {
      const dbObjects = `INSERT INTO user (username,name,password,gender,location) VALUES('${username}','${name}','${hashPassword}','${gender}','${location}');`;
      await db.run(dbObjects);
      response.status(200);
      response.send("User created successfully");
    } else {
      response.status(400);
      response.send("Password is too short");
    }
  } else {
    response.status(400);
    response.send("User already exists");
  }
});

// login

app.post("/login", async (request, response) => {
  const { username, password } = request.body;
  const first = `SELECT * FROM user WHERE username = '${username}';`;
  const correctUser = await db.get(first);
  if (correctUser === undefined) {
    response.status(400);
    response.send("Invalid user");
  } else {
    const ispossword = await bcrypt.compare(password, correctUser.password);
    if (ispossword == true) {
      response.status(200);
      response.send("Login success!");
    } else {
      response.status(400);
      response.send("Invalid password");
    }
  }
});

// change-password

app.put("/change-password", async (request, response) => {
  const { username, oldPassword, newPassword } = request.body;
  const first = `SELECT * FROM user WHERE username = '${username}';`;
  const correctUser = await db.get(first);
  if (correctUser !== undefined) {
    const ispossword = await bcrypt.compare(oldPassword, correctUser.password);
    if (ispossword == true) {
      if (newPassword.length > 5) {
        const hashPassword = await bcrypt.hash(newPassword, 10);
        const dbfin = `UPDATE user SET password = '${hashPassword}';`;
        await db.run(dbfin);
        response.status(200);
        response.send("Password updated");
      } else {
        response.status(400);
        response.send("Password is too short");
      }
    } else {
      response.status(400);
      response.send("Invalid current password");
    }
  } else {
    response.status(400);
    response.send("Invalid user");
  }
});

// app.get("/register", async (request, response) => {
//   const dbObject = `SELECT * FROM user;`;
//   const final = await db.all(dbObject);
//   response.send(final);
// });
module.exports = app;
