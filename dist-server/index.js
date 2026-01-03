"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const categories_1 = __importDefault(require("./api/categories"));
const customers_1 = __importDefault(require("./api/customers"));
const institutes_1 = __importDefault(require("./api/institutes"));
const inventory_1 = __importDefault(require("./api/inventory"));
const settings_1 = __importDefault(require("./api/settings"));
const transactions_1 = __importDefault(require("./api/transactions"));
const users_1 = __importDefault(require("./api/users"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 8001;
app.use((0, cors_1.default)());
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: false }));
app.get("/", (req, res) => {
    res.send("Creative Hands POS Server Online.");
});
app.use("/api/inventory", inventory_1.default);
app.use("/api/categories", categories_1.default);
app.use("/api/users", users_1.default);
app.use("/api/transactions", transactions_1.default);
app.use("/api/institutes", institutes_1.default);
app.use("/api/customers", customers_1.default);
app.use("/api/settings", settings_1.default);
app.listen(PORT, () => {
    console.log(`Server listening on PORT ${PORT}`);
    console.log(`API available at http://localhost:${PORT}/api`);
});
exports.default = app;
