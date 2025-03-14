import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Building2, 
  MapPin, 
  Star, 
  Users, 
  ChevronDown, 
  ChevronUp,
  ExternalLink
} from 'lucide-react';
import { CompanyNewsSection } from '@/components/CompanyNewsSection';
import { NewsArticle } from '@/lib/newsApi';
import type { CompanyWithReviews } from '@/types/database';

interface EnhancedCompanyCardProps {
  company: CompanyWithReviews;
  rank: number;
  news?: NewsArticle[];
  isWallOfFame?: boolean;
}

export function EnhancedCompanyCard({ 
  company, 
  rank, 
  news = [],
  isWallOfFame = true
}: EnhancedCompanyCardProps) {
  const [expanded, setExpanded] = useState(false);
  
  // Determine color based on rating
  const getRatingColor = (rating: number) => {
    if (rating < 2.5) return 'text-red-500';
    if (rating < 3.5) return 'text-amber-500';
    return 'text-green-500';
  };
  
  // Determine background color based on rank and type
  const getBackgroundColor = () => {
    if (isWallOfFame) {
      if (rank === 1) return 'bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200';
      if (rank === 2) return 'bg-gradient-to-br from-slate-50 to-slate-100 border-slate-200';
      if (rank === 3) return 'bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200';
      return 'bg-white';
    } else {
      if (rank === 1) return 'bg-gradient-to-br from-red-50 to-red-100 border-red-200';
      if (rank === 2) return 'bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200';
      if (rank === 3) return 'bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200';
      return 'bg-white';
    }
  };
  
  // Determine badge for top ranks
  const getRankBadge = () => {
    if (rank > 3) return null;
    
    const badges = {
      1: { text: '1st Place', class: isWallOfFame ? 'bg-amber-500' : 'bg-red-500' },
      2: { text: '2nd Place', class: isWallOfFame ? 'bg-slate-400' : 'bg-orange-500' },
      3: { text: '3rd Place', class: isWallOfFame ? 'bg-orange-500' : 'bg-amber-500' }
    };
    
    return (
      <Badge className={`absolute top-4 right-4 ${badges[rank as 1 | 2 | 3].class} text-white`}>
        {badges[rank as 1 | 2 | 3].text}
      </Badge>
    );
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: rank * 0.1 }}
    >
      <Card className={`overflow-hidden border-2 ${getBackgroundColor()} relative`}>
        {getRankBadge()}
        
        <CardHeader className="pb-2">
          <div className="flex items-center">
            <div className="mr-4 flex-shrink-0">
              {company.logo_url ? (
                <Image 
                  src={company.logo_url} 
                  alt={`${company.name} logo`} 
                  width={60} 
                  height={60} 
                  className="rounded-md object-contain bg-white p-1"
                />
              ) : (
                <div className="w-[60px] h-[60px] bg-gray-100 rounded-md flex items-center justify-center">
                  <Building2 className="h-8 w-8 text-gray-400" />
                </div>
              )}
            </div>
            <div>
              <CardTitle className="text-2xl font-bold">
                {company.name}
              </CardTitle>
              <CardDescription className="flex flex-wrap gap-2 mt-1">
                {company.industry && (
                  <Badge variant="outline" className="font-normal">
                    {company.industry}
                  </Badge>
                )}
                {company.location && (
                  <span className="flex items-center text-sm text-gray-500">
                    <MapPin className="h-3 w-3 mr-1" />
                    {company.location}
                  </span>
                )}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pb-2">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
            <div className="flex flex-col items-center p-3 bg-gray-50 rounded-lg">
              <div className={`text-2xl font-bold ${getRatingColor(company.average_rating)}`}>
                {company.average_rating.toFixed(1)}
              </div>
              <div className="flex items-center mt-1">
                <Star className="h-4 w-4 text-yellow-400 mr-1" />
                <span className="text-sm text-gray-600">Average Rating</span>
              </div>
            </div>
            
            <div className="flex flex-col items-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {company.reviews?.length || 0}
              </div>
              <div className="flex items-center mt-1">
                <Users className="h-4 w-4 text-blue-400 mr-1" />
                <span className="text-sm text-gray-600">Reviews</span>
              </div>
            </div>
            
            <div className="flex flex-col items-center p-3 bg-gray-50 rounded-lg col-span-2 md:col-span-1">
              <div className="text-2xl font-bold text-purple-600">
                {company.recommend_percentage ? `${company.recommend_percentage}%` : 'N/A'}
              </div>
              <div className="text-sm text-gray-600 text-center mt-1">
                Would Recommend
              </div>
            </div>
          </div>
          
          {company.description && (
            <p className="text-gray-600 text-sm mb-4 line-clamp-2">
              {company.description}
            </p>
          )}
          
          {expanded && (
            <div className="mt-6">
              <CompanyNewsSection 
                companyName={company.name} 
                initialNews={news}
              />
            </div>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-between pt-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? (
              <>
                <ChevronUp className="h-4 w-4 mr-1" />
                Hide News
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4 mr-1" />
                Show News
              </>
            )}
          </Button>
          
          <Button asChild>
            <Link href={`/companies/${company.id}`}>
              View Details
              <ExternalLink className="h-4 w-4 ml-1" />
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
} 