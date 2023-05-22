"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserResolver = void 0;
const user_1 = require("../entities/user");
const type_graphql_1 = require("type-graphql");
const argon2_1 = __importDefault(require("argon2"));
const UsernamePasswordOption_1 = require("../types/UsernamePasswordOption");
const validateUserRegister_1 = require("../utils/validateUserRegister");
const sendEmail_1 = require("../utils/sendEmail");
const template_1 = require("../utils/template");
const uuid_1 = require("uuid");
const dotenv = __importStar(require("dotenv"));
const dataSource_1 = __importDefault(require("../dataSource"));
dotenv.config({ path: __dirname + '/.env' });
let FieldError = class FieldError {
};
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", String)
], FieldError.prototype, "field", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", String)
], FieldError.prototype, "message", void 0);
FieldError = __decorate([
    (0, type_graphql_1.ObjectType)()
], FieldError);
let UserResponse = class UserResponse {
};
__decorate([
    (0, type_graphql_1.Field)(() => [FieldError], { nullable: true }),
    __metadata("design:type", Array)
], UserResponse.prototype, "errors", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => user_1.User, { nullable: true }),
    __metadata("design:type", user_1.User)
], UserResponse.prototype, "user", void 0);
UserResponse = __decorate([
    (0, type_graphql_1.ObjectType)()
], UserResponse);
let UserResolver = class UserResolver {
    me({ req }) {
        if (!req.session.userId) {
            return null;
        }
        return user_1.User.findOne({ where: { id: req.session.userId } });
    }
    async changePassword(newPassword, token, { redis, req }) {
        if (newPassword.length <= 3) {
            return {
                errors: [
                    {
                        field: 'newPassword',
                        message: 'Length must greater than 3',
                    },
                ],
            };
        }
        const key = process.env.FORGET_PASSWORD_PREFIX + token;
        const userId = await redis.get(key);
        if (!userId) {
            return {
                errors: [
                    {
                        field: 'token',
                        message: 'token expired',
                    },
                ],
            };
        }
        const userIdNumber = parseInt(userId);
        const user = await user_1.User.findOne({ where: { id: userIdNumber } });
        if (!user) {
            return {
                errors: [
                    {
                        field: 'token',
                        message: 'User no longer exist',
                    },
                ],
            };
        }
        await user_1.User.update({ id: userIdNumber }, { password: await argon2_1.default.hash(newPassword) });
        await redis.del(key);
        req.session.userId = user.id;
        return { user };
    }
    async forgotPassword(email, { redis }) {
        const user = await user_1.User.findOne({ where: { email: email } });
        if (!user)
            return true;
        const token = (0, uuid_1.v4)();
        const key = process.env.FORGET_PASSWORD_PREFIX + token;
        await redis.set(key, user.id, 'EX', 1000 * 60 * 60 * 24 * 3);
        const templateOption = {
            subject: 'Click on the lick below to reset your password',
            url: `http://localhost:3000/change-password/${token}`,
        };
        const template = (0, template_1.emailTemplate)(templateOption);
        await (0, sendEmail_1.sendEmail)(email, template, templateOption.subject);
        return true;
    }
    async register(options, { req }) {
        var _a;
        const errors = (0, validateUserRegister_1.validateUserRegister)(options);
        if (errors) {
            return { errors };
        }
        const hashPassword = await argon2_1.default.hash(options.password);
        let user;
        try {
            const result = await dataSource_1.default.createQueryBuilder()
                .insert()
                .into(user_1.User)
                .values({
                username: options.username,
                email: options.email,
                password: hashPassword,
            })
                .returning('*')
                .execute();
            user = result.raw[0];
        }
        catch (error) {
            if (error.code === '23505' || ((_a = error === null || error === void 0 ? void 0 : error.detail) === null || _a === void 0 ? void 0 : _a.includes('already exists'))) {
                return {
                    errors: [
                        {
                            field: 'username',
                            message: 'username already taken',
                        },
                    ],
                };
            }
        }
        req.session.userId = user.id;
        return { user };
    }
    async login(usernameOrEmail, password, { req }) {
        const user = await user_1.User.findOne({
            where: usernameOrEmail.includes('@')
                ? { email: usernameOrEmail }
                : { username: usernameOrEmail },
        });
        if (!user) {
            return {
                errors: [
                    {
                        field: 'usernameOrEmail',
                        message: 'Username or Email is incorrect',
                    },
                ],
            };
        }
        const isValidPassword = await argon2_1.default.verify(user.password, password);
        if (!isValidPassword) {
            return {
                errors: [
                    {
                        field: 'password',
                        message: 'password is incorrect',
                    },
                ],
            };
        }
        req.session.userId = user.id;
        return {
            user,
        };
    }
    logout({ req, res }) {
        return new Promise((resolve) => {
            req.session.destroy((err) => {
                if (err) {
                    resolve(false);
                    return;
                }
                res.clearCookie('qid');
                resolve(true);
            });
        });
    }
};
__decorate([
    (0, type_graphql_1.Query)(() => user_1.User, { nullable: true }),
    __param(0, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], UserResolver.prototype, "me", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => UserResponse),
    __param(0, (0, type_graphql_1.Arg)('newPassword')),
    __param(1, (0, type_graphql_1.Arg)('token')),
    __param(2, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "changePassword", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => Boolean),
    __param(0, (0, type_graphql_1.Arg)('email')),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "forgotPassword", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => UserResponse),
    __param(0, (0, type_graphql_1.Arg)('options')),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [UsernamePasswordOption_1.UsernamePasswordOption, Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "register", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => UserResponse),
    __param(0, (0, type_graphql_1.Arg)('usernameOrEmail')),
    __param(1, (0, type_graphql_1.Arg)('password')),
    __param(2, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "login", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => Boolean),
    __param(0, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], UserResolver.prototype, "logout", null);
UserResolver = __decorate([
    (0, type_graphql_1.Resolver)()
], UserResolver);
exports.UserResolver = UserResolver;
//# sourceMappingURL=user.js.map