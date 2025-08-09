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
  ExternalLink,
  Briefcase,
  TrendingUp,
  TrendingDown,
  ThumbsUp,
  Calendar,
  DollarSign
} from 'lucide-react';
import { CompanyNewsSection } from '@/components/CompanyNewsSection';
import { NewsArticle } from '@/lib/newsApi';
import type { CompanyWithReviews } from '@/types/database';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
  const [activeTab, setActiveTab] = useState('overview');
  
  // Determine color based on rating
  const getRatingColor = (rating: number) => {
    if (rating < 2.5) return 'text-red-500';
    if (rating < 3.5) return 'text-amber-500';
    return 'text-green-500';
  };
  
  // Determine progress bar color based on rating
  const getProgressColor = (rating: number) => {
    if (rating < 2.5) return 'bg-red-500';
    if (rating < 3.5) return 'bg-amber-500';
    return 'bg-green-500';
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

  // Calculate trend indicator
  const getTrendIndicator = () => {
    // This would ideally be calculated based on historical data
    // For now, we'll use a simple comparison with the industry average
    const industryAvg = 3.2; // This should come from actual data
    const diff = company.average_rating - industryAvg;
    
    if (diff > 0.5) {
      return (
        <div className="flex items-center text-green-500">
          <TrendingUp className="h-4 w-4 mr-1" />
          <span className="text-xs">Above Industry Avg</span>
        </div>
      );
    } else if (diff < -0.5) {
      return (
        <div className="flex items-center text-red-500">
          <TrendingDown className="h-4 w-4 mr-1" />
          <span className="text-xs">Below Industry Avg</span>
        </div>
      );
    }
    
    return (
      <div className="flex items-center text-gray-500">
        <span className="text-xs">Industry Average</span>
      </div>
    );
  };
  
  // Format the founded date
  const getFoundedDate = () => {
    // Since founded_year doesn't exist in the database, return 'Unknown'
    return 'Unknown';
  };

  // Get company size display
  const getCompanySize = () => {
    // Since size doesn't exist in the database, return 'Unknown'
    return 'Unknown';
  };
  
  // Get salary range
  const getSalaryRange = () => {
    // Since salary_range doesn't exist in the database, return 'Not reported'
    return 'Not reported';
  };

  // Get data freshness indicator
  const getDataFreshness = () => {
    if (news.length > 0) {
      const latestNews = new Date(news[0].publishedAt);
      const daysSince = Math.floor((Date.now() - latestNews.getTime()) / (1000 * 60 * 60 * 24));

      if (daysSince <= 7) {
        return <Badge variant="outline" className="text-green-600 border-green-600">Fresh Data</Badge>;
      } else if (daysSince <= 30) {
        return <Badge variant="outline" className="text-yellow-600 border-yellow-600">Recent Data</Badge>;
      }
    }
    return <Badge variant="outline" className="text-gray-500 border-gray-500">Limited Data</Badge>;
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: rank * 0.1 }}
      whileHover={{ y: -4 }}
      className="group"
    >
      <Card className={`overflow-hidden border-2 ${getBackgroundColor()} relative transition-all duration-300 hover:shadow-xl hover:shadow-blue-100/50 dark:hover:shadow-blue-900/20`}>
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
                {getDataFreshness()}
                {company.website && (
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-500 hover:underline"
                  >
                    Visit Website
                  </a>
                )}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pb-2">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="ratings">Ratings</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                <motion.div
                  className="flex flex-col items-center p-3 bg-gray-50 rounded-lg transition-all duration-200 hover:bg-gray-100"
                  whileHover={{ scale: 1.02 }}
                >
                  <motion.div
                    className={`text-2xl font-bold ${getRatingColor(company.average_rating)}`}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  >
                    {company.average_rating.toFixed(1)}
                  </motion.div>
                  <div className="flex items-center mt-1">
                    <motion.div
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ delay: 0.5, duration: 0.6 }}
                    >
                      <Star className="h-4 w-4 text-yellow-400 mr-1" />
                    </motion.div>
                    <span className="text-sm text-gray-600">Average Rating</span>
                  </div>
                  {getTrendIndicator()}
                </motion.div>
                
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
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {company.description}
                </p>
              )}
            </TabsContent>
            
            <TabsContent value="ratings">
              <div className="space-y-3">
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Overall Rating</span>
                    <span className={getRatingColor(company.average_rating)}>
                      {company.average_rating.toFixed(1)}
                    </span>
                  </div>
                  <Progress 
                    value={company.average_rating * 20} 
                    className="h-2"
                    indicatorClassName={getProgressColor(company.average_rating)}
                  />
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Work/Life Balance</span>
                    <span className={getRatingColor(company.work_life_balance || 0)}>
                      {company.work_life_balance?.toFixed(1) || 'N/A'}
                    </span>
                  </div>
                  <Progress 
                    value={(company.work_life_balance || 0) * 20} 
                    className="h-2"
                    indicatorClassName={getProgressColor(company.work_life_balance || 0)}
                  />
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Compensation</span>
                    <span className={getRatingColor(company.compensation || 0)}>
                      {company.compensation?.toFixed(1) || 'N/A'}
                    </span>
                  </div>
                  <Progress 
                    value={(company.compensation || 0) * 20} 
                    className="h-2"
                    indicatorClassName={getProgressColor(company.compensation || 0)}
                  />
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Career Growth</span>
                    <span className={getRatingColor(company.career_growth || 0)}>
                      {company.career_growth?.toFixed(1) || 'N/A'}
                    </span>
                  </div>
                  <Progress 
                    value={(company.career_growth || 0) * 20} 
                    className="h-2"
                    indicatorClassName={getProgressColor(company.career_growth || 0)}
                  />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="details">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center">
                  <Briefcase className="h-4 w-4 mr-2 text-gray-400" />
                  <div>
                    <div className="text-gray-500">Size</div>
                    <div>{getCompanySize()}</div>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                  <div>
                    <div className="text-gray-500">Founded</div>
                    <div>{getFoundedDate()}</div>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <ThumbsUp className="h-4 w-4 mr-2 text-gray-400" />
                  <div>
                    <div className="text-gray-500">CEO Approval</div>
                    <div>N/A</div>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <DollarSign className="h-4 w-4 mr-2 text-gray-400" />
                  <div>
                    <div className="text-gray-500">Salary Range</div>
                    <div>{getSalaryRange()}</div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
          
          {expanded && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-3">Latest News</h3>
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
            className="transition-all duration-200 hover:bg-blue-50 dark:hover:bg-blue-900/20"
          >
            <motion.div
              animate={{ rotate: expanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="h-4 w-4 mr-1" />
            </motion.div>
            {expanded ? 'Hide News' : 'Show News'}
          </Button>
          
          <Button asChild className="transition-all duration-200 hover:scale-105">
            <Link href={`/companies/${company.id}`}>
              View Details
              <motion.div
                whileHover={{ x: 2 }}
                transition={{ duration: 0.2 }}
              >
                <ExternalLink className="h-4 w-4 ml-1" />
              </motion.div>
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
} 