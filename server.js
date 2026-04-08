import express from "express";
import cors from "cors";
import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

const PORT = Number(process.env.PORT || 3001);

const pool = new Pool({
  host: process.env.PGHOST || "localhost",
  port: Number(process.env.PGPORT || 5432),
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
});

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    methods: ["GET"],
  }),
);

app.get("/api/movements", async (req, res) => {
  const { type, status, search } = req.query;
  const conditions = [];
  const values = [];
  let index = 1;

  if (type) {
    conditions.push(`type = $${index++}`);
    values.push(type);
  }

  if (status) {
    conditions.push(`status = $${index++}`);
    values.push(status);
  }

  if (search) {
    conditions.push(`(item ILIKE $${index} OR \"user\" ILIKE $${index})`);
    values.push(`%${String(search)}%`);
    index += 1;
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const query = `
    SELECT
      id,
      type,
      item,
      "user",
      date,
      time,
      status,
      return_date AS "returnDate",
      note
    FROM movements
    ${where}
    ORDER BY date DESC, time DESC, id DESC
    LIMIT 200
  `;

  try {
    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (error) {
    console.error("Erro ao buscar movimentos:", error);
    res.status(500).json({ error: "Erro ao buscar movimentos" });
  }
});

app.listen(PORT, () => {
  console.log(`Backend de movimentações rodando em http://localhost:${PORT}`);
});
