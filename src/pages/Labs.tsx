import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import LabCard from '@/components/LabCard';
import { labs, categoryInfo, LabCategory, LabDifficulty } from '@/data/labs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Filter, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const Labs = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  
  const selectedCategory = searchParams.get('category') as LabCategory | null;
  const selectedDifficulty = searchParams.get('difficulty') as LabDifficulty | null;

  const filteredLabs = useMemo(() => {
    return labs.filter(lab => {
      const matchesSearch = lab.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lab.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = !selectedCategory || lab.category === selectedCategory;
      const matchesDifficulty = !selectedDifficulty || lab.difficulty === selectedDifficulty;
      return matchesSearch && matchesCategory && matchesDifficulty;
    });
  }, [searchQuery, selectedCategory, selectedDifficulty]);

  const setFilter = (key: string, value: string | null) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
  };

  const clearFilters = () => {
    setSearchParams({});
    setSearchQuery('');
  };

  const hasFilters = selectedCategory || selectedDifficulty || searchQuery;

  const categories = Object.entries(categoryInfo) as [LabCategory, typeof categoryInfo[LabCategory]][];
  const difficulties: LabDifficulty[] = ['beginner', 'intermediate', 'advanced'];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-20">
        <div className="container px-4">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4">
              All <span className="gradient-text">Labs</span>
            </h1>
            <p className="text-muted-foreground text-lg">
              {filteredLabs.length} labs available • Master Linux one lab at a time
            </p>
          </div>

          {/* Search and Filters */}
          <div className="mb-8 space-y-4">
            {/* Search */}
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search labs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-secondary/50 border-border"
              />
            </div>

            {/* Category Filters */}
            <div className="flex flex-wrap gap-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mr-2">
                <Filter className="h-4 w-4" />
                Category:
              </div>
              {categories.map(([key, cat]) => (
                <Button
                  key={key}
                  variant={selectedCategory === key ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('category', selectedCategory === key ? null : key)}
                  className="gap-1"
                >
                  <span>{cat.icon}</span>
                  <span className="hidden sm:inline">{cat.name}</span>
                </Button>
              ))}
            </div>

            {/* Difficulty Filters */}
            <div className="flex flex-wrap gap-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mr-2">
                Difficulty:
              </div>
              {difficulties.map((diff) => (
                <Button
                  key={diff}
                  variant={selectedDifficulty === diff ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('difficulty', selectedDifficulty === diff ? null : diff)}
                  className="capitalize"
                >
                  {diff.charAt(0).toUpperCase() + diff.slice(1)}
                </Button>
              ))}
            </div>

            {/* Clear Filters */}
            {hasFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground">
                <X className="h-4 w-4 mr-1" />
                Clear filters
              </Button>
            )}
          </div>

          {/* Labs Grid */}
          {filteredLabs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredLabs.map((lab, index) => (
                <LabCard key={lab.id} lab={lab} index={index} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-muted-foreground text-lg mb-4">No labs found matching your criteria.</p>
              <Button variant="outline" onClick={clearFilters}>
                Clear filters
              </Button>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Labs;
