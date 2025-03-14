import { NewsArticle } from '@/lib/newsApi';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, ExternalLinkIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';

interface NewsCardProps {
  article: NewsArticle;
  companyName: string;
}

export function NewsCard({ article, companyName }: NewsCardProps) {
  // Format the published date
  const formattedDate = article.publishedAt 
    ? formatDistanceToNow(new Date(article.publishedAt), { addSuffix: true })
    : 'Recently';

  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-bold line-clamp-2">{article.title}</CardTitle>
          <Badge variant="outline" className="ml-2 shrink-0">
            {article.source.name}
          </Badge>
        </div>
        <CardDescription className="flex items-center text-sm text-muted-foreground mt-1">
          <CalendarIcon className="h-3 w-3 mr-1" />
          {formattedDate}
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-2">
        {article.description ? (
          <p className="text-sm text-gray-600 line-clamp-3">{article.description}</p>
        ) : (
          <p className="text-sm text-gray-500 italic">No description available</p>
        )}
      </CardContent>
      <CardFooter className="pt-2 flex justify-between">
        <span className="text-xs text-blue-600 font-medium">About {companyName}</span>
        {article.url && (
          <Button variant="ghost" size="sm" className="p-0 h-auto" asChild>
            <a 
              href={article.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800"
            >
              Read more
              <ExternalLinkIcon className="ml-1 h-3 w-3" />
            </a>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
} 