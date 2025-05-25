const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();


const partsPath = path.join(__dirname, '../parts.txt');

// DELETE /api/parts/:id
router.delete('/:id', (req, res) => {
  const idToDelete = req.params.id;

  fs.readFile(partsPath, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ message: 'Error leyendo archivo' });

    const lines = data.trim().split('\n').filter(Boolean);
    const parts = [];
    for (const line of lines) {
      try {
        parts.push(JSON.parse(line));
      } catch (e) {
        console.warn("Línea inválida ignorada:", line);
      }
    }

    const newParts = parts.filter(p => p.id !== idToDelete);

    if (newParts.length === parts.length) {
      return res.status(404).json({ message: 'Repuesto no encontrado' });
    }

    const newData = newParts.map(p => JSON.stringify(p)).join('\n') + '\n';

    fs.writeFile(partsPath, newData, 'utf8', (err) => {
      if (err) return res.status(500).json({ message: 'Error escribiendo archivo' });

      res.json({ message: 'Compra realizada' });
    });
  });
});

module.exports = router;