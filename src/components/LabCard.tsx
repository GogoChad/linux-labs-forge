import { Link } from 'react-router-dom';
import { Clock, CheckCircle2, ChevronRight } from 'lucide-react';
import { Lab, categoryInfo } from '@/data/labs';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface LabCardProps {
  lab: Lab;
  index?: number;
}

const difficultyColors = {
  beginner: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  intermediate: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  advanced: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
};

const LabCard = ({ lab, index = 0 }: LabCardProps) => {
  const category = categoryInfo[lab.category];

  return (
    <Link
      to={`/labs/${lab.id}`}
      className="group block animate-fade-in"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="terminal-card p-5 h-full transition-all duration-300 hover:border-primary/50 hover:bg-card/80 group-hover:translate-y-[-2px]">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">{category.icon}</span>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {category.name}
            </span>
          </div>
          {lab.completed && (
            <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
          )}
        </div>

        <h3 className="font-semibold text-lg mb-2 text-foreground group-hover:text-primary transition-colors line-clamp-2">
          {lab.title}
        </h3>

        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
          {lab.description}
        </p>

        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className={cn('text-xs', difficultyColors[lab.difficulty])}>
            {lab.difficulty}
          </Badge>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            {lab.duration}
          </div>
        </div>

        <div className="mt-4 flex items-center gap-1 text-primary text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
          Start Lab
          <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </div>
      </div>
    </Link>
  );
};

export default LabCard;
