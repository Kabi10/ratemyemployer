#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js';
import { Database } from '../src/types/supabase';

// Sample company data for realistic population
const SAMPLE_COMPANIES = [
  {
    name: 'TechCorp Solutions',
    industry: 'Technology',
    location: 'San Francisco, CA',
    size: '1000-5000',
    website: 'https://techcorp.example.com',
    description: 'Leading software development company specializing in enterprise solutions.',
  },
  {
    name: 'Global Finance Inc',
    industry: 'Finance',
    location: 'New York, NY',
    size: '5000+',
    website: 'https://globalfinance.example.com',
    description: 'International financial services and investment banking.',
  },
  {
    name: 'HealthTech Innovations',
    industry: 'Healthcare',
    location: 'Boston, MA',
    size: '500-1000',
    website: 'https://healthtech.example.com',
    description: 'Medical technology and healthcare software solutions.',
  },
  {
    name: 'EcoEnergy Systems',
    industry: 'Energy',
    location: 'Austin, TX',
    size: '100-500',
    website: 'https://ecoenergy.example.com',
    description: 'Renewable energy solutions and sustainable technology.',
  },
  {
    name: 'RetailMax Corporation',
    industry: 'Retail',
    location: 'Chicago, IL',
    size: '10000+',
    website: 'https://retailmax.example.com',
    description: 'Large retail chain with nationwide presence.',
  },
  {
    name: 'EduLearn Platform',
    industry: 'Education',
    location: 'Seattle, WA',
    size: '50-100',
    website: 'https://edulearn.example.com',
    description: 'Online education platform and learning management systems.',
  },
  {
    name: 'ManufacturePro',
    industry: 'Manufacturing',
    location: 'Detroit, MI',
    size: '1000-5000',
    website: 'https://manufacturepro.example.com',
    description: 'Industrial manufacturing and automation solutions.',
  },
  {
    name: 'CloudFirst Technologies',
    industry: 'Technology',
    location: 'San Jose, CA',
    size: '200-500',
    website: 'https://cloudfirst.example.com',
    description: 'Cloud infrastructure and DevOps solutions provider.',
  },
];

type CompanyInsert = Database['public']['Tables']['companies']['Insert'];

async function populateCompanies(count: number = 50) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing required environment variables:');
    console.error('- NEXT_PUBLIC_SUPABASE_URL');
    console.error('- SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  const supabase = createClient<Database>(supabaseUrl, supabaseKey);

  console.log(`🏢 Populating ${count} companies...`);

  const companies: CompanyInsert[] = [];

  for (let i = 0; i < count; i++) {
    const template = SAMPLE_COMPANIES[i % SAMPLE_COMPANIES.length];
    const suffix = i >= SAMPLE_COMPANIES.length ? ` ${Math.floor(i / SAMPLE_COMPANIES.length) + 1}` : '';
    
    companies.push({
      name: `${template.name}${suffix}`,
      industry: template.industry,
      location: template.location,
      size: template.size,
      website: template.website.replace('.example.com', `${i}.example.com`),
      description: template.description,
      average_rating: Math.round((Math.random() * 4 + 1) * 10) / 10, // 1.0 to 5.0
      review_count: Math.floor(Math.random() * 200) + 5, // 5 to 204
      recommend_percentage: Math.round((Math.random() * 60 + 20) * 10) / 10, // 20% to 80%
      created_at: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
    });
  }

  // Insert companies in batches to avoid timeout
  const batchSize = 10;
  let inserted = 0;

  for (let i = 0; i < companies.length; i += batchSize) {
    const batch = companies.slice(i, i + batchSize);
    
    const { data, error } = await supabase
      .from('companies')
      .upsert(batch, { 
        onConflict: 'name',
        ignoreDuplicates: false 
      })
      .select('id, name');

    if (error) {
      console.error(`❌ Error inserting batch ${Math.floor(i / batchSize) + 1}:`, error);
      continue;
    }

    inserted += data?.length || 0;
    console.log(`✅ Inserted batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(companies.length / batchSize)} (${data?.length || 0} companies)`);
  }

  console.log(`🎉 Successfully populated ${inserted} companies!`);
}

// CLI interface
const args = process.argv.slice(2);
const count = args[0] ? parseInt(args[0]) : 50;

if (isNaN(count) || count <= 0) {
  console.error('Usage: tsx scripts/populate-companies.ts [count]');
  console.error('Example: tsx scripts/populate-companies.ts 100');
  process.exit(1);
}

populateCompanies(count).catch(console.error);
