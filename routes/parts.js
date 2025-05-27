const express = require("express");
const fs = require("fs");
const path = require("path");
const router = express.Router();
const partsFilePath = path.join(__dirname, "../parts.txt");

// Obtener todas las partes (ya lo tenés probablemente)
router.get("/", (req, res) => {
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
      }
    }

    res.json(parts);
  });
});

// 💥 Nueva ruta para eliminar parte por ID
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const data = await fs.promises.readFile(partsFilePath, "utf8");
    const lines = data.trim().split("\n").filter(Boolean);

    const updatedLines = lines.filter(line => {
      try {
        const part = JSON.parse(line);
        return part.id !== id;
      } catch {
        return true;
      }
    });

    await fs.promises.writeFile(partsFilePath, updatedLines.join("\n") + "\n");

    res.status(200).json({ message: "Parte eliminada correctamente" });
  } catch (err) {
    console.error("Error al eliminar parte:", err);
    res.status(500).json({ error: "Error al eliminar parte" });
  }
});

module.exports = router;