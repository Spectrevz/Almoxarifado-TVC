import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { Pool } from "pg";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 3001);

const pool = new Pool({
  host: process.env.PGHOST || "localhost",
  port: Number(process.env.PGPORT || 5432),
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
});

app.use(
  cors({
    origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(",") : ["http://localhost:5173"],
    methods: ["GET"],
  }),
);

async function verifyDatabaseConnection() {
  try {
    const client = await pool.connect();
    await client.query("SELECT 1");
    client.release();
    console.log("Connected to PostgreSQL database");
  } catch (error) {
    console.error("Error connecting to PostgreSQL database:", error);
    process.exit(1);
  }
}

verifyDatabaseConnection();

app.get("/api/movements", async (req: express.Request, res: express.Response) => {
  const type = typeof req.query.type === "string" ? req.query.type : undefined;
  const status = typeof req.query.status === "string" ? req.query.status : undefined;
  const search = typeof req.query.search === "string" ? req.query.search : undefined;

  const conditions: string[] = [];
  const values: string[] = [];
  let index = 1;

  if (type === "saída") {
    conditions.push(`m.dataDevolucao IS NULL`);
  } else if (type === "entrada") {
    conditions.push(`m.dataDevolucao IS NOT NULL`);
  }

  if (status === "ativa") {
    conditions.push(`m.dataDevolucao IS NULL`);
  } else if (status === "concluída") {
    conditions.push(`m.dataDevolucao IS NOT NULL`);
  }

  if (search) {
    conditions.push(`(k.nome ILIKE $${index} OR m.responsavelSaida ILIKE $${index} OR m.responsavelRetorno ILIKE $${index})`);
    values.push(`%${search}%`);
    index += 1;
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const sql = `
    SELECT
      m.id,
      CASE
        WHEN m.dataDevolucao IS NULL THEN 'saída'
        ELSE 'entrada'
      END AS type,
      k.nome AS item,
      CASE
        WHEN m.dataDevolucao IS NOT NULL THEN COALESCE(m.responsavelRetorno, m.responsavelSaida)
        ELSE COALESCE(m.responsavelSaida, '')
      END AS "user",
      CASE
        WHEN m.dataDevolucao IS NULL THEN m.dataSaida
        ELSE m.dataDevolucao
      END AS date,
      CASE
        WHEN m.dataDevolucao IS NULL THEN m.horaSaida
        ELSE m.horaDevolucao
      END AS time,
      CASE
        WHEN m.dataDevolucao IS NULL THEN 'ativa'
        ELSE 'concluída'
      END AS status,
      m.dataDevolucao AS "returnDate",
      m.observacao AS note
    FROM "Movimentacao" m
    JOIN "Kit" k ON k.id = m.kitId
    ${whereClause}
    ORDER BY date DESC, time DESC, m.id DESC
    LIMIT 500
  `;

  try {
    const result = await pool.query(sql, values);
    res.json(result.rows);
  } catch (error) {
    console.error("Erro ao buscar movimentos:", error);
    res.status(500).json({ error: "Erro ao buscar movimentos" });
  }
});

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`Backend TypeScript rodando em http://localhost:${PORT}`);
});
