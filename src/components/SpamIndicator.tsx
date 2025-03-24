'use client';

import { useState, useEffect } from 'react';
import { AlertCircle, Check, AlertTriangle, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface SpamIndicatorProps {
  reviewTitle: string;
  reviewContent: string;
  reviewerId: string | null;
  reviewerJoinDate?: string | null;
}

export function SpamIndicator({
  reviewTitle,
  reviewContent,
  reviewerId,
  reviewerJoinDate
}: SpamIndicatorProps) {
  const [spamScore, setSpamScore] = useState(0);
  const [spamIndicators, setSpamIndicators] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(true);

  useEffect(() => {
    // Simple spam detection based on content
    const indicators: string[] = [];
    let score = 0;

    // Analyze the combined content
    const content = `${reviewTitle} ${reviewContent}`.toLowerCase();

    // Check for all caps or excessive punctuation
    if (reviewTitle.toUpperCase() === reviewTitle && reviewTitle.length > 10) {
      indicators.push('Title uses all capital letters');
      score += 10;
    }

    // Check for excessive punctuation or repeated characters
    if (/!{3,}/.test(content) || /\?{3,}/.test(content)) {
      indicators.push('Excessive punctuation (!!! or ???)');
      score += 5;
    }

    // Check for repeated words
    const words = content.split(/\s+/);
    const wordCounts = new Map<string, number>();
    words.forEach(word => {
      if (word.length > 3) { // Only count words longer than 3 chars
        wordCounts.set(word, (wordCounts.get(word) || 0) + 1);
      }
    });
    
    const repeatedWords = [...wordCounts.entries()]
      .filter(([word, count]) => count > 3 && word.length > 3)
      .map(([word]) => word);
    
    if (repeatedWords.length > 0) {
      indicators.push(`Repetitive words: ${repeatedWords.join(', ')}`);
      score += 5 * Math.min(repeatedWords.length, 3); // Cap at 15 points
    }

    // Check for very short review
    if (reviewContent.length < 30) {
      indicators.push('Very short review content');
      score += 10;
    }

    // Check for promotional links
    const urlPattern = /(https?:\/\/[^\s]+)/g;
    const urls = content.match(urlPattern) || [];
    if (urls.length > 0) {
      indicators.push('Contains URLs');
      score += 10 * urls.length;
    }

    // Check for very new account
    if (reviewerJoinDate) {
      const joinDate = new Date(reviewerJoinDate);
      const now = new Date();
      const daysSinceJoin = Math.floor((now.getTime() - joinDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysSinceJoin < 7) {
        indicators.push('Very new account (less than 7 days)');
        score += 15;
      } else if (daysSinceJoin < 30) {
        indicators.push('New account (less than 30 days)');
        score += 5;
      }
    }

    setSpamScore(score);
    setSpamIndicators(indicators);
    setIsAnalyzing(false);
  }, [reviewTitle, reviewContent, reviewerId, reviewerJoinDate]);

  const getSpamBadge = () => {
    if (isAnalyzing) return null;

    if (spamScore >= 30) {
      return (
        <Badge variant="destructive" className="flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          High Spam Risk
        </Badge>
      );
    } else if (spamScore >= 15) {
      return (
        <Badge variant="warning" className="flex items-center gap-1 bg-amber-500">
          <AlertTriangle className="h-3 w-3" />
          Possible Spam
        </Badge>
      );
    } else if (spamScore > 0) {
      return (
        <Badge variant="outline" className="flex items-center gap-1">
          <Info className="h-3 w-3" />
          Low Risk
        </Badge>
      );
    } else {
      return (
        <Badge variant="success" className="flex items-center gap-1 bg-green-500">
          <Check className="h-3 w-3" />
          Looks Genuine
        </Badge>
      );
    }
  };

  if (isAnalyzing) {
    return <Badge variant="outline">Analyzing...</Badge>;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div>{getSpamBadge()}</div>
        </TooltipTrigger>
        <TooltipContent className="w-80">
          <div className="space-y-2">
            <div className="font-semibold">Spam Analysis</div>
            <div className="text-sm">
              {spamIndicators.length > 0 ? (
                <ul className="list-disc pl-4 space-y-1">
                  {spamIndicators.map((indicator, index) => (
                    <li key={index}>{indicator}</li>
                  ))}
                </ul>
              ) : (
                <p>No spam indicators detected.</p>
              )}
            </div>
            <div className="text-xs text-muted-foreground">
              Spam score: {spamScore}/100
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
} 