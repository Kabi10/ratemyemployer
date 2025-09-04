/**
 * Job Listings Scraper
 * Scrapes job postings from various job boards and company career pages
 */

import { supabase } from '@/lib/supabaseClient';
import type { 
  ScrapingResult, 
  JobListingResult, 
  JobListingsScraperConfig 
} from '@/types/webScraping';

export class JobListingsScraper {
  private readonly JOB_BOARDS = [
    'indeed.com',
    'linkedin.com',
    'glassdoor.com',
    'monster.com',
    'ziprecruiter.com'
  ];

  async scrape(job: any, signal: AbortSignal): Promise<ScrapingResult> {
    const startTime = Date.now();
    const errors: string[] = [];
    const warnings: string[] = [];
    let dataCount = 0;
    let qualityScore = 0;

    try {
      const config: JobListingsScraperConfig = job.configuration || {};
      
      // Note: This demonstrates the framework for job scraping
      // Actual implementation would use official APIs where available
      // and respect platform terms of service
      
      warnings.push('Job scraping should use official APIs where available');
      warnings.push('Always respect platform terms of service and rate limits');

      let jobListings: JobListingResult[] = [];

      if (job.target_url) {
        // Scrape from company career page
        jobListings = await this.scrapeCompanyCareerPage(job.target_url, config, signal);
      } else {
        // Generate sample job listings for demonstration
        jobListings = await this.generateSampleJobListings(job, config);
      }

      for (const listing of jobListings) {
        if (signal.aborted) break;

        try {
          await this.storeJobListing(job, listing);
          dataCount++;
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : 'Unknown error';
          warnings.push(`Failed to store job listing: ${errorMsg}`);
        }
      }

      qualityScore = this.calculateJobListingsQuality(jobListings);

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
   * Scrape company career page
   */
  private async scrapeCompanyCareerPage(
    url: string, 
    config: JobListingsScraperConfig, 
    signal: AbortSignal
  ): Promise<JobListingResult[]> {
    const jobListings: JobListingResult[] = [];

    try {
      const response = await fetch(url, {
        signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const html = await response.text();
      
      // Parse job listings from HTML
      const listings = this.parseJobListingsFromHTML(html, url);
      
      // Apply filters
      for (const listing of listings) {
        if (this.matchesFilters(listing, config)) {
          jobListings.push(listing);
        }
      }

      return jobListings.slice(0, config.max_listings || 50);

    } catch (error) {
      console.error('Error scraping career page:', error);
      return [];
    }
  }

  /**
   * Parse job listings from HTML
   */
  private parseJobListingsFromHTML(html: string, baseUrl: string): JobListingResult[] {
    const listings: JobListingResult[] = [];

    // Common patterns for job listings
    const jobPatterns = [
      /<div[^>]*class="[^"]*job[^"]*"[^>]*>(.*?)<\/div>/gis,
      /<article[^>]*class="[^"]*position[^"]*"[^>]*>(.*?)<\/article>/gis,
      /<li[^>]*class="[^"]*career[^"]*"[^>]*>(.*?)<\/li>/gis
    ];

    for (const pattern of jobPatterns) {
      let match;
      while ((match = pattern.exec(html)) !== null) {
        const jobHtml = match[1];
        const listing = this.extractJobFromHTML(jobHtml, baseUrl);
        if (listing) {
          listings.push(listing);
        }
      }
    }

    return listings;
  }

  /**
   * Extract job information from HTML fragment
   */
  private extractJobFromHTML(html: string, baseUrl: string): JobListingResult | null {
    try {
      const title = this.extractJobTitle(html);
      const description = this.extractJobDescription(html);
      const location = this.extractJobLocation(html);

      if (!title || !description) {
        return null;
      }

      return {
        title,
        description,
        location: location || 'Not specified',
        employment_type: this.extractEmploymentType(html),
        salary_range: this.extractSalaryRange(html),
        benefits: this.extractBenefits(html),
        requirements: this.extractRequirements(html),
        posted_date: this.extractPostedDate(html),
        application_url: this.extractApplicationUrl(html, baseUrl),
        remote_allowed: this.checkRemoteAllowed(html)
      };

    } catch (error) {
      console.error('Error extracting job from HTML:', error);
      return null;
    }
  }

  /**
   * Generate sample job listings for demonstration
   */
  private async generateSampleJobListings(job: any, config: JobListingsScraperConfig): Promise<JobListingResult[]> {
    const sampleJobs = [
      {
        title: "Senior Software Engineer",
        description: "We are looking for a senior software engineer to join our growing team. You will be responsible for developing scalable web applications and mentoring junior developers.",
        location: "San Francisco, CA",
        employment_type: "Full-time",
        salary_range: "$120,000 - $180,000",
        benefits: ["Health insurance", "401k matching", "Flexible PTO", "Remote work options"],
        requirements: ["5+ years experience", "JavaScript/TypeScript", "React", "Node.js", "Bachelor's degree"],
        posted_date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        remote_allowed: true
      },
      {
        title: "Product Manager",
        description: "Join our product team to drive the development of innovative features. You will work closely with engineering, design, and business stakeholders.",
        location: "New York, NY",
        employment_type: "Full-time",
        salary_range: "$100,000 - $150,000",
        benefits: ["Health insurance", "Stock options", "Professional development budget"],
        requirements: ["3+ years product management", "Technical background", "Strong communication skills"],
        posted_date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        remote_allowed: false
      },
      {
        title: "UX Designer",
        description: "We're seeking a talented UX designer to create intuitive and engaging user experiences for our products.",
        location: "Austin, TX",
        employment_type: "Full-time",
        salary_range: "$80,000 - $120,000",
        benefits: ["Health insurance", "Creative workspace", "Design conference budget"],
        requirements: ["Portfolio of UX work", "Figma/Sketch proficiency", "User research experience"],
        posted_date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        remote_allowed: true
      }
    ];

    const filteredJobs = sampleJobs.filter(job => this.matchesFilters(job, config));
    return filteredJobs.slice(0, config.max_listings || 10);
  }

  /**
   * Check if job listing matches filters
   */
  private matchesFilters(listing: JobListingResult, config: JobListingsScraperConfig): boolean {
    if (config.job_types && config.job_types.length > 0) {
      if (!config.job_types.includes(listing.employment_type)) {
        return false;
      }
    }

    if (config.locations && config.locations.length > 0) {
      const matchesLocation = config.locations.some(location => 
        listing.location.toLowerCase().includes(location.toLowerCase())
      );
      if (!matchesLocation) {
        return false;
      }
    }

    return true;
  }

  /**
   * Extract job title from HTML
   */
  private extractJobTitle(html: string): string | undefined {
    const patterns = [
      /<h[1-6][^>]*class="[^"]*title[^"]*"[^>]*>([^<]+)/i,
      /<h[1-6][^>]*>([^<]+)</i,
      /<a[^>]*class="[^"]*job-title[^"]*"[^>]*>([^<]+)/i
    ];

    for (const pattern of patterns) {
      const match = html.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }

    return undefined;
  }

  /**
   * Extract job description from HTML
   */
  private extractJobDescription(html: string): string {
    const patterns = [
      /<p[^>]*class="[^"]*description[^"]*"[^>]*>([^<]+)/i,
      /<div[^>]*class="[^"]*description[^"]*"[^>]*>([^<]+)/i,
      /<p[^>]*>([^<]+)</i
    ];

    for (const pattern of patterns) {
      const match = html.match(pattern);
      if (match && match[1] && match[1].length > 50) {
        return match[1].trim();
      }
    }

    return html.replace(/<[^>]*>/g, '').trim().substring(0, 500);
  }

  /**
   * Extract other job fields
   */
  private extractJobLocation(html: string): string | undefined {
    const patterns = [
      /<span[^>]*class="[^"]*location[^"]*"[^>]*>([^<]+)/i,
      /location[^>]*>([^<]+)/i
    ];

    for (const pattern of patterns) {
      const match = html.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }

    return undefined;
  }

  private extractEmploymentType(html: string): string {
    const fullTimeKeywords = ['full-time', 'full time', 'permanent'];
    const partTimeKeywords = ['part-time', 'part time'];
    const contractKeywords = ['contract', 'contractor', 'freelance'];
    
    const text = html.toLowerCase();
    
    if (fullTimeKeywords.some(keyword => text.includes(keyword))) return 'Full-time';
    if (partTimeKeywords.some(keyword => text.includes(keyword))) return 'Part-time';
    if (contractKeywords.some(keyword => text.includes(keyword))) return 'Contract';
    
    return 'Full-time'; // Default
  }

  private extractSalaryRange(html: string): string | undefined {
    const salaryPattern = /\$[\d,]+\s*-?\s*\$?[\d,]+/;
    const match = html.match(salaryPattern);
    return match ? match[0] : undefined;
  }

  private extractBenefits(html: string): string[] {
    const benefits: string[] = [];
    const benefitKeywords = [
      'health insurance', 'dental', 'vision', '401k', 'pto', 'vacation',
      'remote work', 'flexible hours', 'stock options', 'bonus'
    ];

    const text = html.toLowerCase();
    for (const benefit of benefitKeywords) {
      if (text.includes(benefit)) {
        benefits.push(benefit);
      }
    }

    return benefits;
  }

  private extractRequirements(html: string): string[] {
    const requirements: string[] = [];
    const text = html.toLowerCase();
    
    // Look for common requirement patterns
    const reqPatterns = [
      /(\d+)\+?\s*years?\s*experience/g,
      /(bachelor|master|phd|degree)/g,
      /(javascript|python|java|react|node)/g
    ];

    for (const pattern of reqPatterns) {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        requirements.push(match[0]);
      }
    }

    return requirements;
  }

  private extractPostedDate(html: string): string {
    const datePattern = /(\d{1,2}\/\d{1,2}\/\d{4}|\d{4}-\d{2}-\d{2})/;
    const match = html.match(datePattern);
    
    if (match) {
      return new Date(match[0]).toISOString();
    }
    
    return new Date().toISOString();
  }

  private extractApplicationUrl(html: string, baseUrl: string): string | undefined {
    const linkPattern = /<a[^>]*href="([^"]+)"[^>]*apply/i;
    const match = html.match(linkPattern);
    
    if (match && match[1]) {
      const url = match[1];
      return url.startsWith('http') ? url : new URL(url, baseUrl).href;
    }
    
    return undefined;
  }

  private checkRemoteAllowed(html: string): boolean {
    const remoteKeywords = ['remote', 'work from home', 'distributed', 'anywhere'];
    const text = html.toLowerCase();
    return remoteKeywords.some(keyword => text.includes(keyword));
  }

  /**
   * Store job listing in database
   */
  private async storeJobListing(job: any, listing: JobListingResult): Promise<void> {
    await supabase
      .from('scraped_data')
      .insert({
        scraping_job_id: job.job_id,
        company_id: job.target_company_id,
        data_type: 'job_listing',
        source_url: listing.application_url || job.target_url,
        raw_data: listing,
        processed_data: {
          ...listing,
          processed_at: new Date().toISOString(),
          keywords: this.extractJobKeywords(listing)
        },
        confidence_score: this.calculateJobListingConfidence(listing),
        is_processed: true,
        data_hash: this.generateJobListingHash(listing)
      });
  }

  /**
   * Extract keywords from job listing
   */
  private extractJobKeywords(listing: JobListingResult): string[] {
    const text = (listing.title + ' ' + listing.description).toLowerCase();
    const keywords = new Set<string>();

    const techKeywords = [
      'javascript', 'python', 'java', 'react', 'node', 'sql', 'aws',
      'docker', 'kubernetes', 'git', 'agile', 'scrum', 'api'
    ];

    const words = text.split(/\W+/);
    for (const word of words) {
      if (techKeywords.includes(word)) {
        keywords.add(word);
      }
    }

    return Array.from(keywords);
  }

  /**
   * Calculate confidence score for job listing
   */
  private calculateJobListingConfidence(listing: JobListingResult): number {
    let score = 0;
    let maxScore = 0;

    // Title quality
    maxScore += 1;
    if (listing.title && listing.title.length > 5) score += 1;

    // Description quality
    maxScore += 2;
    if (listing.description && listing.description.length > 50) score += 1;
    if (listing.description && listing.description.length > 200) score += 1;

    // Location specified
    maxScore += 1;
    if (listing.location && listing.location !== 'Not specified') score += 1;

    // Salary information
    maxScore += 1;
    if (listing.salary_range) score += 1;

    // Requirements specified
    maxScore += 1;
    if (listing.requirements && listing.requirements.length > 0) score += 1;

    // Recent posting
    maxScore += 1;
    const postedDate = new Date(listing.posted_date);
    const daysSincePosted = (Date.now() - postedDate.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSincePosted <= 30) score += 1;

    return maxScore > 0 ? score / maxScore : 0;
  }

  /**
   * Generate hash for job listing deduplication
   */
  private generateJobListingHash(listing: JobListingResult): string {
    const content = listing.title + listing.location + listing.posted_date;
    return Buffer.from(content).toString('base64').substring(0, 32);
  }

  /**
   * Calculate overall job listings quality
   */
  private calculateJobListingsQuality(listings: JobListingResult[]): number {
    if (listings.length === 0) return 0;

    let totalScore = 0;
    for (const listing of listings) {
      totalScore += this.calculateJobListingConfidence(listing);
    }

    return totalScore / listings.length;
  }
}
