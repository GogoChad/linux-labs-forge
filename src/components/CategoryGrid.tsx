import { Link } from 'react-router-dom';
import { categoryInfo, labs, LabCategory } from '@/data/labs';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const CategoryGrid = () => {
  const categories = Object.entries(categoryInfo) as [LabCategory, typeof categoryInfo[LabCategory]][];

  return (
    <section className="py-20">
      <div className="container px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">
            Explore by <span className="gradient-text">Category</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            From basic commands to advanced system administration. Pick your path and start learning.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {categories.map(([key, category], index) => {
            const labCount = labs.filter(l => l.category === key).length;
            
            return (
              <Link
                key={key}
                to={`/labs?category=${key}`}
                className="group animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="terminal-card p-6 h-full transition-all duration-300 hover:border-primary/50 group-hover:translate-y-[-2px]">
                  <div className="text-4xl mb-4">{category.icon}</div>
                  <h3 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {labCount} labs available
                  </p>
                  <div className={cn(
                    'inline-block px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r',
                    category.color,
                    'text-white/90'
                  )}>
                    Explore
                    <ChevronRight className="inline h-3 w-3 ml-1 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CategoryGrid;
