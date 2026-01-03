import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import categoriesRouter from "./api/categories";
import customersRouter from "./api/customers";
import institutesRouter from "./api/institutes";
import inventoryRouter from "./api/inventory";
import settingsRouter from "./api/settings";
import transactionsRouter from "./api/transactions";
import usersRouter from "./api/users";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8001;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get("/", (req, res) => {
  res.send("Creative Hands POS Server Online.");
});

app.use("/api/inventory", inventoryRouter);
app.use("/api/categories", categoriesRouter);
app.use("/api/users", usersRouter);
app.use("/api/transactions", transactionsRouter);
app.use("/api/institutes", institutesRouter);
app.use("/api/customers", customersRouter);
app.use("/api/settings", settingsRouter);

app.listen(PORT, () => {
  console.log(`Server listening on PORT ${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api`);
});

export default app;
