"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const post_1 = require("./entities/post");
const path_1 = __importDefault(require("path"));
exports.default = {
    migrations: {
        path: path_1.default.join(__dirname, './migrations'),
        glob: '!(*.d).{js,ts}',
    },
    entities: [post_1.Post],
    user: process.env.PGL_USER,
    port: 5432,
    dbName: process.env.DB_NAME,
    password: process.env.PGL_PASSWORD,
    type: 'postgresql',
    debug: process.env.DEV_ENV !== 'production',
    allowGlobalContext: true,
};
//# sourceMappingURL=mikro-orm.config.js.map