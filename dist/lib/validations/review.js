"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reviewSchema = void 0;
const zod_1 = require("zod");
exports.reviewSchema = zod_1.z.object({
    rating: zod_1.z.number().min(1).max(5),
    content: zod_1.z.string().min(1, 'Review content is required'),
    position: zod_1.z.string().min(1, 'Position is required'),
    employment_status: zod_1.z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERN']),
});
