const http = require("http");
const express = require("express");
/* const bodyParser = require('body-parser'); */
const cors = require("cors");
//
const { db, auth } = require("./config/firebase-config");

const port = process.env.PORT || 3000;
const app = express();
//

/* app.use(bodyParser.json()); */
// Middleware para parsear JSON
app.use(express.json());
// Middleware para parsear bodies URL-encoded (opcional)
app.use(express.urlencoded({ extended: true }));
app.use(cors());

const server = http.createServer(app);

//
app.get("/account", async (req, res) => {
  try {
    const doc = await db.collection("test").doc("pVMfwwYPRlbGT7SQIIoq").get();
    if (!doc.exists) {
      console.log("esto es server", doc);
      res.status(404).send("No se encontró el documento");
    } else {
      res.status(200).send(doc.data());
    }
  } catch (error) {
    res.status(500).send("Error al obtener el documento: " + error.message);
  }
});
//

server.listen(port, () => {
  console.log(`Server corriendo en el puerto ${port}`);
});
