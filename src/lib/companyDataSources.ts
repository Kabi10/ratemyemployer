/**
 * Company Data Sources Integration
 * Automated methods to populate the database with company data from various free sources
 */

import { supabase } from './supabaseClient';
import type { Database } from '@/types/supabase';

type CompanyInsert = Database['public']['Tables']['companies']['Insert'];

interface ExternalCompany {
  name: string;
  industry?: string;
  location?: string;
  website?: string;
  description?: string;
  size?: string;
  source: string;
}

// Fortune 500 companies (public data)
const FORTUNE_500_SAMPLE = [
  { name: 'Apple Inc.', industry: 'Technology', location: 'Cupertino, CA', website: 'https://apple.com', size: '10000+' },
  { name: 'Microsoft Corporation', industry: 'Technology', location: 'Redmond, WA', website: 'https://microsoft.com', size: '10000+' },
  { name: 'Amazon.com Inc.', industry: 'Technology', location: 'Seattle, WA', website: 'https://amazon.com', size: '10000+' },
  { name: 'Alphabet Inc.', industry: 'Technology', location: 'Mountain View, CA', website: 'https://abc.xyz', size: '10000+' },
  { name: 'Tesla Inc.', industry: 'Technology', location: 'Austin, TX', website: 'https://tesla.com', size: '5000-10000' },
  { name: 'Meta Platforms Inc.', industry: 'Technology', location: 'Menlo Park, CA', website: 'https://meta.com', size: '10000+' },
  { name: 'NVIDIA Corporation', industry: 'Technology', location: 'Santa Clara, CA', website: 'https://nvidia.com', size: '1000-5000' },
  { name: 'JPMorgan Chase & Co.', industry: 'Finance', location: 'New York, NY', website: 'https://jpmorganchase.com', size: '10000+' },
  { name: 'Johnson & Johnson', industry: 'Healthcare', location: 'New Brunswick, NJ', website: 'https://jnj.com', size: '10000+' },
  { name: 'Procter & Gamble Co.', industry: 'Manufacturing', location: 'Cincinnati, OH', website: 'https://pg.com', size: '10000+' },
];

// Tech startups (public data from various sources)
const TECH_STARTUPS_SAMPLE = [
  { name: 'Stripe', industry: 'Technology', location: 'San Francisco, CA', website: 'https://stripe.com', size: '1000-5000' },
  { name: 'Figma', industry: 'Technology', location: 'San Francisco, CA', website: 'https://figma.com', size: '500-1000' },
  { name: 'Notion', industry: 'Technology', location: 'San Francisco, CA', website: 'https://notion.so', size: '100-500' },
  { name: 'Discord', industry: 'Technology', location: 'San Francisco, CA', website: 'https://discord.com', size: '500-1000' },
  { name: 'Canva', industry: 'Technology', location: 'Sydney, Australia', website: 'https://canva.com', size: '1000-5000' },
  { name: 'Zoom Video Communications', industry: 'Technology', location: 'San Jose, CA', website: 'https://zoom.us', size: '5000-10000' },
  { name: 'Slack Technologies', industry: 'Technology', location: 'San Francisco, CA', website: 'https://slack.com', size: '1000-5000' },
  { name: 'Dropbox', industry: 'Technology', location: 'San Francisco, CA', website: 'https://dropbox.com', size: '1000-5000' },
];

/**
 * Normalize industry names to match our schema
 */
function normalizeIndustry(industry: string): string {
  const industryMap: Record<string, string> = {
    'tech': 'Technology',
    'technology': 'Technology',
    'software': 'Technology',
    'finance': 'Finance',
    'financial': 'Finance',
    'banking': 'Finance',
    'healthcare': 'Healthcare',
    'health': 'Healthcare',
    'medical': 'Healthcare',
    'education': 'Education',
    'manufacturing': 'Manufacturing',
    'retail': 'Retail',
    'ecommerce': 'Retail',
    'e-commerce': 'Retail',
  };

  const normalized = industry.toLowerCase();
  return industryMap[normalized] || 'Other';
}

/**
 * Normalize company size to match our schema
 */
function normalizeSize(size: string): string {
  const sizeMap: Record<string, string> = {
    'startup': '1-50',
    'small': '1-50',
    'medium': '50-200',
    'large': '200-1000',
    'enterprise': '1000+',
    '1-10': '1-50',
    '11-50': '1-50',
    '51-200': '50-200',
    '201-500': '200-1000',
    '501-1000': '200-1000',
    '1001-5000': '1000+',
    '5001+': '1000+',
    '10000+': '1000+',
  };

  return sizeMap[size] || size;
}

/**
 * Check if company already exists in database
 */
async function companyExists(name: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('companies')
    .select('id')
    .ilike('name', name)
    .limit(1);

  if (error) {
    console.error('Error checking company existence:', error);
    return false;
  }

  return data && data.length > 0;
}

/**
 * Insert company into database with validation
 */
async function insertCompany(company: ExternalCompany): Promise<boolean> {
  try {
    // Check if company already exists
    if (await companyExists(company.name)) {
      console.log(`Company "${company.name}" already exists, skipping...`);
      return false;
    }

    const companyData: CompanyInsert = {
      name: company.name,
      industry: company.industry ? normalizeIndustry(company.industry) : null,
      location: company.location || null,
      website: company.website || null,
      description: company.description || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from('companies')
      .insert(companyData);

    if (error) {
      console.error(`Error inserting company "${company.name}":`, error);
      return false;
    }

    console.log(`✅ Successfully added company: ${company.name}`);
    return true;
  } catch (error) {
    console.error(`Error processing company "${company.name}":`, error);
    return false;
  }
}

/**
 * Populate database with Fortune 500 companies
 */
export async function populateFortune500Companies(): Promise<{ success: number; skipped: number; errors: number }> {
  console.log('🏢 Starting Fortune 500 companies population...');
  
  let success = 0;
  let skipped = 0;
  let errors = 0;

  for (const company of FORTUNE_500_SAMPLE) {
    const externalCompany: ExternalCompany = {
      ...company,
      source: 'Fortune 500',
      description: `${company.name} is a Fortune 500 company in the ${company.industry} industry.`,
    };

    const result = await insertCompany(externalCompany);
    if (result) {
      success++;
    } else {
      const exists = await companyExists(company.name);
      if (exists) {
        skipped++;
      } else {
        errors++;
      }
    }

    // Rate limiting delay
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log(`🎉 Fortune 500 population complete: ${success} added, ${skipped} skipped, ${errors} errors`);
  return { success, skipped, errors };
}

/**
 * Populate database with tech startups
 */
export async function populateTechStartups(): Promise<{ success: number; skipped: number; errors: number }> {
  console.log('🚀 Starting tech startups population...');
  
  let success = 0;
  let skipped = 0;
  let errors = 0;

  for (const company of TECH_STARTUPS_SAMPLE) {
    const externalCompany: ExternalCompany = {
      ...company,
      source: 'Tech Startups',
      description: `${company.name} is a technology company known for innovation and growth.`,
    };

    const result = await insertCompany(externalCompany);
    if (result) {
      success++;
    } else {
      const exists = await companyExists(company.name);
      if (exists) {
        skipped++;
      } else {
        errors++;
      }
    }

    // Rate limiting delay
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log(`🎉 Tech startups population complete: ${success} added, ${skipped} skipped, ${errors} errors`);
  return { success, skipped, errors };
}

/**
 * Fetch companies from OpenStreetMap Nominatim (free)
 * This searches for companies in specific locations
 */
export async function fetchCompaniesFromNominatim(location: string, limit: number = 10): Promise<ExternalCompany[]> {
  try {
    const query = encodeURIComponent(`company ${location}`);
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=${limit}&addressdetails=1`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'RateMyEmployer/1.0 (company-discovery)'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const companies: ExternalCompany[] = [];

    for (const item of data) {
      if (item.display_name && item.display_name.includes('company')) {
        companies.push({
          name: item.display_name.split(',')[0].trim(),
          location: `${item.address?.city || ''}, ${item.address?.state || ''}`.trim(),
          source: 'OpenStreetMap',
          industry: 'Other',
        });
      }
    }

    return companies;
  } catch (error) {
    console.error('Error fetching from Nominatim:', error);
    return [];
  }
}

/**
 * Bulk import companies from CSV data
 */
export async function bulkImportFromCSV(csvData: string): Promise<{ success: number; skipped: number; errors: number }> {
  console.log('📊 Starting bulk CSV import...');
  
  const lines = csvData.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  
  let success = 0;
  let skipped = 0;
  let errors = 0;

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());
    const company: ExternalCompany = {
      name: '',
      source: 'CSV Import',
    };

    // Map CSV columns to company fields
    headers.forEach((header, index) => {
      const value = values[index] || '';
      switch (header) {
        case 'name':
        case 'company_name':
          company.name = value;
          break;
        case 'industry':
          company.industry = value;
          break;
        case 'location':
        case 'city':
          company.location = value;
          break;
        case 'website':
        case 'url':
          company.website = value;
          break;
        case 'description':
          company.description = value;
          break;
        case 'size':
          company.size = value;
          break;
      }
    });

    if (!company.name) {
      console.warn(`Skipping row ${i + 1}: No company name found`);
      errors++;
      continue;
    }

    const result = await insertCompany(company);
    if (result) {
      success++;
    } else {
      const exists = await companyExists(company.name);
      if (exists) {
        skipped++;
      } else {
        errors++;
      }
    }

    // Rate limiting delay
    await new Promise(resolve => setTimeout(resolve, 50));
  }

  console.log(`🎉 CSV import complete: ${success} added, ${skipped} skipped, ${errors} errors`);
  return { success, skipped, errors };
}
