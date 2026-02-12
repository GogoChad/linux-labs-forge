import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import {
  Github,
  ExternalLink,
  FileText,
  BookOpenCheck,
  Wrench,
  ServerCog,
  Compass,
  TerminalSquare,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

const profile = {
  name: 'Gogo Chad',
  role: 'Creator, Linux Lab Forge',
  githubUrl: 'https://github.com/GogoChad',
  avatarUrl: 'https://github.com/GogoChad.png',
  bio: 'Building cinematic Linux training grounds with real SSH terminals, curated lab flows, and automation-first tooling.',
};

const highlights = [
  {
    title: 'Curriculum Coverage',
    description: 'Structured lab tracks covering fundamentals, networking, scripting, and security in one catalog.',
    bullets: ['30+ labs grouped by category', 'Difficulty tags + estimated runtimes', 'Hints baked into each exercise'],
    icon: Compass,
  },
  {
    title: 'Platform Notes',
    description: 'Everything runs in container sandboxes orchestrated by the Node backend, so terminal output mirrors the docs.',
    bullets: ['Dockerized lab runners', 'WebSocket-connected SSH terminal', 'Custom lab builder with persistence'],
    icon: ServerCog,
  },
];

const resourceCards = [
  {
    title: 'Browse Lab Catalog',
    description: 'Filter by category or difficulty, preview hints, and launch any exercise instantly.',
    icon: BookOpenCheck,
    action: {
      type: 'internal' as const,
      to: '/labs',
      label: 'Open Labs',
    },
  },
  {
    title: 'Lab Builder Guide',
    description: 'Documented workflow for crafting bespoke labs that ship alongside the default catalog.',
    icon: Wrench,
    action: {
      type: 'internal' as const,
      to: '/lab-builder',
      label: 'Launch Builder',
    },
  },
  {
    title: 'Interactive Man Page',
    description: 'Tap through curated command references with quick synopsis, switches, and ready-to-run snippets.',
    icon: TerminalSquare,
    action: {
      type: 'internal' as const,
      to: '/man-page',
      label: 'Open Man Page',
    },
  },
  {
    title: 'Server Runtime',
    description: 'API surface, exercise scripts, and Dockerfile that power each SSH-ready container.',
    icon: TerminalSquare,
    action: {
      type: 'external' as const,
      href: 'https://github.com/GogoChad/linux-lab-forge/tree/main/server',
      label: 'View backend',
    },
  },
  {
    title: 'Project README',
    description: 'High-level overview, setup steps, scripts, and troubleshooting tips for contributors.',
    icon: FileText,
    action: {
      type: 'external' as const,
      href: 'https://github.com/GogoChad/linux-lab-forge#readme',
      label: 'Read docs',
    },
  },
];

const quickFacts = [
  { label: 'Focus', value: 'Hands-on Linux training' },
  { label: 'Stack', value: 'React + Vite + Tailwind + Node' },
  { label: 'Lab Runtime', value: 'Dockerized containers per user' },
  { label: 'Terminal', value: 'Live SSH over WebSockets' },
];

const Documentation = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-20">
        <div className="container px-4 space-y-12">
          <section className="space-y-4 max-w-3xl">
            <Badge variant="secondary" className="w-fit gap-2">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              Creator Documentation
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              Behind the <span className="gradient-text">Linux Lab Forge</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Get the human context behind the platform, hop to the GitHub profile, and learn how each major piece fits together.
            </p>
          </section>

          <section className="grid gap-8 lg:grid-cols-[360px,1fr]">
            <article className="rounded-3xl border border-border bg-card/60 p-8 shadow-xl shadow-primary/5 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
              <div className="relative flex flex-col items-center text-center space-y-6">
                <img
                  src={profile.avatarUrl}
                  alt={`${profile.name} avatar`}
                  className="h-32 w-32 rounded-full border-4 border-background/80 shadow-lg object-cover"
                />
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-primary/80">Doc Maintainer</p>
                  <h2 className="text-2xl font-semibold mt-1">{profile.name}</h2>
                  <p className="text-muted-foreground">{profile.role}</p>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
                  {profile.bio}
                </p>
                <div className="grid grid-cols-2 gap-3 w-full text-left">
                  {quickFacts.map((fact) => (
                    <div key={fact.label} className="rounded-2xl border border-border/80 bg-background/60 p-3">
                      <p className="text-xs uppercase text-muted-foreground tracking-wide">{fact.label}</p>
                      <p className="text-sm font-semibold text-foreground">{fact.value}</p>
                    </div>
                  ))}
                </div>
                <Button asChild className="w-full gap-2">
                  <a href={profile.githubUrl} target="_blank" rel="noopener noreferrer">
                    <Github className="h-4 w-4" />
                    Visit GitHub
                  </a>
                </Button>
              </div>
            </article>

            <div className="grid gap-6">
              {highlights.map(({ title, description, bullets, icon: Icon }) => (
                <article key={title} className="rounded-2xl border border-border bg-card/40 p-6 text-center">
                  <div className="flex flex-col items-center gap-3 mb-4">
                    <div className="rounded-xl bg-primary/10 text-primary p-3">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-xl font-semibold">{title}</h3>
                      <p className="text-sm text-muted-foreground">{description}</p>
                    </div>
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground text-left md:text-center md:list-none">
                    {bullets.map((point) => (
                      <li key={point} className="md:before:hidden">
                        {point}
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </section>

          <section className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <p className="text-sm uppercase tracking-[0.4em] text-muted-foreground">Resources</p>
                <h2 className="text-3xl font-bold">Documentation quick jumps</h2>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {resourceCards.map(({ title, description, icon: Icon, action }) => (
                <article key={title} className="rounded-2xl border border-border bg-gradient-to-br from-background to-background/80 p-5">
                  <div className="flex items-start gap-3">
                    <div className="rounded-xl bg-primary/10 text-primary p-2">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">{title}</h3>
                      <p className="text-sm text-muted-foreground">{description}</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    {action.type === 'internal' ? (
                      <Button variant="secondary" asChild className="gap-2">
                        <Link to={action.to}>
                          {action.label}
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    ) : (
                      <Button variant="outline" asChild className="gap-2">
                        <a href={action.href} target="_blank" rel="noopener noreferrer">
                          {action.label}
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </section>


          <section className="grid gap-6 lg:grid-cols-1">
            <article className="rounded-2xl border border-border bg-gradient-to-br from-primary/10 via-background to-background/70 p-8 text-center">
              <div className="mx-auto max-w-2xl space-y-6">
                <div className="space-y-2">
                  <h3 className="text-2xl font-semibold">Need more context?</h3>
                  <p className="text-sm text-muted-foreground">
                    Ping me on GitHub issues with screenshots, commands, or lab ideas. I keep the documentation in lockstep with the platform features.
                  </p>
                </div>
                <Button asChild variant="default" className="gap-2 mx-auto">
                  <a href="https://github.com/GogoChad/linux-lab-forge/issues" target="_blank" rel="noopener noreferrer">
                    Open an issue
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
                <p className="text-xs text-muted-foreground">
                  Prefer async chat? Drop an issue and I will tag relevant commits or draft RFCs in the repo.
                </p>
              </div>
            </article>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Documentation;
