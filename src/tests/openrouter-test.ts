import dotenv from 'dotenv';
import axios from 'axios';
import { parseStringPromise } from 'xml2js';
dotenv.config();

async function fetchRSSFeed(url: string) {
  try {
    const response = await axios.get(url);
    const result = await parseStringPromise(response.data);
    return result.rss.channel[0].item.slice(0, 10); // Get top 10 articles
  } catch (error) {
    console.error(`Error fetching RSS feed from ${url}:`, error);
    return [];
  }
}

async function fetchTechNews() {
  try {
    // Using TechCrunch's AI RSS feed
    const techcrunchNews = await fetchRSSFeed('https://techcrunch.com/tag/artificial-intelligence/feed/');
    
    // Format the news articles
    const articles = techcrunchNews.map((item: any) => ({
      title: item.title[0],
      description: item.description[0].replace(/<[^>]*>/g, ''), // Remove HTML tags
      link: item.link[0],
      pubDate: item.pubDate[0]
    }));

    return articles;
  } catch (error) {
    console.error('Error fetching tech news:', error);
    return [];
  }
}

async function displayTechNews() {
  try {
    console.log('Fetching recent AI news from TechCrunch...\n');
    const newsArticles = await fetchTechNews();
    
    if (newsArticles.length === 0) {
      console.log('No news articles found. There might be an issue with the RSS feed.');
      return;
    }

    console.log('Recent AI News Articles from TechCrunch:');
    console.log('--------------------------------------');
    newsArticles.forEach((article: any, index: number) => {
      console.log(`${index + 1}. ${article.title}`);
      console.log(`   Published: ${article.pubDate}`);
      console.log(`   Summary: ${article.description}`);
      console.log(`   Link: ${article.link}\n`);
    });
    
    return newsArticles;
  } catch (error) {
    console.error('Error fetching news:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
    }
    return [];
  }
}

// Run the news fetcher
displayTechNews(); 