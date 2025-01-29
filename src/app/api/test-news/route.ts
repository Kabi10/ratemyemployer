import { NextResponse } from 'next/server';
import { fetchNewsWithKluster } from '@/lib/klusterAi';

export async function GET() {
  try {
    console.log('Starting news fetch for Microsoft...');
    
    const articles = await fetchNewsWithKluster('Microsoft');
    
    console.log('Response from fetchNewsWithKluster:', {
      articleCount: articles.length,
      firstArticle: articles[0] || null
    });

    return NextResponse.json({
      success: true,
      articles,
      summary: {
        totalArticles: articles.length,
        firstArticle: articles[0] || null
      }
    });
  } catch (error) {
    console.error('Error in test-news route:', {
      name: error instanceof Error ? error.name : 'Unknown error',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    
    // Return a more detailed error response
    return NextResponse.json({
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
        type: error instanceof Error ? error.name : 'UnknownError',
        details: error instanceof Error && 'status' in error ? (error as any).response?.data : undefined
      },
      articles: [],
      summary: {
        totalArticles: 0,
        firstArticle: null
      }
    }, { status: 500 });
  }
} 