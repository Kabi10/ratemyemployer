"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
vitest_1.expect.extend({
    toHaveBeenCalledOnceWith(received, expected) {
        var _a, _b, _c;
        const pass = ((_b = (_a = received.mock) === null || _a === void 0 ? void 0 : _a.calls) === null || _b === void 0 ? void 0 : _b.length) === 1 &&
            JSON.stringify((_c = received.mock) === null || _c === void 0 ? void 0 : _c.calls[0]) === JSON.stringify([expected]);
        return {
            pass,
            message: () => pass
                ? `Expected function not to have been called once with ${expected}`
                : `Expected function to have been called once with ${expected}`,
        };
    },
    toBeValidDate(received) {
        const date = new Date(received);
        const pass = date instanceof Date && !isNaN(date.getTime());
        return {
            pass,
            message: () => pass
                ? `Expected ${received} not to be a valid date`
                : `Expected ${received} to be a valid date`,
        };
    },
    toBeWithinRange(received, floor, ceiling) {
        const pass = received >= floor && received <= ceiling;
        return {
            pass,
            message: () => pass
                ? `Expected ${received} not to be within range ${floor} - ${ceiling}`
                : `Expected ${received} to be within range ${floor} - ${ceiling}`,
        };
    },
});
