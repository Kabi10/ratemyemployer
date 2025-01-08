"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const IndeedScraper_1 = require("../services/IndeedScraper");
async function testScraper() {
    try {
        const scraper = new IndeedScraper_1.IndeedScraper('microsoft');
        console.log('Starting to scrape Microsoft reviews...');
        const reviews = await scraper.scrapeReviews(1); // Let's start with 1 page
        console.log(`Found ${reviews.length} reviews:`);
        reviews.forEach((review, index) => {
            console.log(`\nReview #${index + 1}:`);
            console.log('Title:', review.title);
            console.log('Rating:', review.rating);
            console.log('Pros:', review.pros);
            console.log('Cons:', review.cons);
            console.log('Date:', review.date);
            if (review.jobTitle)
                console.log('Job Title:', review.jobTitle);
            if (review.location)
                console.log('Location:', review.location);
            console.log('-------------------');
        });
    }
    catch (error) {
        console.error('Error during scraping:', error);
    }
}
testScraper();
