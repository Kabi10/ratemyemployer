#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js';
import { Database } from '../src/types/supabase';

// Sample review templates for realistic data
const REVIEW_TEMPLATES = [
  {
    title: 'Great place to work with excellent culture',
    pros: 'Amazing team collaboration, flexible work hours, great benefits package, supportive management',
    cons: 'Sometimes tight deadlines, limited parking space',
    rating: 4.5,
    recommend: true,
    position: 'Software Engineer',
    employment_status: 'current',
    work_life_balance: 4,
    culture_values: 5,
    career_opportunities: 4,
    compensation_benefits: 4,
    senior_management: 4,
  },
  {
    title: 'Good company but room for improvement',
    pros: 'Decent salary, learning opportunities, nice office environment',
    cons: 'Limited career advancement, outdated technology stack, poor work-life balance',
    rating: 3.0,
    recommend: false,
    position: 'Product Manager',
    employment_status: 'former',
    work_life_balance: 2,
    culture_values: 3,
    career_opportunities: 2,
    compensation_benefits: 4,
    senior_management: 3,
  },
  {
    title: 'Excellent leadership and growth opportunities',
    pros: 'Strong leadership team, clear career path, competitive compensation, innovative projects',
    cons: 'High pressure environment, long hours during crunch time',
    rating: 4.0,
    recommend: true,
    position: 'Data Scientist',
    employment_status: 'current',
    work_life_balance: 3,
    culture_values: 4,
    career_opportunities: 5,
    compensation_benefits: 4,
    senior_management: 5,
  },
  {
    title: 'Toxic work environment',
    pros: 'Good pay, modern office',
    cons: 'Micromanagement, no work-life balance, high turnover, poor communication',
    rating: 2.0,
    recommend: false,
    position: 'Marketing Specialist',
    employment_status: 'former',
    work_life_balance: 1,
    culture_values: 2,
    career_opportunities: 2,
    compensation_benefits: 3,
    senior_management: 1,
  },
  {
    title: 'Amazing startup experience',
    pros: 'Fast-paced environment, learning opportunities, equity options, close-knit team',
    cons: 'Uncertain future, limited resources, wearing multiple hats',
    rating: 4.2,
    recommend: true,
    position: 'Full Stack Developer',
    employment_status: 'current',
    work_life_balance: 3,
    culture_values: 5,
    career_opportunities: 4,
    compensation_benefits: 3,
    senior_management: 4,
  },
];

const POSITIONS = [
  'Software Engineer', 'Product Manager', 'Data Scientist', 'Marketing Specialist',
  'Sales Representative', 'HR Manager', 'Financial Analyst', 'UX Designer',
  'DevOps Engineer', 'Business Analyst', 'Customer Success Manager', 'QA Engineer',
];

type ReviewInsert = Database['public']['Tables']['reviews']['Insert'];

async function populateReviews(companyCount: number = 50, reviewsPerCompany: number = 10) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing required environment variables:');
    console.error('- NEXT_PUBLIC_SUPABASE_URL');
    console.error('- SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  const supabase = createClient<Database>(supabaseUrl, supabaseKey);

  console.log(`📝 Fetching companies to populate reviews...`);

  // Get existing companies
  const { data: companies, error: companiesError } = await supabase
    .from('companies')
    .select('id, name')
    .limit(companyCount);

  if (companiesError) {
    console.error('❌ Error fetching companies:', companiesError);
    process.exit(1);
  }

  if (!companies || companies.length === 0) {
    console.error('❌ No companies found. Please run populate-companies.ts first.');
    process.exit(1);
  }

  console.log(`📝 Populating reviews for ${companies.length} companies (${reviewsPerCompany} reviews each)...`);

  const reviews: ReviewInsert[] = [];

  for (const company of companies) {
    for (let i = 0; i < reviewsPerCompany; i++) {
      const template = REVIEW_TEMPLATES[i % REVIEW_TEMPLATES.length];
      const position = POSITIONS[Math.floor(Math.random() * POSITIONS.length)];
      
      // Add some variation to ratings
      const ratingVariation = (Math.random() - 0.5) * 1.0; // ±0.5
      const rating = Math.max(1, Math.min(5, template.rating + ratingVariation));
      
      reviews.push({
        company_id: company.id,
        title: template.title,
        pros: template.pros,
        cons: template.cons,
        rating: Math.round(rating * 10) / 10,
        recommend: Math.random() > 0.3, // 70% recommend
        position: position,
        employment_status: Math.random() > 0.6 ? 'current' : 'former',
        work_life_balance: Math.max(1, Math.min(5, template.work_life_balance + Math.floor((Math.random() - 0.5) * 2))),
        culture_values: Math.max(1, Math.min(5, template.culture_values + Math.floor((Math.random() - 0.5) * 2))),
        career_opportunities: Math.max(1, Math.min(5, template.career_opportunities + Math.floor((Math.random() - 0.5) * 2))),
        compensation_benefits: Math.max(1, Math.min(5, template.compensation_benefits + Math.floor((Math.random() - 0.5) * 2))),
        senior_management: Math.max(1, Math.min(5, template.senior_management + Math.floor((Math.random() - 0.5) * 2))),
        created_at: new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000).toISOString(), // Last 6 months
      });
    }
  }

  // Insert reviews in batches
  const batchSize = 20;
  let inserted = 0;

  for (let i = 0; i < reviews.length; i += batchSize) {
    const batch = reviews.slice(i, i + batchSize);
    
    const { data, error } = await supabase
      .from('reviews')
      .insert(batch)
      .select('id');

    if (error) {
      console.error(`❌ Error inserting batch ${Math.floor(i / batchSize) + 1}:`, error);
      continue;
    }

    inserted += data?.length || 0;
    console.log(`✅ Inserted batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(reviews.length / batchSize)} (${data?.length || 0} reviews)`);
  }

  console.log(`🎉 Successfully populated ${inserted} reviews for ${companies.length} companies!`);
}

// CLI interface
const args = process.argv.slice(2);
const companyCount = args[0] ? parseInt(args[0]) : 50;
const reviewsPerCompany = args[1] ? parseInt(args[1]) : 10;

if (isNaN(companyCount) || companyCount <= 0 || isNaN(reviewsPerCompany) || reviewsPerCompany <= 0) {
  console.error('Usage: tsx scripts/populate-reviews.ts [companyCount] [reviewsPerCompany]');
  console.error('Example: tsx scripts/populate-reviews.ts 50 15');
  process.exit(1);
}

populateReviews(companyCount, reviewsPerCompany).catch(console.error);
