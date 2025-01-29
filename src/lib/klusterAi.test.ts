import { fetchNewsWithKluster } from './klusterAi';

// Mock OpenAI client
jest.mock('openai', () => ({
  OpenAI: jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: jest.fn().mockResolvedValue({
          choices: [
            {
              message: {
                content: JSON.stringify({
                  articles: [
                    {
                      title: 'Test Article',
                      description: 'Test Description',
                      url: 'https://test.com',
                      publishedAt: '2024-01-29T00:00:00Z',
                      sourceName: 'Test Source'
                    }
                  ]
                })
              }
            }
          ]
        })
      }
    }
  }))
}));

describe('Kluster AI News Fetching', () => {
  test('should parse news articles correctly', async () => {
    const companyName = 'Microsoft';
    const articles = await fetchNewsWithKluster(companyName);
    
    expect(Array.isArray(articles)).toBe(true);
    expect(articles.length).toBe(1);
    
    const firstArticle = articles[0];
    expect(firstArticle).toEqual({
      title: 'Test Article',
      description: 'Test Description',
      url: 'https://test.com',
      publishedAt: '2024-01-29T00:00:00Z',
      source: {
        name: 'Test Source'
      }
    });
  });
}); 