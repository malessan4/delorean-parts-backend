const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");  // <-- Importar path
const app = express();
const PORT = 3000;
const usersFilePath = path.join(__dirname, "users.txt");
const partsFilePath = path.join(__dirname, "parts.txt");
const bcrypt = require("bcrypt");
const partsRouter = require('./routes/parts');
const { v4: uuidv4 } = require('uuid');
const id = uuidv4();



app.use(cors());
app.use(express.json());
app.use('/api/parts', partsRouter);


// Logica para crear usuario
app.post("/register", async (req, res) => {
  const { username, password, role } = req.body;

  if (!username || !password || !role) {
    return res.status(400).json({ error: "Faltan campos obligatorios" });
  }

  try {
    const data = await fs.promises.readFile(usersFilePath, "utf-8");
    const users = data.split("\n").filter(Boolean).map(line => {
      const [u] = line.trim().split(":");
      return u;
    });

    if (users.includes(username)) {
      return res.status(409).json({ error: "El usuario ya existe" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newLine = `${username}:${hashedPassword}:${role}\n`;

    await fs.promises.appendFile(usersFilePath, newLine);
    res.status(201).json({ message: "Usuario registrado correctamente" });

  } catch (err) {
    console.error("Error al registrar", err);
    res.status(500).json({ error: "Ocurrio un error al registrar el usuario" });
  }
});

// Logica para login
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const data = await fs.promises.readFile(usersFilePath, "utf-8");

    const users = data.split("\n").filter(Boolean).map(line => {
      const [u, p, r] = line.trim().split(":");
      return { username: u, password: p, role: r };
    });

    const user = users.find(u => u.username.trim().toLowerCase() === username.trim().toLowerCase());

    if (!user) {
      return res.status(401).json({ error: "Usuario no encontrado" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (passwordMatch) {
      res.json({ username: user.username, role: user.role });
    } else {
      res.status(401).json({ error: "Contraseña incorrecta" });
    }

  } catch (err) {
    console.error("Error en login:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

app.post("/publish-part", async (req, res) => {

  const { name, description, price, seller } = req.body;

  if (!name || !price || !seller) {
    return res.status(400).json({ error: "Faltan datos del repuesto" });
  }

  const numericPrice = Number(price);

  if (isNaN(numericPrice)) {
    return res.status(400).json({ error: "Precio inválido" });
  }
  const id = uuidv4();
  const partLine = JSON.stringify({ id, name, description, price, seller }) + "\n";

  try {
    await fs.promises.appendFile(partsFilePath, partLine);
    res.status(201).json({ message: "Repuesto guardado correctamente" });
  } catch (err) {
    console.error("Error al guardar el repuesto:", err);
    res.status(500).json({ error: "Error al guardar el repuesto" });
  }
});

app.get("/parts", (req, res) => {
  fs.readFile(partsFilePath, "utf8", (err, data) => {
    if (err) return res.status(500).json({ error: "No se pudo leer archivo" });

    const lines = data.trim().split("\n").filter(Boolean);
    const parts = [];

    for (const line of lines) {
      try {
        const part = JSON.parse(line);
        parts.push(part);
      } catch (e) {
        console.warn("Línea inválida ignorada:", line);
        // Podés también registrar esto en un archivo si querés
      }
    }

    res.json(parts);
  });
});

app.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));
