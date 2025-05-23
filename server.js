const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");  // <-- Importar path
const app = express();
const PORT = 3000;
const usersFilePath = path.join(__dirname, "users.txt");


app.use(cors());
app.use(express.json());

app.post("/login", (req, res) => {
  console.log("Datos recibidos:", req.body);
  const { username, password } = req.body;

  fs.readFile("users.txt", "utf-8", (err, data) => {
    if (err) {
      console.error("Error al leer users.txt", err);
      return res.status(500).json({ error: "No se pudo leer la base de datos" });
    }

    const users = data.split("\n").map(line => {
      const [u, p, r] = line.trim().split(":");
      return { username: u, password: p, role: r };
    });

    console.log("Usuarios cargados:", users); // <--- Aquí lo imprimís

let foundUser = null;
for (const u of users) {
  console.log(
    `Comparando: ${u.username.trim().toLowerCase()} === ${username.trim().toLowerCase()} && ${u.password.trim()} === ${password.trim()}`
  );
  if (
    u.username.trim().toLowerCase() === username.trim().toLowerCase() &&
    u.password.trim() === password.trim()
  ) {
    console.log("¡Usuario encontrado!");
    foundUser = u;
    break;
  }
}
if (foundUser) {
  res.json({ username: foundUser.username, role: foundUser.role });
} else {
  console.log("Usuario no encontrado");
  res.status(401).json({ error: "Credenciales incorrectas" });
}
  });
});

app.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));
