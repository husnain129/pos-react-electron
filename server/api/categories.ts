import express, { Request, Response, Router } from "express";
import db from "../db/config";

const router: Router = express.Router();

router.get("/", (_req: Request, res: Response) => {
  res.send("Category API");
});

router.get("/all", async (_req: Request, res: Response) => {
  try {
    const result = await db.query(
      "SELECT id as _id, name, description, institute_id FROM categories ORDER BY id"
    );
    res.send(result.rows);
  } catch (err: any) {
    res.status(500).send(err.message);
  }
});

router.post("/category", async (req: Request, res: Response) => {
  const newCategory = req.body;
  try {
    const result = await db.query(
      "INSERT INTO categories (name, description, institute_id) VALUES ($1, $2, $3) RETURNING id as _id, name, description, institute_id",
      [
        newCategory.name,
        newCategory.description,
        newCategory.institute_id || null,
      ]
    );
    res.send(result.rows[0]);
  } catch (err: any) {
    res.status(500).send(err.message);
  }
});

router.delete("/category/:categoryId", async (req: Request, res: Response) => {
  try {
    await db.query("DELETE FROM categories WHERE id = $1", [
      parseInt(req.params.categoryId),
    ]);
    res.sendStatus(200);
  } catch (err: any) {
    res.status(500).send(err.message);
  }
});

router.put("/category", async (req: Request, res: Response) => {
  try {
    await db.query(
      "UPDATE categories SET name = $1, description = $2, institute_id = $3 WHERE id = $4",
      [
        req.body.name,
        req.body.description,
        req.body.institute_id || null,
        parseInt(req.body.id),
      ]
    );
    res.sendStatus(200);
  } catch (err: any) {
    res.status(500).send(err.message);
  }
});

export default router;
