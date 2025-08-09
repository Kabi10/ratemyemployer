#!/usr/bin/env tsx

/**
 * Add Test Data for Financial Distress and Rising Startups Sections
 * Creates sample companies and indicators for testing the new sections
 */

import { createClient } from '@supabase/supabase-js';
import type { Database } from '../src/types/supabase';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing required environment variables');
  process.exit(1);
}

const supabase = createClient<Database>(supabaseUrl, supabaseKey);

// Sample companies for financial distress
const DISTRESS_COMPANIES = [
  {
    name: 'TechCorp Industries',
    industry: 'Technology',
    location: 'San Francisco, CA',
    website: 'https://techcorp.example.com',
    description: 'A technology company facing financial challenges',
    size: '200-1000',
    indicators: [
      {
        indicator_type: 'layoffs',
        severity: 4,
        description: 'Company announced 30% workforce reduction due to funding issues',
        impact_score: 9
      },
      {
        indicator_type: 'funding_issues',
        severity: 5,
        description: 'Failed to secure Series C funding, burning cash rapidly',
        impact_score: 10
      }
    ]
  },
  {
    name: 'RetailMax Solutions',
    industry: 'Retail',
    location: 'Chicago, IL',
    website: 'https://retailmax.example.com',
    description: 'Retail technology company struggling with market changes',
    size: '50-200',
    indicators: [
      {
        indicator_type: 'revenue_decline',
        severity: 3,
        description: 'Q3 revenue down 40% year-over-year',
        impact_score: 7
      },
      {
        indicator_type: 'office_closures',
        severity: 4,
        description: 'Closed 3 regional offices to cut costs',
        impact_score: 8
      }
    ]
  },
  {
    name: 'FinanceFlow Inc',
    industry: 'Finance',
    location: 'New York, NY',
    website: 'https://financeflow.example.com',
    description: 'Financial services company under regulatory pressure',
    size: '1000+',
    indicators: [
      {
        indicator_type: 'leadership_changes',
        severity: 3,
        description: 'CEO and CFO departed within 2 months',
        impact_score: 7
      },
      {
        indicator_type: 'negative_news',
        severity: 4,
        description: 'Under SEC investigation for accounting irregularities',
        impact_score: 9
      }
    ]
  }
];

// Sample companies for rising startups
const RISING_STARTUPS = [
  {
    name: 'AI Innovations Lab',
    industry: 'Technology',
    location: 'Austin, TX',
    website: 'https://ailab.example.com',
    description: 'Cutting-edge AI startup with breakthrough technology',
    size: '50-200',
    indicators: [
      {
        indicator_type: 'funding_round',
        growth_score: 9,
        description: 'Raised $50M Series B led by top-tier VCs',
        funding_amount: 50000000
      },
      {
        indicator_type: 'hiring_spree',
        growth_score: 7,
        description: 'Doubled engineering team in 6 months',
      },
      {
        indicator_type: 'partnerships',
        growth_score: 8,
        description: 'Strategic partnership with Fortune 500 company',
      }
    ]
  },
  {
    name: 'GreenTech Solutions',
    industry: 'Technology',
    location: 'Seattle, WA',
    website: 'https://greentech.example.com',
    description: 'Sustainable technology startup revolutionizing clean energy',
    size: '1-50',
    indicators: [
      {
        indicator_type: 'awards',
        growth_score: 8,
        description: 'Won "Best Clean Tech Startup" at TechCrunch Disrupt',
      },
      {
        indicator_type: 'expansion',
        growth_score: 7,
        description: 'Expanding to European markets with new office in Berlin',
      },
      {
        indicator_type: 'new_products',
        growth_score: 9,
        description: 'Launched revolutionary solar panel technology',
      }
    ]
  },
  {
    name: 'HealthTech Dynamics',
    industry: 'Healthcare',
    location: 'Boston, MA',
    website: 'https://healthtech.example.com',
    description: 'Healthcare technology startup improving patient outcomes',
    size: '50-200',
    indicators: [
      {
        indicator_type: 'funding_round',
        growth_score: 8,
        description: 'Completed $25M Series A funding round',
        funding_amount: 25000000
      },
      {
        indicator_type: 'positive_news',
        growth_score: 7,
        description: 'Featured in Forbes "30 Under 30" healthcare list',
      },
      {
        indicator_type: 'revenue_growth',
        growth_score: 9,
        description: 'Revenue grew 300% year-over-year',
      }
    ]
  },
  {
    name: 'DataStream Analytics',
    industry: 'Technology',
    location: 'San Jose, CA',
    website: 'https://datastream.example.com',
    description: 'Big data analytics startup serving enterprise clients',
    size: '50-200',
    indicators: [
      {
        indicator_type: 'ipo_preparation',
        growth_score: 10,
        description: 'Filed S-1 for IPO, targeting $2B valuation',
        valuation: 2000000000
      },
      {
        indicator_type: 'acquisition_interest',
        growth_score: 9,
        description: 'Multiple acquisition offers from tech giants',
      }
    ]
  }
];

async function addTestData() {
  console.log('🚀 Adding test data for Financial Distress and Rising Startups sections...');

  try {
    // Add distress companies
    console.log('\n🚨 Adding financial distress companies...');
    for (const companyData of DISTRESS_COMPANIES) {
      const { indicators, ...company } = companyData;
      
      // Insert company
      const { data: insertedCompany, error: companyError } = await supabase
        .from('companies')
        .insert({
          ...company,
          verified: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (companyError) {
        console.error(`❌ Error adding company ${company.name}:`, companyError);
        continue;
      }

      console.log(`✅ Added company: ${company.name}`);

      // Add distress indicators
      for (const indicator of indicators) {
        const { error: indicatorError } = await supabase
          .from('financial_distress_indicators')
          .insert({
            company_id: insertedCompany.id,
            ...indicator,
            verified: true,
            detected_at: new Date().toISOString(),
            created_at: new Date().toISOString()
          });

        if (indicatorError) {
          console.error(`❌ Error adding indicator for ${company.name}:`, indicatorError);
        } else {
          console.log(`  ✅ Added ${indicator.indicator_type} indicator`);
        }
      }

      // Update company status
      const { error: statusError } = await supabase
        .from('company_status_tracking')
        .insert({
          company_id: insertedCompany.id,
          status: 'financial_distress',
          confidence_score: 85,
          automated_detection: false,
          manual_override: true,
          notes: 'Test data for financial distress section',
          last_updated: new Date().toISOString(),
          created_at: new Date().toISOString()
        });

      if (statusError) {
        console.error(`❌ Error updating status for ${company.name}:`, statusError);
      }
    }

    // Add rising startups
    console.log('\n🚀 Adding rising startup companies...');
    for (const companyData of RISING_STARTUPS) {
      const { indicators, ...company } = companyData;
      
      // Insert company
      const { data: insertedCompany, error: companyError } = await supabase
        .from('companies')
        .insert({
          ...company,
          verified: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (companyError) {
        console.error(`❌ Error adding company ${company.name}:`, companyError);
        continue;
      }

      console.log(`✅ Added company: ${company.name}`);

      // Add growth indicators
      for (const indicator of indicators) {
        const { error: indicatorError } = await supabase
          .from('rising_startup_indicators')
          .insert({
            company_id: insertedCompany.id,
            ...indicator,
            verified: true,
            detected_at: new Date().toISOString(),
            created_at: new Date().toISOString()
          });

        if (indicatorError) {
          console.error(`❌ Error adding indicator for ${company.name}:`, indicatorError);
        } else {
          console.log(`  ✅ Added ${indicator.indicator_type} indicator`);
        }
      }

      // Update company status
      const { error: statusError } = await supabase
        .from('company_status_tracking')
        .insert({
          company_id: insertedCompany.id,
          status: 'rising_startup',
          confidence_score: 90,
          automated_detection: false,
          manual_override: true,
          notes: 'Test data for rising startups section',
          last_updated: new Date().toISOString(),
          created_at: new Date().toISOString()
        });

      if (statusError) {
        console.error(`❌ Error updating status for ${company.name}:`, statusError);
      }
    }

    // Add some sample reviews for the companies
    console.log('\n📝 Adding sample reviews...');
    
    // Get all inserted companies
    const { data: companies, error: companiesError } = await supabase
      .from('companies')
      .select('id, name')
      .in('name', [
        ...DISTRESS_COMPANIES.map(c => c.name),
        ...RISING_STARTUPS.map(c => c.name)
      ]);

    if (companiesError) {
      console.error('❌ Error fetching companies for reviews:', companiesError);
    } else if (companies) {
      for (const company of companies) {
        const isDistressCompany = DISTRESS_COMPANIES.some(c => c.name === company.name);
        
        // Add 2-3 reviews per company
        const reviewCount = Math.floor(Math.random() * 2) + 2;
        
        for (let i = 0; i < reviewCount; i++) {
          const rating = isDistressCompany 
            ? Math.floor(Math.random() * 2) + 1 // 1-2 for distress companies
            : Math.floor(Math.random() * 2) + 4; // 4-5 for rising startups

          const { error: reviewError } = await supabase
            .from('reviews')
            .insert({
              company_id: company.id,
              rating,
              title: isDistressCompany 
                ? `Challenging times at ${company.name}`
                : `Great experience at ${company.name}`,
              pros: isDistressCompany
                ? 'Some good people, learning opportunities'
                : 'Amazing culture, great benefits, innovative work',
              cons: isDistressCompany
                ? 'Layoffs, uncertainty, poor management decisions'
                : 'Fast-paced environment, high expectations',
              position: 'Software Engineer',
              employment_status: 'Full-time',
              is_current_employee: false,
              recommend: !isDistressCompany,
              status: 'approved',
              created_at: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString()
            });

          if (reviewError) {
            console.error(`❌ Error adding review for ${company.name}:`, reviewError);
          }
        }
        
        console.log(`✅ Added reviews for ${company.name}`);
      }
    }

    console.log('\n🎉 Test data added successfully!');
    console.log('\n📊 Summary:');
    console.log(`  • ${DISTRESS_COMPANIES.length} companies in financial distress`);
    console.log(`  • ${RISING_STARTUPS.length} rising startup companies`);
    console.log(`  • Multiple indicators and reviews for each company`);
    console.log('\n🔗 You can now visit:');
    console.log('  • /financial-distress - View companies in financial distress');
    console.log('  • /rising-startups - View rising startup companies');

  } catch (error) {
    console.error('❌ Fatal error adding test data:', error);
    process.exit(1);
  }
}

// Run the script
addTestData().catch(console.error);
