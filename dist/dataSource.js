"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const user_1 = require("./entities/user");
const post_1 = require("./entities/post");
const path_1 = __importDefault(require("path"));
const AppDataSource = new typeorm_1.DataSource({
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: process.env.PGL_USER,
    password: process.env.PGL_PASSWORD,
    database: process.env.DB_NAME2,
    logging: true,
    synchronize: true,
    migrations: [path_1.default.join(__dirname, './migrations/*')],
    entities: [user_1.User, post_1.Post],
});
exports.default = AppDataSource;
//# sourceMappingURL=dataSource.js.map