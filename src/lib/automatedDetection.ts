/**
 * Automated Detection System for Company Sections
 * Analyzes company data and news to automatically identify financial distress and growth indicators
 */

import { supabase } from './supabaseClient';
import { fetchCompanyNews } from './freeNewsApi';
import type { 
  DistressIndicatorType, 
  GrowthIndicatorType,
  AddDistressIndicatorForm,
  AddGrowthIndicatorForm 
} from '@/types/companySections';

// Keywords for detecting financial distress
const DISTRESS_KEYWORDS = {
  layoffs: ['layoff', 'layoffs', 'job cuts', 'workforce reduction', 'downsizing', 'redundancies'],
  funding_issues: ['funding crisis', 'cash flow', 'financial difficulties', 'bankruptcy', 'debt'],
  revenue_decline: ['revenue decline', 'sales drop', 'losses', 'financial losses', 'poor earnings'],
  leadership_changes: ['ceo departure', 'executive departure', 'leadership change', 'resignation'],
  office_closures: ['office closure', 'facility closure', 'shutdown', 'closing offices'],
  bankruptcy_filing: ['bankruptcy', 'chapter 11', 'insolvency', 'administration'],
  acquisition_rumors: ['acquisition rumors', 'takeover', 'merger talks', 'buyout'],
  stock_decline: ['stock decline', 'share price fall', 'market cap drop', 'stock crash'],
  negative_news: ['scandal', 'investigation', 'lawsuit', 'controversy', 'fraud'],
  employee_exodus: ['mass resignation', 'employee exodus', 'talent drain', 'high turnover']
};

// Keywords for detecting growth indicators
const GROWTH_KEYWORDS = {
  funding_round: ['funding round', 'series a', 'series b', 'series c', 'investment', 'venture capital'],
  revenue_growth: ['revenue growth', 'sales increase', 'profit growth', 'strong earnings'],
  hiring_spree: ['hiring', 'recruitment', 'expanding team', 'new hires', 'job openings'],
  expansion: ['expansion', 'new office', 'international', 'market expansion', 'scaling'],
  new_products: ['product launch', 'new product', 'innovation', 'breakthrough'],
  partnerships: ['partnership', 'collaboration', 'strategic alliance', 'joint venture'],
  awards: ['award', 'recognition', 'best company', 'top employer', 'industry leader'],
  positive_news: ['success', 'achievement', 'milestone', 'breakthrough', 'growth'],
  ipo_preparation: ['ipo', 'public offering', 'going public', 'stock market'],
  acquisition_interest: ['acquisition target', 'buyout interest', 'merger interest']
};

interface DetectionResult {
  distressIndicators: AddDistressIndicatorForm[];
  growthIndicators: AddGrowthIndicatorForm[];
  processedCompanies: number;
  errors: string[];
}

/**
 * Analyze news content for distress indicators
 */
function analyzeDistressIndicators(companyId: number, newsContent: string, sourceUrl?: string): AddDistressIndicatorForm[] {
  const indicators: AddDistressIndicatorForm[] = [];
  const content = newsContent.toLowerCase();

  Object.entries(DISTRESS_KEYWORDS).forEach(([indicatorType, keywords]) => {
    const matchedKeywords = keywords.filter(keyword => content.includes(keyword.toLowerCase()));
    
    if (matchedKeywords.length > 0) {
      // Calculate severity based on keyword matches and context
      let severity = Math.min(matchedKeywords.length + 1, 5);
      let impactScore = 5;

      // Adjust severity based on specific indicators
      if (indicatorType === 'bankruptcy_filing' || indicatorType === 'office_closures') {
        severity = 5;
        impactScore = 10;
      } else if (indicatorType === 'layoffs' || indicatorType === 'leadership_changes') {
        severity = Math.min(severity + 1, 5);
        impactScore = 8;
      }

      indicators.push({
        company_id: companyId,
        indicator_type: indicatorType as DistressIndicatorType,
        severity,
        description: `Detected from news: ${matchedKeywords.join(', ')}`,
        source_url: sourceUrl,
        impact_score: impactScore
      });
    }
  });

  return indicators;
}

/**
 * Analyze news content for growth indicators
 */
function analyzeGrowthIndicators(companyId: number, newsContent: string, sourceUrl?: string): AddGrowthIndicatorForm[] {
  const indicators: AddGrowthIndicatorForm[] = [];
  const content = newsContent.toLowerCase();

  Object.entries(GROWTH_KEYWORDS).forEach(([indicatorType, keywords]) => {
    const matchedKeywords = keywords.filter(keyword => content.includes(keyword.toLowerCase()));
    
    if (matchedKeywords.length > 0) {
      // Calculate growth score based on keyword matches and context
      let growthScore = Math.min(matchedKeywords.length + 3, 10);
      let fundingAmount: number | undefined;

      // Extract funding amount if it's a funding round
      if (indicatorType === 'funding_round') {
        const fundingMatch = content.match(/\$(\d+(?:\.\d+)?)\s*(million|billion|m|b)/i);
        if (fundingMatch) {
          const amount = parseFloat(fundingMatch[1]);
          const unit = fundingMatch[2].toLowerCase();
          fundingAmount = unit.startsWith('b') ? amount * 1000000000 : amount * 1000000;
          growthScore = Math.min(growthScore + 2, 10);
        }
      }

      // Adjust growth score based on specific indicators
      if (indicatorType === 'ipo_preparation' || indicatorType === 'acquisition_interest') {
        growthScore = Math.min(growthScore + 2, 10);
      }

      indicators.push({
        company_id: companyId,
        indicator_type: indicatorType as GrowthIndicatorType,
        growth_score: growthScore,
        description: `Detected from news: ${matchedKeywords.join(', ')}`,
        source_url: sourceUrl,
        funding_amount: fundingAmount
      });
    }
  });

  return indicators;
}

/**
 * Analyze review patterns for distress indicators
 */
async function analyzeReviewPatterns(companyId: number): Promise<AddDistressIndicatorForm[]> {
  const indicators: AddDistressIndicatorForm[] = [];

  try {
    // Get recent reviews (last 6 months)
    const { data: reviews, error } = await supabase
      .from('reviews')
      .select('rating, pros, cons, created_at')
      .eq('company_id', companyId)
      .eq('status', 'approved')
      .gte('created_at', new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false });

    if (error || !reviews || reviews.length < 5) {
      return indicators;
    }

    // Analyze rating trends
    const recentRatings = reviews.slice(0, 10).map(r => r.rating);
    const olderRatings = reviews.slice(-10).map(r => r.rating);
    
    const recentAvg = recentRatings.reduce((sum, rating) => sum + rating, 0) / recentRatings.length;
    const olderAvg = olderRatings.reduce((sum, rating) => sum + rating, 0) / olderRatings.length;
    
    // Significant rating decline
    if (recentAvg < olderAvg - 0.5 && recentAvg < 3.0) {
      indicators.push({
        company_id: companyId,
        indicator_type: 'negative_news',
        severity: Math.min(Math.floor((olderAvg - recentAvg) * 2), 5),
        description: `Rating decline detected: ${olderAvg.toFixed(1)} → ${recentAvg.toFixed(1)}`,
        impact_score: 6
      });
    }

    // Analyze review content for distress keywords
    const allReviewText = reviews
      .map(r => `${r.pros || ''} ${r.cons || ''}`)
      .join(' ')
      .toLowerCase();

    // Check for layoff mentions in reviews
    const layoffKeywords = ['layoff', 'laid off', 'job cuts', 'downsizing'];
    const layoffMentions = layoffKeywords.filter(keyword => allReviewText.includes(keyword));
    
    if (layoffMentions.length > 0) {
      indicators.push({
        company_id: companyId,
        indicator_type: 'layoffs',
        severity: Math.min(layoffMentions.length + 2, 5),
        description: `Layoffs mentioned in recent reviews: ${layoffMentions.join(', ')}`,
        impact_score: 8
      });
    }

    // Check for leadership issues
    const leadershipKeywords = ['bad management', 'poor leadership', 'ceo', 'management issues'];
    const leadershipMentions = leadershipKeywords.filter(keyword => allReviewText.includes(keyword));
    
    if (leadershipMentions.length > 2) {
      indicators.push({
        company_id: companyId,
        indicator_type: 'leadership_changes',
        severity: 3,
        description: `Leadership issues mentioned in reviews: ${leadershipMentions.length} mentions`,
        impact_score: 6
      });
    }

  } catch (error) {
    console.error('Error analyzing review patterns:', error);
  }

  return indicators;
}

/**
 * Analyze review patterns for growth indicators
 */
async function analyzeGrowthPatterns(companyId: number): Promise<AddGrowthIndicatorForm[]> {
  const indicators: AddGrowthIndicatorForm[] = [];

  try {
    // Get recent reviews (last 6 months)
    const { data: reviews, error } = await supabase
      .from('reviews')
      .select('rating, pros, cons, created_at')
      .eq('company_id', companyId)
      .eq('status', 'approved')
      .gte('created_at', new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false });

    if (error || !reviews || reviews.length < 5) {
      return indicators;
    }

    // Analyze rating trends
    const recentRatings = reviews.slice(0, 10).map(r => r.rating);
    const olderRatings = reviews.slice(-10).map(r => r.rating);
    
    const recentAvg = recentRatings.reduce((sum, rating) => sum + rating, 0) / recentRatings.length;
    const olderAvg = olderRatings.reduce((sum, rating) => sum + rating, 0) / olderRatings.length;
    
    // Significant rating improvement
    if (recentAvg > olderAvg + 0.5 && recentAvg > 4.0) {
      indicators.push({
        company_id: companyId,
        indicator_type: 'positive_news',
        growth_score: Math.min(Math.floor((recentAvg - olderAvg) * 3), 10),
        description: `Rating improvement detected: ${olderAvg.toFixed(1)} → ${recentAvg.toFixed(1)}`
      });
    }

    // Analyze review content for growth keywords
    const allReviewText = reviews
      .map(r => `${r.pros || ''} ${r.cons || ''}`)
      .join(' ')
      .toLowerCase();

    // Check for hiring mentions
    const hiringKeywords = ['hiring', 'growing team', 'expansion', 'new hires'];
    const hiringMentions = hiringKeywords.filter(keyword => allReviewText.includes(keyword));
    
    if (hiringMentions.length > 0) {
      indicators.push({
        company_id: companyId,
        indicator_type: 'hiring_spree',
        growth_score: Math.min(hiringMentions.length + 4, 10),
        description: `Growth mentioned in reviews: ${hiringMentions.join(', ')}`
      });
    }

    // Check for innovation mentions
    const innovationKeywords = ['innovative', 'cutting edge', 'new products', 'breakthrough'];
    const innovationMentions = innovationKeywords.filter(keyword => allReviewText.includes(keyword));
    
    if (innovationMentions.length > 1) {
      indicators.push({
        company_id: companyId,
        indicator_type: 'new_products',
        growth_score: 6,
        description: `Innovation mentioned in reviews: ${innovationMentions.length} mentions`
      });
    }

  } catch (error) {
    console.error('Error analyzing growth patterns:', error);
  }

  return indicators;
}

/**
 * Run automated detection for all companies
 */
export async function runAutomatedDetection(companyLimit: number = 50): Promise<DetectionResult> {
  const result: DetectionResult = {
    distressIndicators: [],
    growthIndicators: [],
    processedCompanies: 0,
    errors: []
  };

  try {
    // Get companies with recent activity
    const { data: companies, error } = await supabase
      .from('companies')
      .select('id, name')
      .not('average_rating', 'is', null)
      .limit(companyLimit);

    if (error) {
      result.errors.push(`Error fetching companies: ${error.message}`);
      return result;
    }

    if (!companies || companies.length === 0) {
      result.errors.push('No companies found for analysis');
      return result;
    }

    console.log(`Starting automated detection for ${companies.length} companies...`);

    for (const company of companies) {
      try {
        console.log(`Analyzing company: ${company.name}`);

        // Analyze news for the company
        const news = await fetchCompanyNews(company.name, 5);
        
        for (const article of news) {
          const newsContent = `${article.title} ${article.description || ''}`;
          
          // Detect distress indicators
          const distressIndicators = analyzeDistressIndicators(
            company.id, 
            newsContent, 
            article.link
          );
          result.distressIndicators.push(...distressIndicators);

          // Detect growth indicators
          const growthIndicators = analyzeGrowthIndicators(
            company.id, 
            newsContent, 
            article.link
          );
          result.growthIndicators.push(...growthIndicators);
        }

        // Analyze review patterns
        const reviewDistressIndicators = await analyzeReviewPatterns(company.id);
        result.distressIndicators.push(...reviewDistressIndicators);

        const reviewGrowthIndicators = await analyzeGrowthPatterns(company.id);
        result.growthIndicators.push(...reviewGrowthIndicators);

        result.processedCompanies++;

        // Rate limiting delay
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error) {
        const errorMessage = `Error analyzing company ${company.name}: ${error instanceof Error ? error.message : 'Unknown error'}`;
        console.error(errorMessage);
        result.errors.push(errorMessage);
      }
    }

    console.log(`Detection complete. Found ${result.distressIndicators.length} distress indicators and ${result.growthIndicators.length} growth indicators.`);

  } catch (error) {
    const errorMessage = `Fatal error in automated detection: ${error instanceof Error ? error.message : 'Unknown error'}`;
    console.error(errorMessage);
    result.errors.push(errorMessage);
  }

  return result;
}

/**
 * Save detected indicators to database
 */
export async function saveDetectedIndicators(result: DetectionResult): Promise<{ saved: number; errors: number }> {
  let saved = 0;
  let errors = 0;

  // Save distress indicators
  for (const indicator of result.distressIndicators) {
    try {
      const { error } = await supabase
        .from('financial_distress_indicators')
        .insert({
          ...indicator,
          verified: false, // Requires manual verification
          detected_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error saving distress indicator:', error);
        errors++;
      } else {
        saved++;
      }
    } catch (error) {
      console.error('Error saving distress indicator:', error);
      errors++;
    }
  }

  // Save growth indicators
  for (const indicator of result.growthIndicators) {
    try {
      const { error } = await supabase
        .from('rising_startup_indicators')
        .insert({
          ...indicator,
          verified: false, // Requires manual verification
          detected_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error saving growth indicator:', error);
        errors++;
      } else {
        saved++;
      }
    } catch (error) {
      console.error('Error saving growth indicator:', error);
      errors++;
    }
  }

  return { saved, errors };
}
