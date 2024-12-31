'use client';

import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export function SearchForm() {
  return (
    <form className="w-full max-w-2xl mx-auto" onSubmit={e => e.preventDefault()}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search for your professor"
          className="pl-10 h-12 text-lg"
        />
        <Button type="submit" className="absolute right-1 top-1/2 -translate-y-1/2">
          Search
        </Button>
      </div>
    </form>
  );
}
