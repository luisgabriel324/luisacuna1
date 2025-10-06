import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pool from "./db.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// 🏠 Ruta raíz
app.get("/", (req, res) => {
  res.send("✅ API de tareas funcionando correctamente.");
});


// ✅ POST → Crear una tarea
app.post("/tasks", async (req, res) => {
  try {
    const { title } = req.body;

    if (!title || title.trim() === "") {
      return res.status(400).json({ error: "El título no puede estar vacío" });
    }

    const result = await pool.query(
      "INSERT INTO tasks (title, completed) VALUES ($1, false) RETURNING *",
      [title]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error al crear tarea:", err.message);
    res.status(500).json({ error: err.message });
  }
});


// 📋 GET → Listar todas las tareas
app.get("/tasks", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM tasks ORDER BY id ASC");
    res.json(result.rows);
  } catch (err) {
    console.error("Error al obtener tareas:", err.message);
    res.status(500).json({ error: err.message });
  }
});


// ✏️ PUT → Actualizar una tarea por ID
app.put("/tasks/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { title, completed } = req.body;

    const result = await pool.query(
      "UPDATE tasks SET title = $1, completed = $2 WHERE id = $3 RETURNING *",
      [title, completed, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Tarea no encontrada" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error al actualizar tarea:", err.message);
    res.status(500).json({ error: err.message });
  }
});


// 🗑️ DELETE → Eliminar una tarea por ID
app.delete("/tasks/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query("DELETE FROM tasks WHERE id = $1 RETURNING *", [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Tarea no encontrada" });
    }

    res.json({ message: "✅ Tarea eliminada correctamente" });
  } catch (err) {
    console.error("Error al eliminar tarea:", err.message);
    res.status(500).json({ error: err.message });
  }
});


// 🚀 Iniciar el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

