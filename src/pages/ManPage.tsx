import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { commandManual, type CommandManualEntry } from '@/data/commandManual';
import { cn } from '@/lib/utils';
import { Sparkles, ArrowRight, BookOpen, Terminal, BookOpenCheck, ArrowUpRight, GraduationCap, Workflow } from 'lucide-react';
import { Link } from 'react-router-dom';

const ManPage = () => {
  const [activeCommand, setActiveCommand] = useState<CommandManualEntry>(commandManual[0]);
  const [exerciseAnswer, setExerciseAnswer] = useState('');
  const [exerciseFeedback, setExerciseFeedback] = useState<'correct' | 'incorrect' | null>(null);

  useEffect(() => {
    setExerciseAnswer('');
    setExerciseFeedback(null);
  }, [activeCommand]);

  const handleCheckAnswer = () => {
    const normalized = exerciseAnswer.trim().toLowerCase();
    const correct = activeCommand.exercise.answers.some((answer) => answer.toLowerCase() === normalized);
    setExerciseFeedback(correct ? 'correct' : 'incorrect');
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-20">
        <div className="container px-4 space-y-12">
          <section className="space-y-4 max-w-4xl">
            <Badge variant="secondary" className="w-fit gap-2">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              Interactive Man Page
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              Master the <span className="gradient-text">core commands</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Browse a curated set of the most useful Linux utilities, inspect their synopsis, options, and field-ready examples
              without paging through dense manual text.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild className="gap-2">
                <Link to="/labs">
                  Explore Labs
                  <BookOpen className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="gap-2">
                <Link to="/documentation">
                  Creator Notes
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </section>

          <section className="grid gap-6 lg:grid-cols-[320px,1fr]">
            <aside
              className="rounded-3xl border border-border bg-card/40 p-4 lg:sticky lg:top-28 lg:self-start"
              aria-label="Command selection"
            >
              <div
                className="flex flex-col gap-2 overflow-y-auto pr-2"
                style={{ maxHeight: 'calc(100vh - 220px)' }}
              >
                {commandManual.map((cmd) => (
                  <Button
                    key={cmd.name}
                    variant={activeCommand.name === cmd.name ? 'default' : 'ghost'}
                    className={cn(
                      'justify-start text-left h-auto py-3 px-4 border border-transparent transition-all',
                      activeCommand.name !== cmd.name && 'border-border/40'
                    )}
                    onClick={() => setActiveCommand(cmd)}
                  >
                    <div>
                      <p className="font-semibold tracking-tight lowercase">{cmd.name}</p>
                      <p className="text-xs text-muted-foreground">{cmd.summary}</p>
                    </div>
                  </Button>
                ))}
              </div>
            </aside>

            <article className="rounded-3xl border border-border bg-card/50 p-6 space-y-6">
              <div>
                <div className="flex items-center gap-3 flex-wrap">
                  <Badge variant="outline">man {activeCommand.name}</Badge>
                  <span className="text-sm text-muted-foreground">{activeCommand.synopsis}</span>
                </div>
                <h2 className="text-3xl font-semibold mt-3 capitalize">{activeCommand.name}</h2>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <article className="rounded-2xl border border-border/60 bg-background/60 p-4 space-y-2">
                  <div className="flex items-center gap-2 text-primary">
                    <GraduationCap className="h-4 w-4" />
                    <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Theory</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{activeCommand.theory}</p>
                </article>
                <article className="rounded-2xl border border-border/60 bg-background/60 p-4 space-y-2">
                  <div className="flex items-center gap-2 text-primary">
                    <Workflow className="h-4 w-4" />
                    <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Use case</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{activeCommand.useCase}</p>
                </article>
              </div>

              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-2">Synopsis</p>
                <div className="rounded-2xl bg-muted/40 border border-border px-4 py-3 font-mono text-sm overflow-auto">
                  {activeCommand.synopsis}
                </div>
              </div>

              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-2">Common switches</p>
                <div className="grid gap-3 md:grid-cols-2">
                  {activeCommand.options.map((option) => (
                    <div key={`${activeCommand.name}-${option.flag}`} className="rounded-2xl border border-border/70 bg-background/60 p-4">
                      <code className="font-mono text-xs text-primary">{option.flag}</code>
                      <p className="text-sm text-muted-foreground mt-1">{option.detail}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-2">Examples</p>
                <div className="grid gap-4 md:grid-cols-2">
                  {activeCommand.examples.map((example) => (
                    <div key={`${activeCommand.name}-${example.label}`} className="rounded-2xl border border-border bg-background/70 p-4 space-y-2">
                      <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">{example.label}</p>
                      <pre className="bg-card/60 rounded-xl p-3 font-mono text-sm text-foreground overflow-auto">
                        <code>{example.command}</code>
                      </pre>
                      {example.output && (
                        <p className="text-xs text-muted-foreground/80">Output: {example.output}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

                <div className="rounded-2xl border border-dashed border-border/80 bg-background/60 p-5 space-y-4">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">Exercise</Badge>
                    <p className="text-sm text-muted-foreground">Answer to solidify {activeCommand.name}.</p>
                  </div>
                  <pre className="bg-card/50 rounded-xl p-4 font-mono text-sm text-foreground overflow-auto">
                    <code>{activeCommand.exercise.command}</code>
                  </pre>
                  <p className="text-sm font-medium text-foreground">{activeCommand.exercise.question}</p>
                  <div className="flex flex-col md:flex-row gap-3">
                    <Input
                      value={exerciseAnswer}
                      onChange={(event) => setExerciseAnswer(event.target.value)}
                      placeholder={activeCommand.exercise.placeholder}
                      className="md:flex-1"
                    />
                    <Button onClick={handleCheckAnswer} className="gap-2">
                      Check answer
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                  {exerciseFeedback === 'correct' && (
                    <p className="text-sm font-medium text-emerald-500">Correct! Nailed the {activeCommand.name} syntax.</p>
                  )}
                  {exerciseFeedback === 'incorrect' && (
                    <p className="text-sm font-medium text-destructive">
                      Not quite. {activeCommand.exercise.hint}
                    </p>
                  )}
                </div>

              <div className="rounded-2xl border border-primary/30 bg-primary/5 p-4">
                <p className="text-sm text-primary font-semibold">Pro tip</p>
                <p className="text-sm text-primary/90">{activeCommand.tip}</p>
              </div>
            </article>
          </section>

          <section className="grid gap-4 md:grid-cols-3">
            {[
              {
                title: 'Learn by doing',
                copy: 'Launch SSH-ready exercises so the commands above hit a real container.',
                href: '/labs',
                icon: BookOpenCheck,
              },
              {
                title: 'Terminal deep dive',
                copy: 'Open the standalone terminal view and experiment freely without scripts.',
                href: '/terminal-standalone',
                icon: Terminal,
              },
              {
                title: 'Docs + changelog',
                copy: 'Track platform releases and builder tips in the main documentation hub.',
                href: '/documentation',
                icon: ArrowUpRight,
              },
            ].map(({ title, copy, href, icon: Icon }) => (
              <article key={title} className="rounded-2xl border border-border bg-card/40 p-5 space-y-3">
                <div className="flex items-center gap-2 text-primary">
                  <Icon className="h-5 w-5" />
                  <span className="text-sm uppercase tracking-[0.3em] text-muted-foreground">Navigator</span>
                </div>
                <h3 className="text-lg font-semibold">{title}</h3>
                <p className="text-sm text-muted-foreground">{copy}</p>
                <Button asChild variant="ghost" className="justify-start gap-2 px-0 text-primary">
                  <Link to={href}>
                    Continue
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </article>
            ))}
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ManPage;
