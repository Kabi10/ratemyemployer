import { createClient } from '@supabase/supabase-js';
import { fetchCompanyNews } from '../src/lib/newsApi';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Parse command line arguments
const args = process.argv.slice(2);
const typeArg = args.find(arg => arg.startsWith('--type='));
const type = typeArg ? typeArg.split('=')[1] : 'both';

if (!['fame', 'shame', 'both'].includes(type)) {
  console.error('Invalid type. Use --type=fame, --type=shame, or --type=both');
  process.exit(1);
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('Missing Supabase credentials. Please check your .env file.');
  process.exit(1);
}

// Initialize Supabase client with service role key to bypass RLS
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function fetchWallNews() {
  try {
    console.log(`Starting news fetch for Wall of ${type === 'both' ? 'Fame and Shame' : type}...`);
    
    // Fetch companies based on type
    if (type === 'fame' || type === 'both') {
      await fetchNewsForWall('fame');
    }
    
    if (type === 'shame' || type === 'both') {
      await fetchNewsForWall('shame');
    }
    
    console.log('News fetching completed successfully');
  } catch (error) {
    console.error('Error fetching news:', error);
    process.exit(1);
  }
}

async function fetchNewsForWall(wallType: 'fame' | 'shame') {
  try {
    console.log(`Fetching companies for Wall of ${wallType}...`);
    
    // Fetch companies with reviews
    const { data: companiesData, error: companiesError } = await supabase
      .from('companies')
      .select(`
        id,
        name,
        industry,
        reviews (
          id,
          rating,
          status
        )
      `)
      .order('id', { ascending: true });
    
    if (companiesError) {
      console.error(`Error fetching companies for Wall of ${wallType}:`, companiesError);
      return;
    }
    
    if (!companiesData || companiesData.length === 0) {
      console.log(`No companies found for Wall of ${wallType}`);
      return;
    }
    
    // Process companies to calculate average ratings
    const processedCompanies = companiesData.map(company => {
      // Only include approved reviews
      const reviews = (company.reviews || []).filter(review => review.status === 'approved');
      const validRatings = reviews.filter(review => review.rating >= 1 && review.rating <= 5);
      
      const averageRating = validRatings.length > 0
        ? validRatings.reduce((sum, review) => sum + review.rating, 0) / validRatings.length
        : 0;
      
      return {
        id: company.id,
        name: company.name,
        industry: company.industry,
        average_rating: averageRating,
        review_count: reviews.length
      };
    });
    
    // Filter companies with at least 1 review and a valid average rating
    const companiesWithReviews = processedCompanies.filter(
      company => company.average_rating > 0 && company.review_count >= 1
    );
    
    // Sort by average rating (highest for fame, lowest for shame)
    const sortedCompanies = wallType === 'fame'
      ? companiesWithReviews.sort((a, b) => b.average_rating - a.average_rating)
      : companiesWithReviews.sort((a, b) => a.average_rating - b.average_rating);
    
    // Get top 10 companies
    const selectedCompanies = sortedCompanies.slice(0, 10);
    
    console.log(`Found ${selectedCompanies.length} companies for Wall of ${wallType}`);
    
    // Fetch news for each company
    for (const company of selectedCompanies) {
      console.log(`Fetching news for ${company.name}...`);
      try {
        const articles = await fetchCompanyNews(company.name);
        console.log(`Found ${articles.length} news articles for ${company.name}`);
      } catch (error) {
        console.error(`Error fetching news for ${company.name}:`, error);
      }
    }
    
    console.log(`Completed news fetch for Wall of ${wallType}`);
  } catch (error) {
    console.error(`Error in fetchNewsForWall(${wallType}):`, error);
  }
}

// Run the function
fetchWallNews(); 