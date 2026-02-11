import { Link } from 'react-router-dom';
import { labs } from '@/data/labs';
import LabCard from './LabCard';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

const FeaturedLabs = () => {
  // Get a mix of labs from different categories and difficulties
  const featuredLabs = [
    labs.find(l => l.id === 'basics-1'),
    labs.find(l => l.id === 'filesystem-2'),
    labs.find(l => l.id === 'permissions-2'),
    labs.find(l => l.id === 'networking-4'),
    labs.find(l => l.id === 'scripting-1'),
    labs.find(l => l.id === 'security-1'),
  ].filter(Boolean);

  return (
    <section className="py-20 bg-secondary/20">
      <div className="container px-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-12">
          <div>
            <h2 className="text-3xl font-bold mb-2">
              Featured <span className="gradient-text">Labs</span>
            </h2>
            <p className="text-muted-foreground">
              Start with these essential labs to build your Linux foundation.
            </p>
          </div>
          <Link to="/labs">
            <Button variant="outline" className="group">
              View All Labs
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredLabs.map((lab, index) => (
            lab && <LabCard key={lab.id} lab={lab} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedLabs;
