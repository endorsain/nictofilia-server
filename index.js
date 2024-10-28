const http = require("http");
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
//
const { db, auth } = require("./configs/firebase-admin");

const port = process.env.PORT || 3000;
const app = express();
//

app.use(bodyParser.json());
// Middleware para parsear JSON
app.use(express.json());
// Middleware para parsear bodies URL-encoded (opcional)
app.use(express.urlencoded({ extended: true }));
app.use(cors());

const server = http.createServer(app);

//
app.post("/sign-up", async (req, res) => {
  const { email, password, username } = req.body;

  try {
    // Verificar si el correo electrónico ya existe
    const userRecord = await auth.getUserByEmail(email);
    if (userRecord) {
      return res
        .status(400)
        .json({ error: "The email address is already in use." });
    }
  } catch (error) {
    if (error.code !== "auth/user-not-found") {
      return res.status(500).json({ error: "Error checking email existence." });
    }
  }

  try {
    // Verificar si el username ya existe en la colección user-status
    const userStatusDoc = await db
      .collection("user-status")
      .doc(username)
      .get();
    if (userStatusDoc.exists) {
      return res.status(400).json({ error: "The username is already in use." });
    }

    // Crear un nuevo usuario en Firebase Authentication
    const newUser = await auth.createUser({
      email,
      password,
      displayName: username,
    });
    console.log(newUser);

    // Guardar la información del usuario en la colección users usando el uid como clave del documento
    await db.collection("users").doc(newUser.uid).set({
      email,
      username,
      createdAt: new Date().toISOString(),
    });

    // Guardar el username en la colección user-status con la fecha de creación
    await db.collection("user-status").doc(username).set({
      createdAt: new Date().toISOString(),
    });

    return res.status(201).json({ message: "User created successfully." });
  } catch (error) {
    return res.status(500).json({ error: "Error creating user." });
  }
});
//

server.listen(port, () => {
  console.log(`Server corriendo en el puerto ${port}`);
});
