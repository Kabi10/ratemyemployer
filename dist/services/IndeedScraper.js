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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IndeedScraper = void 0;
const axios_1 = __importDefault(require("axios"));
const cheerio = __importStar(require("cheerio"));
const helpers_1 = require("../utils/helpers");
class IndeedScraper {
    constructor(companyName) {
        this.companyName = companyName;
        this.baseUrl = 'https://www.indeed.com';
        this.delayMs = 2000; // 2 second delay between requests
    }
    async scrapeReviews(pages = 1) {
        const reviews = [];
        try {
            for (let page = 0; page < pages; page++) {
                const url = this.buildReviewUrl(page);
                const html = await this.fetchPage(url);
                const pageReviews = await this.parseReviews(html);
                reviews.push(...pageReviews);
                // Ethical delay between requests
                await (0, helpers_1.delay)(this.delayMs);
            }
            return reviews;
        }
        catch (error) {
            console.error('Error scraping reviews:', error);
            throw error;
        }
    }
    buildReviewUrl(page) {
        const encodedCompany = encodeURIComponent(this.companyName);
        return `${this.baseUrl}/cmp/${encodedCompany}/reviews?fcountry=ALL&start=${page * 20}`;
    }
    async fetchPage(url) {
        try {
            const response = await axios_1.default.get(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                }
            });
            return response.data;
        }
        catch (error) {
            console.error('Error fetching page:', error);
            throw error;
        }
    }
    async parseReviews(html) {
        const $ = cheerio.load(html);
        const reviews = [];
        // Updated selectors based on Indeed's current structure
        $('.cmp-ReviewsList div[data-tn-component="reviewsList"]').each((_, element) => {
            const review = {
                rating: $(element).find('[class*="rating"] span').first().text().trim(),
                title: $(element).find('[class*="review-title"]').text().trim(),
                pros: $(element).find('[data-testid="pros"]').text().trim(),
                cons: $(element).find('[data-testid="cons"]').text().trim(),
                date: $(element).find('[class*="review-date"]').text().trim(),
                jobTitle: $(element).find('[class*="job-title"]').text().trim(),
                location: $(element).find('[class*="review-location"]').text().trim(),
                employmentStatus: $(element).find('[class*="employment-status"]').text().trim()
            };
            if (review.title) { // Only add reviews that have at least a title
                reviews.push(review);
            }
        });
        return reviews;
    }
}
exports.IndeedScraper = IndeedScraper;
