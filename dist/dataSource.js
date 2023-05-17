"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const user_1 = require("./entities/user");
const post_1 = require("./entities/post");
const AppDataSource = new typeorm_1.DataSource({
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: process.env.PGL_USER,
    password: process.env.PGL_PASSWORD,
    database: process.env.DB_NAME2,
    logging: true,
    synchronize: true,
    entities: [user_1.User, post_1.Post],
});
exports.default = AppDataSource;
//# sourceMappingURL=dataSource.js.map