import { useParams, Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import RealSSHTerminal from '@/components/RealSSHTerminal';
import { getLabById, categoryInfo, labs } from '@/data/labs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Clock, 
  Target, 
  Terminal, 
  Lightbulb, 
  ChevronRight,
  ChevronLeft,
  ExternalLink 
} from 'lucide-react';
import { cn } from '@/lib/utils';

const difficultyColors = {
  beginner: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  intermediate: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  advanced: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
};

const LabDetail = () => {
  const { id } = useParams<{ id: string }>();
  const lab = id ? getLabById(id) : null;

  if (!lab) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24 pb-20">
          <div className="container px-4 text-center">
            <h1 className="text-2xl font-bold mb-4">Lab not found</h1>
            <Link to="/labs">
              <Button>Back to Labs</Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const category = categoryInfo[lab.category];
  const labIndex = labs.findIndex(l => l.id === lab.id);
  const prevLab = labIndex > 0 ? labs[labIndex - 1] : null;
  const nextLab = labIndex < labs.length - 1 ? labs[labIndex + 1] : null;
  
  // Check if this is an SSH-related lab
  const isSSHLab = lab.id === 'security-3' || 
                   lab.title.toLowerCase().includes('ssh') ||
                   lab.commands.some(cmd => cmd.toLowerCase().includes('ssh'));

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-20">
        <div className="container px-4">
          {/* Back Button */}
          <Link to="/labs" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8">
            <ArrowLeft className="h-4 w-4" />
            Back to Labs
          </Link>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Header */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl">{category.icon}</span>
                  <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                    {category.name}
                  </span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-bold mb-4">{lab.title}</h1>
                <p className="text-lg text-muted-foreground mb-6">{lab.description}</p>
                <div className="flex flex-wrap items-center gap-3">
                  <Badge variant="outline" className={cn(difficultyColors[lab.difficulty])}>
                    {lab.difficulty}
                  </Badge>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    {lab.duration}
                  </div>
                </div>
              </div>

              {/* Objectives */}
              <div className="terminal-card p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Target className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-semibold">Learning Objectives</h2>
                </div>
                <ul className="space-y-3">
                  {lab.objectives.map((objective, index) => (
                    <li key={`obj-${objective.slice(0, 30)}`} className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center shrink-0 mt-0.5">
                        {index + 1}
                      </div>
                      <span className="text-foreground/90">{objective}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Commands */}
              <div className="terminal-card p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Terminal className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-semibold">Commands You'll Learn</h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {lab.commands.map((command) => (
                    <code
                      key={command}
                      className="px-3 py-1.5 bg-secondary rounded-md font-mono text-sm text-primary border border-border"
                    >
                      {command}
                    </code>
                  ))}
                </div>
              </div>

              {/* Hints */}
              <div className="terminal-card p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Lightbulb className="h-5 w-5 text-accent" />
                  <h2 className="text-xl font-semibold">Hints & Tips</h2>
                </div>
                <ul className="space-y-2">
                  {lab.hints.map((hint) => (
                    <li key={`hint-${hint.slice(0, 30)}`} className="flex items-start gap-3 text-muted-foreground">
                      <span className="text-accent">→</span>
                      <span>{hint}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Practice Terminal (for all labs) */}
              <div id="practice-terminal">
                <h2 className="text-xl font-semibold mb-4">Practice Terminal</h2>
                <RealSSHTerminal labId={lab.id} />
                <p className="text-sm text-muted-foreground mt-3 text-center">
                  Interactive Debian sandbox with full Linux tools (requires Docker Desktop)
                </p>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Start Lab CTA */}
              <div className="terminal-card p-6 glow-border">
                <h3 className="font-semibold mb-3">Ready to practice?</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Scroll down to start an interactive Debian sandbox.
                </p>
                <Button variant="hero" className="w-full" asChild>
                  <a href="#practice-terminal">
                      Open Terminal
                  </a>
                </Button>
              </div>

              {/* Navigation */}
              <div className="terminal-card p-6">
                <h3 className="font-semibold mb-4">Lab Navigation</h3>
                <div className="space-y-3">
                  {prevLab && (
                    <Link
                      to={`/labs/${prevLab.id}`}
                      className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      <span className="line-clamp-1">{prevLab.title}</span>
                    </Link>
                  )}
                  {nextLab && (
                    <Link
                      to={`/labs/${nextLab.id}`}
                      className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      <span className="line-clamp-1">{nextLab.title}</span>
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  )}
                </div>
              </div>

              {/* Category Labs */}
              <div className="terminal-card p-6">
                <h3 className="font-semibold mb-4">More in {category.name}</h3>
                <div className="space-y-2">
                  {labs
                    .filter(l => l.category === lab.category && l.id !== lab.id)
                    .slice(0, 4)
                    .map(relatedLab => (
                      <Link
                        key={relatedLab.id}
                        to={`/labs/${relatedLab.id}`}
                        className="block text-sm text-muted-foreground hover:text-primary transition-colors line-clamp-1"
                      >
                        {relatedLab.title}
                      </Link>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default LabDetail;
