import express, { Request, Response, Router } from "express";
import db from "../db/config";

const router: Router = express.Router();

router.get("/", (_req: Request, res: Response) => {
  res.send("Institutes API");
});

router.get("/all", async (_req: Request, res: Response) => {
  try {
    const result = await db.query("SELECT * FROM institutes ORDER BY id DESC");
    res.json(result.rows);
  } catch (err: any) {
    console.error("Error fetching institutes:", err);
    res.status(500).json({ error: "Failed to fetch institutes" });
  }
});

router.get("/institute/:id", async (req: Request, res: Response) => {
  const id = req.params.id;
  try {
    const result = await db.query("SELECT * FROM institutes WHERE id = $1", [
      id,
    ]);
    res.json(result.rows[0]);
  } catch (err: any) {
    console.error("Error fetching institute:", err);
    res.status(500).json({ error: "Failed to fetch institute" });
  }
});

router.post("/institute", async (req: Request, res: Response) => {
  const { id, name, district, zone } = req.body;

  try {
    if (id) {
      const result = await db.query(
        "UPDATE institutes SET name = $1, district = $2, zone = $3 WHERE id = $4 RETURNING *",
        [name, district, zone, id]
      );
      res.json(result.rows[0]);
    } else {
      const result = await db.query(
        "INSERT INTO institutes (name, district, zone) VALUES ($1, $2, $3) RETURNING *",
        [name, district, zone]
      );
      res.json(result.rows[0]);
    }
  } catch (err: any) {
    console.error("Error saving institute:", err);
    res.status(500).json({ error: "Failed to save institute" });
  }
});

router.delete("/institute/:id", async (req: Request, res: Response) => {
  const id = req.params.id;
  try {
    await db.query("DELETE FROM institutes WHERE id = $1", [id]);
    res.json({ success: true, message: "Institute deleted" });
  } catch (err: any) {
    console.error("Error deleting institute:", err);
    res.status(500).json({ error: "Failed to delete institute" });
  }
});

export default router;
