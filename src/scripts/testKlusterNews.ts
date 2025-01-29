import { fetchNewsWithKluster } from '../lib/klusterAi';

async function testNewsApi() {
  try {
    console.log('Testing news fetching for Microsoft...');
    const articles = await fetchNewsWithKluster('Microsoft');
    
    console.log('\nFetched articles:');
    console.log(JSON.stringify(articles, null, 2));
    
    console.log('\nSummary:');
    console.log(`Total articles: ${articles.length}`);
    if (articles.length > 0) {
      console.log('\nFirst article preview:');
      const first = articles[0];
      console.log(`Title: ${first.title}`);
      console.log(`Description: ${first.description?.slice(0, 150)}...`);
      console.log(`Source: ${first.source.name}`);
      console.log(`URL: ${first.url}`);
      console.log(`Published: ${first.publishedAt}`);
    }
  } catch (error) {
    console.error('Error during test:', error);
  }
}

// Run the test
testNewsApi(); 