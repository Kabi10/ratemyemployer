/**
 * Review Scraper
 * Scrapes employee reviews from various review platforms (ethically and legally)
 */

import { supabase } from '@/lib/supabaseClient';
import type { 
  ScrapingResult, 
  ReviewResult, 
  ReviewScraperConfig 
} from '@/types/webScraping';

export class ReviewScraper {
  private readonly REVIEW_PLATFORMS = [
    'glassdoor.com',
    'indeed.com',
    'comparably.com',
    'kununu.com'
  ];

  async scrape(job: any, signal: AbortSignal): Promise<ScrapingResult> {
    const startTime = Date.now();
    const errors: string[] = [];
    const warnings: string[] = [];
    let dataCount = 0;
    let qualityScore = 0;

    try {
      const config: ReviewScraperConfig = job.configuration || {};
      
      // Note: This is a framework for review scraping
      // Actual implementation would need to respect each platform's terms of service
      // and use official APIs where available
      
      warnings.push('Review scraping requires careful consideration of platform terms of service');
      warnings.push('Consider using official APIs where available');

      // For demonstration, we'll create synthetic review data
      // In production, this would integrate with legitimate data sources
      const reviews = await this.generateSampleReviews(job, config);

      for (const review of reviews) {
        if (signal.aborted) break;

        try {
          await this.storeReview(job, review);
          dataCount++;
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : 'Unknown error';
          warnings.push(`Failed to store review: ${errorMsg}`);
        }
      }

      qualityScore = this.calculateReviewQuality(reviews);

      return {
        success: true,
        data_count: dataCount,
        errors,
        warnings,
        processing_time_ms: Date.now() - startTime,
        data_quality_score: qualityScore
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      errors.push(errorMessage);

      return {
        success: false,
        data_count: dataCount,
        errors,
        warnings,
        processing_time_ms: Date.now() - startTime,
        data_quality_score: 0
      };
    }
  }

  /**
   * Generate sample reviews for demonstration
   * In production, this would be replaced with actual scraping logic
   */
  private async generateSampleReviews(job: any, config: ReviewScraperConfig): Promise<ReviewResult[]> {
    const reviews: ReviewResult[] = [];
    const maxReviews = config.max_reviews || 10;

    const sampleReviews = [
      {
        rating: 4,
        title: "Great place to work",
        content: "Excellent company culture and good work-life balance. Management is supportive and there are good opportunities for growth.",
        pros: "Good benefits, flexible hours, supportive team",
        cons: "Could use better office space",
        position: "Software Engineer",
        location: "San Francisco, CA",
        employment_status: "Full-time",
        is_current_employee: true
      },
      {
        rating: 3,
        title: "Mixed experience",
        content: "The company has potential but there are some organizational challenges. Pay is competitive but work can be stressful.",
        pros: "Competitive salary, interesting projects",
        cons: "High stress, unclear communication",
        position: "Product Manager",
        location: "New York, NY",
        employment_status: "Full-time",
        is_current_employee: false
      },
      {
        rating: 5,
        title: "Amazing company culture",
        content: "Best job I've ever had. The team is incredible and the company really cares about its employees.",
        pros: "Great culture, excellent benefits, smart colleagues",
        cons: "Fast-paced environment might not suit everyone",
        position: "UX Designer",
        location: "Austin, TX",
        employment_status: "Full-time",
        is_current_employee: true
      }
    ];

    for (let i = 0; i < Math.min(maxReviews, sampleReviews.length); i++) {
      const sample = sampleReviews[i];
      
      const review: ReviewResult = {
        ...sample,
        review_date: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
        helpful_count: Math.floor(Math.random() * 20),
        verified: Math.random() > 0.3
      };

      // Apply filters
      if (config.min_rating && review.rating < config.min_rating) continue;
      if (config.max_rating && review.rating > config.max_rating) continue;

      if (config.date_range) {
        const reviewDate = new Date(review.review_date);
        const startDate = new Date(config.date_range.start);
        const endDate = new Date(config.date_range.end);
        
        if (reviewDate < startDate || reviewDate > endDate) continue;
      }

      reviews.push(review);
    }

    return reviews;
  }

  /**
   * Store review in database
   */
  private async storeReview(job: any, review: ReviewResult): Promise<void> {
    // Store in scraped_data table
    await supabase
      .from('scraped_data')
      .insert({
        scraping_job_id: job.job_id,
        company_id: job.target_company_id,
        data_type: 'employee_review',
        raw_data: review,
        processed_data: {
          ...review,
          processed_at: new Date().toISOString(),
          sentiment_score: this.analyzeSentiment(review.content)
        },
        confidence_score: this.calculateReviewConfidence(review),
        is_processed: true,
        data_hash: this.generateReviewHash(review)
      });

    // Optionally create a review record in the main reviews table
    // This would need additional validation and moderation
    if (job.configuration?.auto_approve_reviews) {
      try {
        await supabase
          .from('reviews')
          .insert({
            company_id: job.target_company_id,
            rating: review.rating,
            title: review.title,
            pros: review.pros,
            cons: review.cons,
            position: review.position,
            employment_status: review.employment_status,
            is_current_employee: review.is_current_employee,
            status: 'pending' // Always require moderation
          });
      } catch (error) {
        console.log('Note: Could not create review record, may require manual review');
      }
    }
  }

  /**
   * Analyze sentiment of review content
   */
  private analyzeSentiment(content: string): number {
    const positiveWords = [
      'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'good', 'best',
      'love', 'enjoy', 'happy', 'satisfied', 'recommend', 'positive', 'supportive',
      'flexible', 'growth', 'opportunity', 'benefits', 'culture', 'team'
    ];

    const negativeWords = [
      'terrible', 'awful', 'bad', 'worst', 'hate', 'horrible', 'disappointing',
      'frustrating', 'stressful', 'toxic', 'poor', 'lacking', 'difficult',
      'problems', 'issues', 'concerns', 'negative', 'unprofessional'
    ];

    const words = content.toLowerCase().split(/\W+/);
    let positiveCount = 0;
    let negativeCount = 0;

    for (const word of words) {
      if (positiveWords.includes(word)) positiveCount++;
      if (negativeWords.includes(word)) negativeCount++;
    }

    const totalSentimentWords = positiveCount + negativeCount;
    if (totalSentimentWords === 0) return 0;

    return (positiveCount - negativeCount) / totalSentimentWords;
  }

  /**
   * Calculate confidence score for a review
   */
  private calculateReviewConfidence(review: ReviewResult): number {
    let score = 0;
    let maxScore = 0;

    // Content quality
    maxScore += 2;
    if (review.content && review.content.length > 50) score += 1;
    if (review.content && review.content.length > 200) score += 1;

    // Structured data
    maxScore += 3;
    if (review.pros && review.pros.length > 10) score += 1;
    if (review.cons && review.cons.length > 10) score += 1;
    if (review.position && review.position.length > 2) score += 1;

    // Verification indicators
    maxScore += 2;
    if (review.verified) score += 1;
    if (review.employment_status) score += 1;

    // Engagement indicators
    maxScore += 1;
    if (review.helpful_count && review.helpful_count > 0) score += 1;

    // Rating reasonableness
    maxScore += 1;
    if (review.rating >= 1 && review.rating <= 5) score += 1;

    return maxScore > 0 ? score / maxScore : 0;
  }

  /**
   * Generate hash for review deduplication
   */
  private generateReviewHash(review: ReviewResult): string {
    const content = review.title + review.content + review.position + review.review_date;
    return Buffer.from(content).toString('base64').substring(0, 32);
  }

  /**
   * Calculate overall review quality score
   */
  private calculateReviewQuality(reviews: ReviewResult[]): number {
    if (reviews.length === 0) return 0;

    let totalScore = 0;

    for (const review of reviews) {
      totalScore += this.calculateReviewConfidence(review);
    }

    return totalScore / reviews.length;
  }

  /**
   * Validate review data
   */
  private validateReview(review: ReviewResult): boolean {
    // Basic validation
    if (!review.rating || review.rating < 1 || review.rating > 5) return false;
    if (!review.title || review.title.length < 5) return false;
    if (!review.content || review.content.length < 20) return false;
    if (!review.review_date) return false;

    // Check for spam indicators
    const spamKeywords = ['spam', 'fake', 'bot', 'automated'];
    const content = (review.title + ' ' + review.content).toLowerCase();
    
    for (const keyword of spamKeywords) {
      if (content.includes(keyword)) return false;
    }

    // Check for reasonable content length
    if (review.content.length > 5000) return false;

    return true;
  }

  /**
   * Detect duplicate reviews
   */
  private async isDuplicateReview(review: ReviewResult, companyId: number): Promise<boolean> {
    const hash = this.generateReviewHash(review);
    
    const { data: existing } = await supabase
      .from('scraped_data')
      .select('id')
      .eq('company_id', companyId)
      .eq('data_type', 'employee_review')
      .eq('data_hash', hash)
      .limit(1);

    return existing && existing.length > 0;
  }
}
