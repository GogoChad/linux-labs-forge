import { Terminal, Github } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const lastLogin = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(new Date());

  const kernelRelease = 'LinuxLabs 6.1.0-lts #42';

  return (
    <footer className="border-t border-border py-12 bg-card/30">
      <div className="container px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <Terminal className="h-6 w-6 text-primary" />
            <span className="font-bold text-lg">
              <span className="text-primary">Linux</span>
              <span className="text-foreground">Labs</span>
            </span>
          </div>

          <nav className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link to="/labs" className="hover:text-primary transition-colors">
              Labs
            </Link>
            <Link to="/lab-builder" className="hover:text-primary transition-colors">
              Lab Builder
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            <a
              href="https://github.com/GogoChad"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              <Github className="h-5 w-5" />
            </a>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-border text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} LinuxLabs. Learn Linux. Master the Terminal.</p>
          <div className="mt-3 font-mono text-xs text-muted-foreground/80 flex flex-wrap items-center justify-center gap-4">
            <span>last login: {lastLogin} on pts/0</span>
            <span>uname -srv → {kernelRelease}</span>
            <span>motd: fortune | cowsay "stay curious"</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
