import { useEffect, useRef, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { Button } from '@/components/ui/button';
import { Copy, Clipboard, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import 'xterm/css/xterm.css';

const WS_URL = 'ws://localhost:3001/terminal';

const TerminalStandalone = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const sessionId = searchParams.get('sessionId');
  const labId = searchParams.get('labId');
  
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<Terminal | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!sessionId) {
      toast({
        title: 'Invalid Session',
        description: 'No session ID provided',
        variant: 'destructive',
      });
      navigate('/');
      return;
    }

    // Initialize xterm.js
    const term = new Terminal({
      cursorBlink: true,
      fontSize: 16,
      fontFamily: 'Fira Code, Menlo, Monaco, "Courier New", monospace',
      theme: {
        background: '#0d1117',
        foreground: '#c9d1d9',
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
      },
      rows: 40,
      cols: 120,
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);

    if (terminalRef.current) {
      term.open(terminalRef.current);
      fitAddon.fit();
    }

    xtermRef.current = term;
    fitAddonRef.current = fitAddon;

    // Connect WebSocket with sessionId as query parameter
    const ws = new WebSocket(`${WS_URL}?sessionId=${sessionId}`);
    wsRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
      term.write('\r\n\x1b[1;32m✓ Connected to terminal session\x1b[0m\r\n');
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        if (message.type === 'data' && message.data) {
          term.write(message.data);
        } else if (message.type === 'error') {
          term.write(`\r\n\x1b[1;31mError: ${message.data}\x1b[0m\r\n`);
        }
      } catch {
        term.write(event.data);
      }
    };

    ws.onerror = () => {
      toast({
        title: 'Connection Error',
        description: 'Failed to connect to terminal',
        variant: 'destructive',
      });
    };

    ws.onclose = () => {
      setIsConnected(false);
      term.write('\r\n\x1b[1;31mConnection closed\x1b[0m\r\n');
    };

    // Send input to WebSocket
    term.onData((data) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'input', data }));
      }
    });

    // Handle window resize
    const handleResize = () => {
      fitAddon.fit();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      ws.close();
      term.dispose();
    };
  }, [sessionId, navigate, toast]);

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

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-5xl rounded-lg border bg-card shadow-sm">
        <div className="px-4 py-3 border-b flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => navigate(`/labs/${labId}`)}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Lab
            </Button>
            <div>
              <div className="text-sm font-semibold">Terminal {labId ? `- ${labId}` : ''}</div>
              <div className="text-[11px] text-muted-foreground">Session: {sessionId?.substring(0, 8)}...</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isConnected && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={copyToClipboard}
                  title="Copy selected text"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={pasteFromClipboard}
                  title="Paste from clipboard"
                >
                  <Clipboard className="h-4 w-4 mr-2" />
                  Paste
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="p-4 overflow-hidden">
          <div 
            ref={terminalRef} 
            className="h-[70vh] w-full rounded-md border bg-[#0d1117] p-2"
          />
        </div>
      </div>
    </div>
  );
};

export default TerminalStandalone;
