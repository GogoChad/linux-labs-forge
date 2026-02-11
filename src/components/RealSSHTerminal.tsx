import { useState, useEffect, useRef } from 'react';
import { Terminal as TerminalIcon, Loader2, PlayCircle, XCircle, Copy, Clipboard, Maximize2, Minimize2, ExternalLink, CheckCircle2, RotateCcw, Sun, Moon, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';
import { labs } from '@/data/labs';

interface RealSSHTerminalProps {
  labId: string;
}

const API_URL = 'http://localhost:3001';
const WS_URL = 'ws://localhost:3001/terminal';

const themes = {
  dark: {
    background: '#0d1117',
    foreground: '#c9d1d9',
    cursor: '#58a6ff',
    cursorAccent: '#0d1117',
    black: '#484f58',
    red: '#ff7b72',
    green: '#3fb950',
    yellow: '#d29922',
    blue: '#58a6ff',
    magenta: '#bc8cff',
    cyan: '#39c5cf',
    white: '#b1bac4',
    brightBlack: '#6e7681',
    brightRed: '#ffa198',
    brightGreen: '#56d364',
    brightYellow: '#e3b341',
    brightBlue: '#79c0ff',
    brightMagenta: '#d2a8ff',
    brightCyan: '#56d4dd',
    brightWhite: '#f0f6fc',
    selectionBackground: '#1f6feb4d',
    selectionForeground: '#ffffff',
  },
  light: {
    background: '#ffffff',
    foreground: '#24292f',
    cursor: '#0969da',
    cursorAccent: '#ffffff',
    black: '#1b1f23',
    red: '#cf222e',
    green: '#116329',
    yellow: '#4d2d00',
    blue: '#0969da',
    magenta: '#8250df',
    cyan: '#1b7c83',
    white: '#6e7781',
    brightBlack: '#57606a',
    brightRed: '#a40e26',
    brightGreen: '#1a7f37',
    brightYellow: '#633c01',
    brightBlue: '#218bff',
    brightMagenta: '#a475f9',
    brightCyan: '#3192aa',
    brightWhite: '#8c959f',
    selectionBackground: '#c8e1ff',
    selectionForeground: '#0b1520',
  },
} as const;


const RealSSHTerminal: React.FC<RealSSHTerminalProps> = ({ labId }) => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [containerId, setContainerId] = useState<string | null>(null);
  const [containerName, setContainerName] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [terminalHeight, setTerminalHeight] = useState(400);
  const [isChecking, setIsChecking] = useState(false);
  const [checkResult, setCheckResult] = useState<string | null>(null);
  const [lastCheckMeta, setLastCheckMeta] = useState<{ output: string; timestamp: number } | null>(null);
  const [terminalTheme, setTerminalTheme] = useState<'dark' | 'light'>('dark');
  const [isRestarting, setIsRestarting] = useState(false);
  const [showExtras, setShowExtras] = useState(false);
  
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<Terminal | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const resizerRef = useRef<HTMLDivElement>(null);
  
  const { toast } = useToast();

  const labMeta = labs.find((lab) => lab.id === labId);

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (xtermRef.current) {
        xtermRef.current.dispose();
      }
    };
  }, []);

  useEffect(() => {
    const savedPrefs = localStorage.getItem('terminal-prefs');
    if (savedPrefs) {
      try {
        const parsed = JSON.parse(savedPrefs);
        if (parsed.theme === 'dark' || parsed.theme === 'light') {
          setTerminalTheme(parsed.theme);
        }
      } catch {
        // ignore
      }
    }

    const storedCheck = localStorage.getItem(`lab-check-${labId}`);
    if (storedCheck) {
      try {
        const parsed = JSON.parse(storedCheck);
        if (parsed.output && parsed.timestamp) {
          setLastCheckMeta(parsed);
          setCheckResult(parsed.output);
        }
      } catch {
        // ignore
      }
    }
  }, [labId]);

  useEffect(() => {
    localStorage.setItem('terminal-prefs', JSON.stringify({ theme: terminalTheme }));
  }, [terminalTheme]);

  // Handle manual terminal resizing
  useEffect(() => {
    if (!resizerRef.current || !containerRef.current) return;

    const resizer = resizerRef.current;
    const container = containerRef.current;
    let startY = 0;
    let startHeight = 0;

    const handleMouseDown = (e: MouseEvent) => {
      startY = e.clientY;
      startHeight = parseInt(getComputedStyle(container).height, 10);
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      e.preventDefault();
    };

    const handleMouseMove = (e: MouseEvent) => {
      const delta = e.clientY - startY;
      const newHeight = Math.max(200, Math.min(800, startHeight + delta));
      setTerminalHeight(newHeight);
      
      // Refit terminal after resize
      if (fitAddonRef.current) {
        setTimeout(() => {
          fitAddonRef.current?.fit();
        }, 10);
      }
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    resizer.addEventListener('mousedown', handleMouseDown);

    return () => {
      resizer.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [sessionId]);

  useEffect(() => {
    if (xtermRef.current) {
      try {
        xtermRef.current.setOption('theme', themes[terminalTheme]);
        setTimeout(() => fitAddonRef.current?.fit(), 50);
      } catch {
        // ignore terminal option errors
      }
    }
  }, [terminalTheme]);

  const runValidation = async () => {
    if (!sessionId) {
      toast({
        title: 'No session',
        description: 'Start a session before checking your work',
        variant: 'destructive',
      });
      return;
    }

    setIsChecking(true);
    setCheckResult(null);

    try {
      const response = await fetch(`${API_URL}/api/sessions/${sessionId}/check`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Validation failed');
      }

      const data = await response.json();
      const output = (data.output as string | undefined)?.trim() || 'No output';
      setCheckResult(output);
      const meta = { output, timestamp: Date.now() };
      setLastCheckMeta(meta);
      localStorage.setItem(`lab-check-${labId}`, JSON.stringify(meta));
      toast({
        title: 'Validation complete',
        description: 'Finished output captured below.',
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Validation failed';
      setError(message);
      toast({
        title: 'Check failed',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsChecking(false);
    }
  };

  const copyToClipboard = async () => {
    if (!xtermRef.current) return;
    
    const selection = xtermRef.current.getSelection();
    if (selection) {
      try {
        await navigator.clipboard.writeText(selection);
        toast({
          title: 'Copied!',
          description: 'Text copied to clipboard',
        });
      } catch (err) {
        toast({
          title: 'Copy Failed',
          description: 'Unable to copy to clipboard',
          variant: 'destructive',
        });
      }
    } else {
      toast({
        title: 'No Selection',
        description: 'Please select text to copy',
        variant: 'destructive',
      });
    }
  };

  const pasteFromClipboard = async () => {
    if (!xtermRef.current || !wsRef.current) return;
    
    try {
      const text = await navigator.clipboard.readText();
      if (wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: 'input', data: text }));
        toast({
          title: 'Pasted!',
          description: 'Text pasted to terminal',
        });
      }
    } catch (err) {
      toast({
        title: 'Paste Failed',
        description: 'Unable to paste from clipboard',
        variant: 'destructive',
      });
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    setTimeout(() => {
      if (fitAddonRef.current) {
        fitAddonRef.current.fit();
      }
    }, 100);
  };

  const openInNewTab = () => {
    if (!sessionId || !containerId) {
      toast({
        title: 'Not Connected',
        description: 'Start the terminal first',
        variant: 'destructive',
      });
      return;
    }

    // Create a URL with session info
    const terminalUrl = `/terminal-standalone?sessionId=${sessionId}&labId=${labId}`;
    window.open(terminalUrl, '_blank');
    
    toast({
      title: 'Terminal Opened',
      description: 'Terminal opened in new tab',
    });
  };

  const createSession = async () => {
    setIsConnecting(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/api/sessions/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ labType: labId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create session');
      }

      const data = await response.json();
      setSessionId(data.sessionId);
      setContainerId(data.containerId);
      setContainerName(data.containerName || null);

      toast({
        title: 'Container Created!',
        description: `Session ID: ${data.sessionId.substring(0, 8)}...`,
      });

      setTimeout(() => {
        connectTerminal(data.sessionId);
      }, 100);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create session';
      setError(errorMessage);
      toast({
        title: 'Connection Failed',
        description: errorMessage,
        variant: 'destructive',
      });
      setIsConnecting(false);
    }
  };

  const connectTerminal = async (sid: string) => {
    if (!terminalRef.current) {
      setTimeout(() => connectTerminal(sid), 200);
      return;
    }

    try {
      // Initialize xterm.js with enhanced theme
      const terminal = new Terminal({
        cursorBlink: true,
        cursorStyle: 'block',
        fontSize: 16,
        fontFamily: '"Fira Code", "Cascadia Code", Menlo, Monaco, "Courier New", monospace',
        fontWeight: 'normal',
        fontWeightBold: 'bold',
        letterSpacing: 0.5,
        lineHeight: 1.2,
        theme: themes[terminalTheme],
        allowProposedApi: true,
        scrollback: 10000,
        rows: 30,
        cols: 100,
      });

      const fitAddon = new FitAddon();
      terminal.loadAddon(fitAddon);
      
      terminal.open(terminalRef.current);
      
      setTimeout(() => {
        fitAddon.fit();
      }, 100);

      xtermRef.current = terminal;
      fitAddonRef.current = fitAddon;

      // Handle terminal resize
      const handleResize = () => {
        fitAddon.fit();
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({
            type: 'resize',
            rows: terminal.rows,
            cols: terminal.cols
          }));
        }
      };
      
      window.addEventListener('resize', handleResize);

      // Connect WebSocket
      const ws = new WebSocket(`${WS_URL}?sessionId=${sid}`);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        setIsConnecting(false);
        terminal.writeln('\x1b[1;32m✓ Connected to Linux Lab container!\x1b[0m');
        terminal.writeln('');
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          if (message.type === 'data') {
            terminal.write(message.data);
          } else if (message.type === 'error') {
            terminal.writeln(`\r\n\x1b[1;31mError: ${message.data}\x1b[0m`);
          }
        } catch (err) {
          console.error('WebSocket message parse error:', err);
        }
      };

      ws.onerror = () => {
        setError('Connection error occurred');
        terminal.writeln('\r\n\x1b[1;31m✗ Connection error\x1b[0m');
      };

      ws.onclose = () => {
        setIsConnected(false);
        terminal.writeln('\r\n\x1b[1;33m✗ Connection closed\x1b[0m');
        window.removeEventListener('resize', handleResize);
      };

      // Send terminal input to WebSocket
      terminal.onData((data) => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'input', data }));
        }
      });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to connect terminal';
      setError(errorMessage);
      setIsConnecting(false);
      toast({
        title: 'Terminal Error',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  const disconnectSession = async (silent = false) => {
    if (wsRef.current) {
      wsRef.current.close();
    }
    if (xtermRef.current) {
      xtermRef.current.dispose();
      xtermRef.current = null;
    }
    if (sessionId) {
      try {
        await fetch(`${API_URL}/api/sessions/${sessionId}`, {
          method: 'DELETE',
        });
      } catch (err) {
        // Silent error handling
      }
    }
    setSessionId(null);
    setContainerId(null);
    setContainerName(null);
    setIsConnected(false);
    setError(null);

    if (!silent) {
      toast({
        title: 'Session Ended',
        description: 'Container has been terminated',
      });
    }
  };

  const restartSession = async () => {
    setIsRestarting(true);
    try {
      if (sessionId) {
        await disconnectSession(true);
      }
      setCheckResult(null);
      setLastCheckMeta(null);
      localStorage.removeItem(`lab-check-${labId}`);
      await createSession();
    } finally {
      setIsRestarting(false);
    }
  };

  // Interactive SSH terminal with session lifecycle, resizing, clipboard, and validation hooks
  return (
    <div 
      className={`terminal-card overflow-hidden ${isFullscreen ? 'fixed inset-0 z-50 bg-background' : ''}`}
      ref={containerRef}
    >
      {/* Terminal Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-secondary/50 border-b border-border">
        <div className="flex items-center gap-2">
          <TerminalIcon className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">Interactive Terminal</span>
          {containerId && (
            <span className="text-xs text-muted-foreground">
              Container: {containerName || containerId}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-amber-500/50'}`} />
          <Button
            size="sm"
            variant="ghost"
            className="h-7 text-xs"
            onClick={() => setShowExtras((v) => !v)}
            title="Show advanced options"
          >
            <SlidersHorizontal className="h-3 w-3 mr-1" />
            {showExtras ? 'Hide options' : 'Show options'}
          </Button>
          {showExtras && (
            <Button
              size="sm"
              variant="ghost"
              className="h-7 text-xs"
              onClick={() => setTerminalTheme(terminalTheme === 'dark' ? 'light' : 'dark')}
              title="Toggle terminal theme"
            >
              {terminalTheme === 'dark' ? <Sun className="h-3 w-3" /> : <Moon className="h-3 w-3" />}
            </Button>
          )}
          {isConnected && (
            <>
              <Button
                size="sm"
                variant="ghost"
                onClick={copyToClipboard}
                className="h-7 text-xs"
                title="Copy selected text"
              >
                <Copy className="h-3 w-3" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={pasteFromClipboard}
                className="h-7 text-xs"
                title="Paste from clipboard"
              >
                <Clipboard className="h-3 w-3" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={toggleFullscreen}
                className="h-7 text-xs"
                title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
              >
                {isFullscreen ? <Minimize2 className="h-3 w-3" /> : <Maximize2 className="h-3 w-3" />}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={openInNewTab}
                className="h-7 text-xs"
                title="Open terminal in new tab"
              >
                <ExternalLink className="h-3 w-3" />
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={runValidation}
                className="h-7 text-xs"
                disabled={isChecking}
                title="Run finished inside the container"
              >
                {isChecking ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <CheckCircle2 className="h-3 w-3 mr-1" />}
                {isChecking ? 'Checking...' : 'Check Work'}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={restartSession}
                className="h-7 text-xs"
                disabled={isRestarting}
                title="Restart container"
              >
                {isRestarting ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <RotateCcw className="h-3 w-3 mr-1" />}
                {isRestarting ? 'Restarting...' : 'Restart'}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={disconnectSession}
                className="h-7 text-xs"
              >
                <XCircle className="h-3 w-3 mr-1" />
                Disconnect
              </Button>
            </>
          )}
        </div>
      </div>

      {showExtras && (sessionId || lastCheckMeta) && (
        <div className="flex flex-wrap items-center gap-3 px-4 py-2 bg-secondary/40 border-b border-border text-xs text-muted-foreground">
          <span className="text-foreground">Session: {containerName || containerId || 'pending...'}</span>
          <span>Lab: {labId}</span>
          <span>
            Last check: {lastCheckMeta ? new Date(lastCheckMeta.timestamp).toLocaleTimeString() : 'not yet'}
          </span>
          <span className="ml-auto text-[11px]">Auto-terminates in 1 hour</span>
        </div>
      )}

      {/* Terminal Content */}
      <div className="relative">
        {!sessionId ? (
          <div className="p-8 text-center space-y-4 min-h-[400px] flex flex-col items-center justify-center bg-secondary/20">
            <TerminalIcon className="h-12 w-12 text-muted-foreground" />
            <div>
              <h3 className="font-semibold mb-2">Start Interactive Session</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto mb-4">
                Spin up a fresh Docker sandbox with SSH access. You get a clean Linux environment to try commands safely.
              </p>
              {error && (
                <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded text-destructive text-sm">
                  {error}
                  {error.includes('Docker') && (
                    <div className="mt-2 text-xs">
                      Make sure Docker Desktop is running on your machine.
                    </div>
                  )}
                </div>
              )}
            </div>
            <Button
              variant="hero"
              onClick={createSession}
              disabled={isConnecting}
              className="gap-2"
            >
              {isConnecting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating Container...
                </>
              ) : (
                <>
                  <PlayCircle className="h-4 w-4" />
                  Start SSH Session
                </>
              )}
            </Button>
            <p className="text-xs text-muted-foreground">
              Requires Docker Desktop to be installed and running
            </p>
          </div>
        ) : (
          <>
            <div
              ref={terminalRef}
              className="p-2 bg-[#0a0a0a]"
              style={{ 
                height: isFullscreen ? 'calc(100vh - 120px)' : `${terminalHeight}px`,
                minHeight: '200px'
              }}
            />
            {!isFullscreen && (
              <div
                ref={resizerRef}
                className="h-2 cursor-ns-resize bg-secondary/30 hover:bg-primary/30 transition-colors border-t border-border group"
                title="Drag to resize terminal"
              >
                <div className="h-0.5 bg-primary/50 mx-auto w-12 mt-0.5 group-hover:bg-primary transition-colors" />
              </div>
            )}
          </>
        )}
      </div>

      {checkResult && (
        <div className="mt-3 rounded border border-border bg-secondary/30 p-3 text-xs text-muted-foreground">
          <div className="mb-2 flex items-center justify-between">
            <span className="font-semibold text-foreground">Validation Output</span>
            <span className="text-[10px] uppercase tracking-wide text-muted-foreground">finished</span>
          </div>
          <pre className="whitespace-pre-wrap break-words text-foreground">{checkResult}</pre>
        </div>
      )}

      {showExtras && labMeta && (
        <div className="mt-4 rounded border border-border bg-secondary/30 p-4 text-sm">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-xs uppercase tracking-wide text-muted-foreground">Lab Guide</div>
              <div className="font-semibold text-foreground">{labMeta.title}</div>
              <div className="text-xs text-muted-foreground">{labMeta.description}</div>
            </div>
            <div className="text-xs text-muted-foreground text-right">
              <div>Difficulty: {labMeta.difficulty}</div>
              <div>Duration: {labMeta.duration}</div>
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <div>
              <div className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1">Objectives</div>
              <ul className="space-y-1 text-foreground">
                {labMeta.objectives.slice(0, 4).map((item) => (
                  <li key={item} className="flex gap-2">
                    <span>•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1">Commands</div>
              <div className="flex flex-wrap gap-1">
                {labMeta.commands.map((cmd) => (
                  <span key={cmd} className="rounded bg-secondary px-2 py-1 text-xs text-foreground">{cmd}</span>
                ))}
              </div>
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1">Hints</div>
              <ul className="space-y-1 text-foreground">
                {labMeta.hints.slice(0, 3).map((hint) => (
                  <li key={hint} className="flex gap-2">
                    <span>💡</span>
                    <span>{hint}</span>
                  </li>
                ))}
                <li className="text-xs text-muted-foreground">Full hints/solutions live in ~/labs/{labId}/hints and solutions.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {isConnected && (
        <div className="px-4 py-2 bg-secondary/30 border-t border-border text-xs text-muted-foreground">
          <div className="flex items-center justify-between">
            <span>
              Username: <code className="text-primary">student</code> | 
              Password: <code className="text-primary">student123</code>
            </span>
            <span>Session will auto-terminate after 1 hour</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default RealSSHTerminal;
