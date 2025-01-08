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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateForm = exports.companySchema = exports.reviewSchema = exports.rateLimitTypeEnum = exports.reviewStatusEnum = exports.verificationStatusEnum = exports.employmentStatusEnum = void 0;
const z = __importStar(require("zod"));
const types_1 = require("@/types");
// Enums
exports.employmentStatusEnum = ['Full-time', 'Part-time', 'Contract', 'Intern'];
exports.verificationStatusEnum = ['pending', 'verified', 'rejected'];
exports.reviewStatusEnum = ['pending', 'approved', 'rejected'];
exports.rateLimitTypeEnum = ['review', 'company', 'report'];
// Validation Messages
const ERROR_MESSAGES = {
    required: 'This field is required',
    email: 'Please enter a valid email address',
    url: 'Please enter a valid website URL',
    min: (field, length) => `${field} must be at least ${length} characters`,
    max: (field, length) => `${field} must be less than ${length} characters`,
    rating: 'Rating must be between 1 and 5 stars',
    invalidEnum: (field, options) => `${field} must be one of: ${options.join(', ')}`,
};
// Review Schema
exports.reviewSchema = z.object({
    title: z.string()
        .max(100, ERROR_MESSAGES.max('Title', 100))
        .trim()
        .optional(),
    rating: z.number()
        .min(1, ERROR_MESSAGES.rating)
        .max(5, ERROR_MESSAGES.rating),
    position: z.string()
        .min(2, ERROR_MESSAGES.min('Position', 2))
        .max(100, ERROR_MESSAGES.max('Position', 100))
        .trim(),
    employment_status: z.enum(exports.employmentStatusEnum, {
        errorMap: () => ({ message: ERROR_MESSAGES.invalidEnum('Employment status', exports.employmentStatusEnum) })
    }),
    is_current_employee: z.boolean().default(false),
    status: z.enum(exports.reviewStatusEnum).default('pending'),
    pros: z.string()
        .min(10, ERROR_MESSAGES.min('Pros', 10))
        .max(500, ERROR_MESSAGES.max('Pros', 500))
        .trim(),
    cons: z.string()
        .min(10, ERROR_MESSAGES.min('Cons', 10))
        .max(500, ERROR_MESSAGES.max('Cons', 500))
        .trim(),
    reviewer_name: z.string().trim().optional(),
    reviewer_email: z.string().email(ERROR_MESSAGES.email).optional()
});
// Company Schema
exports.companySchema = z.object({
    name: z.string()
        .min(2, ERROR_MESSAGES.min('Company name', 2))
        .max(100, ERROR_MESSAGES.max('Company name', 100))
        .trim(),
    description: z.string()
        .min(10, ERROR_MESSAGES.min('Description', 10))
        .max(1000, ERROR_MESSAGES.max('Description', 1000))
        .trim(),
    industry: z.enum(types_1.INDUSTRIES, {
        errorMap: () => ({ message: ERROR_MESSAGES.invalidEnum('Industry', types_1.INDUSTRIES) })
    }),
    location: z.string()
        .min(2, ERROR_MESSAGES.min('Location', 2))
        .max(100, ERROR_MESSAGES.max('Location', 100))
        .trim(),
    website: z.string()
        .url(ERROR_MESSAGES.url)
        .trim()
        .optional(),
    size: z.enum(['Small', 'Medium', 'Large', 'Enterprise'], {
        errorMap: () => ({ message: ERROR_MESSAGES.invalidEnum('Company size', ['Small', 'Medium', 'Large', 'Enterprise']) })
    })
        .optional(),
    logo_url: z.string()
        .url(ERROR_MESSAGES.url)
        .trim()
        .optional(),
    verification_status: z.enum(exports.verificationStatusEnum).optional(),
    verified: z.boolean().optional(),
    verification_date: z.string().datetime().optional()
});
// Validation Utilities
const validateForm = async (schema, data) => {
    try {
        const validData = await schema.parseAsync(data);
        return { success: true, data: validData };
    }
    catch (error) {
        if (error instanceof z.ZodError) {
            return { success: false, errors: error };
        }
        throw error;
    }
};
exports.validateForm = validateForm;
