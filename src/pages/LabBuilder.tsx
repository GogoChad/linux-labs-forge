import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Loader2, FileText, Clipboard, Check, Wrench, Sparkles, TerminalSquare, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import Editor from 'react-simple-code-editor';
import Prism from 'prismjs';
import 'prismjs/components/prism-bash';
import 'prismjs/themes/prism.css';

interface CustomLab {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: string;
  category?: string;
  objectives: string[];
  commands: string[];
  hints: string[];
  topic?: string;
  scriptPath: string;
  createdAt: string;
}

const difficultyStyles: Record<CustomLab['difficulty'], string> = {
  beginner: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  intermediate: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  advanced: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
};

// Load saved custom labs from the backend JSON store
const fetchCustomLabs = async (): Promise<CustomLab[]> => {
  const res = await fetch('/api/custom-labs');
  if (!res.ok) throw new Error('Failed to load custom labs');
  const data = await res.json();
  return data.labs || [];
};

const LabBuilder = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('');
  const [topic, setTopic] = useState('');
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [duration, setDuration] = useState('30 min');
  const [category, setCategory] = useState('custom');
  const [objectives, setObjectives] = useState('');
  const [commands, setCommands] = useState('');
  const [hints, setHints] = useState('');
  const [script, setScript] = useState('#!/bin/bash\n\n# Add your setup commands here\necho "Hello from your custom lab"\n');
  const [editId, setEditId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [isLaunching, setIsLaunching] = useState(false);
  const [testResult, setTestResult] = useState<{
    syntaxStatus: number;
    runStatus: number;
    syntaxOutput: string;
    runOutput: string;
    tree: string;
    ok: boolean;
    sessionId?: string;
  } | null>(null);

  const labsQuery = useQuery({ queryKey: ['custom-labs'], queryFn: fetchCustomLabs });

  // Prefill the form with a working grep lab template
  const applyTemplate = () => {
    setTitle('Grep Fundamentals');
    setTopic('grep');
    setDescription('Search files with grep, basic patterns, and flags.');
    setDifficulty('beginner');
    setDuration('30 min');
    setCategory('custom');
    setObjectives([
      'Understand basic grep usage',
      'Search with case sensitivity flags',
      'Use regex anchors and character classes',
      'Search recursively in directories',
      'Exclude matches with invert flag',
    ].join('\n'));
    setCommands([
      'grep pattern file.txt',
      'grep -i error /var/log/syslog',
      'grep -n TODO *.txt',
      'grep -R "main()" src/',
      'grep -v DEBUG app.log',
      'grep -E "^[0-9]{3}-[0-9]{2}-[0-9]{4}" data.txt',
    ].join('\n'));
    setHints([
      'Use -n to show line numbers',
      '-i for case-insensitive search',
      '-R to recurse directories',
      '-E to enable extended regex',
      'Combine -v to exclude matches',
    ].join('\n'));
    setScript(`#!/bin/bash
set -e

# Workspace for the lab
LAB_ROOT="/home/student/grep-lab"
mkdir -p "$LAB_ROOT/logs" "$LAB_ROOT/src" "$LAB_ROOT/data"
cd "$LAB_ROOT"

cat > logs/app.log <<'EOF'
INFO Starting service
DEBUG Config loaded
INFO User login ok
ERROR Disk almost full
DEBUG Cleanup scheduled
ERROR Failed to rotate logs
EOF

cat > logs/sys.log <<'EOF'
Jan 10 10:00 kernel: init done
Jan 10 10:05 sshd[123]: Accepted password for student
Jan 10 10:10 app[555]: WARN cache miss
Jan 10 10:11 app[555]: ERROR failed to open file
Jan 10 10:12 app[555]: INFO retrying
EOF

cat > src/main.c <<'EOF'
#include <stdio.h>
int main() {
  printf("hello world\\n");
  return 0;
}
EOF

cat > data/people.txt <<'EOF'
Alice 555-123-4567
Bob 555-234-5678
Eve 555-999-0000
EOF

cat > EXERCISES.txt <<'EOF'
1) Find lines containing ERROR in logs/app.log (show line numbers)
2) Case-insensitive search for warn in logs/sys.log
3) Recursively find main() references in src/
4) Extract phone numbers from data/people.txt using extended regex
5) Exclude DEBUG lines from logs/app.log
EOF

echo "Lab files ready in $LAB_ROOT"
echo "Open EXERCISES.txt for tasks"
`);
    toast({ title: 'Template applied', description: 'Pre-filled a working grep lab.' });
  };

  // Create or update a custom lab plus its script file
  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        title,
        topic,
        description,
        difficulty,
        duration,
        category,
        objectives: objectives.split('\n').map((s) => s.trim()).filter(Boolean),
        commands: commands.split('\n').map((s) => s.trim()).filter(Boolean),
        hints: hints.split('\n').map((s) => s.trim()).filter(Boolean),
        script,
      };

      const url = editId ? `/api/custom-labs/${editId}` : '/api/custom-labs';
      const method = editId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Failed to save lab');
      }
      return res.json();
    },
    onSuccess: () => {
      toast({ title: editId ? 'Lab updated' : 'Lab saved', description: 'Custom lab and script stored.' });
      queryClient.invalidateQueries({ queryKey: ['custom-labs'] });
      setTitle('');
      setTopic('');
      setDescription('');
      setCategory('custom');
      setObjectives('');
      setCommands('');
      setHints('');
      setScript('#!/bin/bash\n\n# Add your setup commands here\necho "Hello from your custom lab"\n');
      setEditId(null);
    },
    onError: (error: Error) => {
      toast({ title: 'Save failed', description: error.message, variant: 'destructive' });
    },
  });

  // Send the current script to the sandbox tester (syntax/run/tree)
  const runTest = async () => {
    if (!script.trim()) {
      toast({ title: 'No script', description: 'Add a script before testing.', variant: 'destructive' });
      return;
    }
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/custom-labs/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ script }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || data.runOutput || 'Test failed');
      }
      setTestResult({
        syntaxStatus: data.syntaxStatus ?? 0,
        runStatus: data.runStatus ?? 0,
        syntaxOutput: data.syntaxOutput || '',
        runOutput: data.runOutput || '',
        tree: data.tree || '',
        ok: !!data.ok,
      });
      toast({ title: 'Script check complete', description: 'Collected run output and tree view.' });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Test failed';
      setTestResult({
        syntaxStatus: -1,
        runStatus: -1,
        syntaxOutput: '',
        runOutput: message,
        tree: '',
        ok: false,
      });
      toast({ title: 'Script check failed', description: message, variant: 'destructive' });
    } finally {
      setIsTesting(false);
    }
  };

  // Launch an interactive sandbox and open the terminal tab
  const launchInteractivePreview = async () => {
    if (!script.trim()) {
      toast({ title: 'No script', description: 'Add a script before launching.', variant: 'destructive' });
      return;
    }
    setIsLaunching(true);
    try {
      const res = await fetch('/api/custom-labs/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ script }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Preview failed');
      }
      setTestResult({
        syntaxStatus: data.syntaxStatus ?? 0,
        runStatus: data.runStatus ?? 0,
        syntaxOutput: data.syntaxOutput || '',
        runOutput: data.runOutput || '',
        tree: data.tree || '',
        ok: !!data.ok,
        sessionId: data.sessionId,
      });

      if (data.sessionId) {
        const labIdParam = encodeURIComponent('custom-preview');
        const sessionParam = encodeURIComponent(data.sessionId);
        window.open(`/terminal-standalone?sessionId=${sessionParam}&labId=${labIdParam}`, '_blank', 'noopener');
      }

      toast({ title: 'Interactive sandbox ready', description: 'Opened a new tab with the terminal.' });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Preview failed';
      toast({ title: 'Preview failed', description: message, variant: 'destructive' });
    } finally {
      setIsLaunching(false);
    }
  };

  const highlight = (code: string) => Prism.highlight(code, Prism.languages.bash, 'bash');

  const copyPath = async (path: string, id: string) => {
    try {
      await navigator.clipboard.writeText(path);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1500);
    } catch (err) {
      console.error('Copy failed', err);
    }
  };

  const labs = labsQuery.data || [];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20 pb-16">
        <div className="container px-4 max-w-6xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="text-sm text-muted-foreground">Hand-crafted labs for instructors</p>
              <h1 className="text-3xl font-bold">Lab Builder</h1>
            </div>
            <Badge variant="outline" className="bg-accent/10 text-accent border-accent/30 inline-flex items-center gap-2">
              <Wrench className="h-4 w-4" />
              Manual
            </Badge>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Form */}
            <div className="terminal-card p-6 space-y-4">
              <div className="flex flex-wrap items-center justify-end gap-2">
                <Button variant="outline" size="sm" onClick={applyTemplate} className="inline-flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  Quick template
                </Button>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Grep Fundamentals" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Topic (optional)</label>
                <Input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Keyword or course module" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Difficulty</label>
                  <select
                    className="w-full rounded-md border border-border bg-secondary/50 px-3 py-2 text-sm"
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as CustomLab['difficulty'])}
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Duration</label>
                  <Input value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="30 min" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Category</label>
                  <Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="custom" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Objectives (one per line)</label>
                  <Textarea value={objectives} onChange={(e) => setObjectives(e.target.value)} rows={6} />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Commands (one per line)</label>
                  <Textarea value={commands} onChange={(e) => setCommands(e.target.value)} rows={6} className="font-mono" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Hints (one per line)</label>
                  <Textarea value={hints} onChange={(e) => setHints(e.target.value)} rows={6} />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium">.sh Script</label>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <Button variant="secondary" size="sm" type="button" onClick={() => setScript((s) => s.includes('set -e') ? s : s.replace(/^(#!.*\n)/, `$1set -e\n\n`))}>
                      Add set -e
                    </Button>
                    <Button variant="secondary" size="sm" type="button" onClick={() => setScript((s) => s.trimEnd() + '\n\n# finished marker\ntouch ~/finished.txt\n')}>
                      Insert finish hook
                    </Button>
                    <Button variant="secondary" size="sm" type="button" onClick={() => setScript((s) => s.trimEnd() + '\n\n# sample tasks\nmkdir -p ~/lab/data\necho "todo" > ~/lab/TODO.txt\n')}>
                      Add sample tasks
                    </Button>
                  </div>
                </div>

                <div className="rounded-md border border-border bg-secondary/40">
                  <Editor
                    value={script}
                    onValueChange={setScript}
                    highlight={highlight}
                    padding={12}
                    textareaId="lab-script-editor"
                    className="font-mono text-sm leading-6 min-h-[320px]"
                    style={{ background: 'transparent' }}
                  />
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <Button variant="outline" size="sm" type="button" onClick={applyTemplate} className="inline-flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    Quick template
                  </Button>
                  <Button variant="secondary" size="sm" type="button" onClick={runTest} disabled={isTesting} className="inline-flex items-center gap-2">
                    {isTesting ? <Loader2 className="h-4 w-4 animate-spin" /> : <TerminalSquare className="h-4 w-4" />}
                    {isTesting ? 'Testing...' : 'Run & Show Tree'}
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    type="button"
                    onClick={launchInteractivePreview}
                    disabled={isLaunching}
                    className="inline-flex items-center gap-2"
                  >
                    {isLaunching ? <Loader2 className="h-4 w-4 animate-spin" /> : <ExternalLink className="h-4 w-4" />}
                    {isLaunching ? 'Opening...' : 'Open interactive tab'}
                  </Button>
                </div>
                {testResult && (
                  <div className="rounded border border-border bg-secondary/40 p-3 text-xs text-foreground space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold">Statuses:</span>
                      <Badge variant="outline" className={testResult.syntaxStatus === 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}>
                        syntax {testResult.syntaxStatus}
                      </Badge>
                      <Badge variant="outline" className={testResult.runStatus === 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}>
                        run {testResult.runStatus}
                      </Badge>
                      {testResult.sessionId && (
                        <Badge variant="outline" className="bg-accent/10 text-accent">session ready</Badge>
                      )}
                    </div>
                    <div>
                      <div className="font-semibold mb-1">Syntax Output</div>
                      <pre className="whitespace-pre-wrap break-words bg-background/60 p-2 rounded border border-border">{testResult.syntaxOutput || '—'}</pre>
                    </div>
                    <div>
                      <div className="font-semibold mb-1">Run Output</div>
                      <pre className="whitespace-pre-wrap break-words bg-background/60 p-2 rounded border border-border">{testResult.runOutput || '—'}</pre>
                    </div>
                    <div>
                      <div className="font-semibold mb-1">Tree (/workspace)</div>
                      <pre className="whitespace-pre-wrap break-words bg-background/60 p-2 rounded border border-border">{testResult.tree || '—'}</pre>
                    </div>
                  </div>
                )}
              </div>

              <Button
                variant="hero"
                onClick={() => saveMutation.mutate()}
                disabled={saveMutation.isPending || !title.trim() || !description.trim() || !script.trim()}
                className="w-full sm:w-auto"
              >
                {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : editId ? 'Update Lab' : 'Save Lab'}
              </Button>
            </div>

            {/* Saved labs */}
            <div className="terminal-card p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Saved custom labs</p>
                  <h2 className="text-xl font-semibold">Library</h2>
                </div>
                {labsQuery.isLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
              </div>

              {labs.length === 0 && !labsQuery.isLoading ? (
                <div className="text-sm text-muted-foreground">No custom labs yet. Create one to get started.</div>
              ) : (
                <div className="space-y-3">
                  {labs.map((lab) => (
                    <div key={lab.id} className="border border-border rounded-lg p-4 bg-secondary/40">
                      <div className="flex items-center justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-lg">{lab.title}</h3>
                            <Badge variant="outline" className={cn(difficultyStyles[lab.difficulty])}>{lab.difficulty}</Badge>
                            {lab.category && (
                              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 uppercase tracking-wide text-[10px]">
                                {lab.category}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{lab.description}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <FileText className="h-3 w-3" />
                            <span className="font-mono">{lab.scriptPath}</span>
                            <button
                              className="inline-flex items-center gap-1 text-accent hover:underline"
                              onClick={() => copyPath(lab.scriptPath, lab.id)}
                            >
                              {copiedId === lab.id ? <><Check className="h-3 w-3" /> Copied</> : <><Clipboard className="h-3 w-3" /> Copy</>}
                            </button>
                          </div>
                        </div>
                        <div className="text-right text-xs text-muted-foreground space-y-2">
                          <div>{lab.duration}</div>
                          {lab.createdAt && <div>{new Date(lab.createdAt).toLocaleDateString()}</div>}
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs"
                            onClick={() => {
                              setEditId(lab.id);
                              setTitle(lab.title);
                              setTopic(lab.topic || '');
                              setDescription(lab.description);
                              setDifficulty(lab.difficulty);
                              setDuration(lab.duration || '30 min');
                              setCategory(lab.category || 'custom');
                              setObjectives((lab.objectives || []).join('\n'));
                              setCommands((lab.commands || []).join('\n'));
                              setHints((lab.hints || []).join('\n'));
                              toast({ title: 'Loaded for edit', description: lab.title });
                            }}
                          >
                            Edit
                          </Button>
                        </div>
                      </div>
                      {lab.objectives?.length > 0 && (
                        <div className="mt-3 text-xs text-muted-foreground">
                          <span className="font-semibold text-foreground/80">Objectives:</span> {lab.objectives.join('; ')}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default LabBuilder;
