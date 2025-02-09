'use client'

import React from 'react';
import { CompanyWithStats } from '@/types/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui-library/card';
import { Badge } from '@/components/ui-library/badge';
import { Database } from '@/types/supabase';

interface CompanyCardProps {
  company: Database['public']['Tables']['companies']['Row'];
  variant?: 'default' | 'shame';
  onClick?: () => void;
}

export function CompanyCard({ company, variant = 'default', onClick }: CompanyCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow" onClick={onClick}>
      <CardHeader>
        <CardTitle>{company.name}</CardTitle>
        {variant === 'shame' && (
          <Badge variant="destructive" className="mt-2">
            Shame Score: {company.shame_score}
          </Badge>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p>Industry: {company.industry}</p>
          <p>Location: {company.location}</p>
          <p>Rating: {company.average_rating?.toFixed(1)}/5</p>
          <p>Reviews: {company.total_reviews}</p>
        </div>
      </CardContent>
    </Card>
  );
}