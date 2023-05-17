"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateUserRegister = void 0;
const validateUserRegister = (options) => {
    if (!options.email.includes('@')) {
        return [
            {
                field: 'email',
                message: 'Invalid email',
            },
        ];
    }
    if (options.username.length <= 2) {
        return [
            {
                field: 'username',
                message: 'Length must greater than 2',
            },
        ];
    }
    if (options.username.includes('@')) {
        return [
            {
                field: 'username',
                message: 'Cannot include an @ sign',
            },
        ];
    }
    if (options.password.length <= 3) {
        return [
            {
                field: 'password',
                message: 'Length must greater than 3',
            },
        ];
    }
    return null;
};
exports.validateUserRegister = validateUserRegister;
//# sourceMappingURL=validateUserRegister.js.map