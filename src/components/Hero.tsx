import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Terminal, Wrench, ArrowRight } from 'lucide-react';
import asciiArt from '@/assets/ascii-art.txt?raw';

const Hero = () => {
  const [showLogo, setShowLogo] = useState(false);
  const logoArt = useMemo(() => asciiArt.trimEnd(), []);

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-grid-pattern opacity-30" />
      <div className="absolute inset-0 bg-radial-fade" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />

      <div className="container relative z-10 px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          {/* Terminal Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8 animate-fade-in">
            <Terminal className="h-4 w-4 text-primary" />
            <span className="text-sm font-mono text-primary">Learn Linux the Right Way</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 animate-fade-in" style={{ animationDelay: '100ms' }}>
            Master Linux with
            <span className="block gradient-text glow-text mt-2">
              Hands-On Labs
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-fade-in" style={{ animationDelay: '200ms' }}>
            30 structured labs from basics to advanced. Practice real commands in real environments. 
            Build your own custom labs with the new Lab Builder.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in" style={{ animationDelay: '300ms' }}>
            <Link to="/labs">
              <Button variant="hero" size="xl" className="group">
                Start Learning
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link to="/lab-builder">
              <Button variant="terminal" size="xl" className="group">
                <Wrench className="h-5 w-5" />
                Lab Builder
              </Button>
            </Link>
          </div>

          {/* Terminal Preview */}
          <div className="mt-16 animate-fade-in" style={{ animationDelay: '400ms' }}>
            <div className="terminal-card max-w-2xl mx-auto overflow-hidden relative">
              {/* Terminal Header */}
              <div className="flex items-center gap-2 px-4 py-3 bg-secondary/50 border-b border-border">
              <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-destructive/80" />
                  <div className="w-3 h-3 rounded-full bg-muted-foreground/60" />
                  <div className="w-3 h-3 rounded-full bg-primary/80" />
                </div>
                <span className="text-xs text-muted-foreground font-mono ml-2">terminal</span>
                <button
                  type="button"
                  className="ml-auto text-xs font-mono text-muted-foreground/40 opacity-0 transition-opacity hover:text-primary focus-visible:opacity-100 focus-visible:text-primary group-hover:opacity-50"
                  onClick={() => setShowLogo((prev) => !prev)}
                  aria-pressed={showLogo}
                  aria-label="Toggle logo ASCII art"
                  title="cat assets/ascii-art.txt"
                >
                  🐧
                </button>
              </div>
              {/* Terminal Content */}
              <div className="p-4 font-mono text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <span className="text-primary">$</span>
                  <span className="terminal-text typing-cursor">whoami</span>
                </div>
                <div className="mt-2 text-foreground/80">linux-learner</div>
                <div className="flex items-center gap-2 text-muted-foreground mt-3">
                  <span className="text-primary">$</span>
                  <span className="text-foreground/80">echo "Ready to learn Linux?"</span>
                </div>
                <div className="mt-2 text-primary glow-text">Ready to learn Linux?</div>
                {showLogo && (
                  <pre className="mt-4 overflow-x-auto text-[10px] leading-[1.1] text-primary/80 whitespace-pre" aria-live="polite">
                    {logoArt}
                  </pre>
                )}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-xl mx-auto mt-16 animate-fade-in" style={{ animationDelay: '500ms' }}>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary glow-text">30+</div>
              <div className="text-sm text-muted-foreground">Labs</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary glow-text">8</div>
              <div className="text-sm text-muted-foreground">Categories</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary glow-text">∞</div>
              <div className="text-sm text-muted-foreground">Custom Labs</div>
            </div>
          </div>
        </div>
        <div className="mt-10 flex justify-center animate-fade-in" style={{ animationDelay: '550ms' }}>
          <div className="group inline-flex items-center gap-2 rounded-full border border-primary/10 px-4 py-2 text-xs font-mono text-muted-foreground/70">
            <span>ls /var/hidden</span>
            <span className="opacity-0 transition-opacity group-hover:opacity-100" aria-hidden="true">
              🐧 · 🛰️ · 🖥️
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
