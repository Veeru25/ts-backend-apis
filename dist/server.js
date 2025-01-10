"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
// import cors from 'cors';
const dotenv_1 = __importDefault(require("dotenv"));
const db_Config_1 = __importDefault(require("./config/db.Config"));
dotenv_1.default.config();
(0, db_Config_1.default)();
const PORT = 6000;
const app = (0, express_1.default)();
// app.get('/',(req,res)=>{
//     res.send("Hello")
// }
app.get('/', (req, res) => {
    res.send("Hello");
});
app.listen(PORT, () => {
    console.log(`STARTED ${PORT}`);
});
