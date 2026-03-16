import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, ShieldAlert, ShieldCheck, Search, AlertTriangle, Info, ExternalLink, Loader2 } from 'lucide-react';

interface ScanResult {
  risk_score: number;
  status: 'safe' | 'suspicious' | 'dangerous';
  reasons: string[];
}

export default function App() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze the URL. Please check the link and try again.');
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'safe': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
      case 'suspicious': return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
      case 'dangerous': return 'text-rose-500 bg-rose-500/10 border-rose-500/20';
      default: return 'text-slate-500 bg-slate-500/10 border-slate-500/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'safe': return <ShieldCheck className="w-12 h-12 text-emerald-500" />;
      case 'suspicious': return <ShieldAlert className="w-12 h-12 text-amber-500" />;
      case 'dangerous': return <Shield className="w-12 h-12 text-rose-500" />;
      default: return <Info className="w-12 h-12 text-slate-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-slate-200 font-sans selection:bg-emerald-500/30">
      {/* Background and Branding */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Gradients */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-500/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/10 blur-[120px]" />
        
        {/* College Branding Watermark */}
        <div className="absolute inset-0 flex flex-col items-center justify-center opacity-[0.03] select-none">
          <div className="text-[15vw] font-black tracking-tighter leading-none text-white whitespace-nowrap">
            PVPIT
          </div>
          <div className="text-[4vw] font-bold tracking-[0.3em] text-white uppercase mt-4 whitespace-nowrap">
            Final Year Project
          </div>
          <div className="text-[1.5vw] font-medium tracking-widest text-white uppercase mt-8 text-center whitespace-nowrap">
            An Autonomous Institution <br />
            Leading the Future of Technical Education
          </div>
        </div>
      </div>

      <main className="relative z-10 max-w-3xl mx-auto px-6 pt-20 pb-32">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium mb-6"
          >
            <Shield className="w-3 h-3" />
            AI-Powered Security
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6 flex flex-col items-center justify-center"
          >
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-white mb-2">
              Scam Link <span className="text-emerald-500">Detector</span>
            </h1>
            <h2 className="text-lg font-medium text-emerald-500/80 tracking-widest uppercase">
              PhishGuard
            </h2>
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-slate-400 text-lg max-w-xl mx-auto"
          >
            Instantly analyze URLs for phishing, scams, and malicious intent using advanced heuristics and AI.
          </motion.p>
        </div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="relative mb-12"
        >
          <form onSubmit={handleScan} className="relative group">
            <div className="absolute inset-0 bg-emerald-500/20 rounded-2xl blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
            <div className="relative flex items-center bg-[#16161a] border border-white/10 rounded-2xl p-2 focus-within:border-emerald-500/50 transition-all duration-300">
              <div className="pl-4 text-slate-500">
                <Search className="w-5 h-5" />
              </div>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Paste link to scan (e.g., https://example.com)"
                className="flex-1 bg-transparent border-none focus:ring-0 text-white px-4 py-3 text-lg placeholder:text-slate-600"
              />
              <button
                type="submit"
                disabled={loading || !url}
                className="bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-700 disabled:cursor-not-allowed text-black font-semibold px-8 py-3 rounded-xl transition-all duration-200 flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Scanning...
                  </>
                ) : (
                  'Check Link'
                )}
              </button>
            </div>
          </form>
        </motion.div>

        {/* Results Section */}
        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center gap-3"
            >
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <p>{error}</p>
            </motion.div>
          )}

          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Main Result Card */}
              <div className={`p-8 rounded-3xl border ${getStatusColor(result.status)} transition-colors duration-500`}>
                <div className="flex flex-col md:flex-row items-center gap-8">
                  <div className="shrink-0 p-6 rounded-2xl bg-white/5 border border-white/10">
                    {getStatusIcon(result.status)}
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                      <h2 className="text-3xl font-bold capitalize text-white">{result.status}</h2>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getStatusColor(result.status)}`}>
                        Risk Score: {result.risk_score}
                      </span>
                    </div>
                    <p className="text-slate-400 text-lg">
                      {result.status === 'safe' 
                        ? 'This link appears to be safe to visit. No major threats detected.' 
                        : result.status === 'suspicious'
                        ? 'Exercise caution. This link has some suspicious characteristics.'
                        : 'Warning! This link is highly likely to be a scam or phishing attempt.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Reasons Card */}
              <div className="bg-[#16161a] border border-white/10 rounded-3xl p-8">
                <h3 className="text-white font-semibold mb-6 flex items-center gap-2">
                  <Info className="w-5 h-5 text-emerald-500" />
                  Analysis Details
                </h3>
                <div className="grid gap-4">
                  {result.reasons.length > 0 ? (
                    result.reasons.map((reason, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="flex items-start gap-3 p-4 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors"
                      >
                        <span className="text-slate-400 mt-0.5">•</span>
                        <p className="text-slate-300">{reason}</p>
                      </motion.div>
                    ))
                  ) : (
                    <p className="text-slate-500 italic">No suspicious patterns found in the URL structure.</p>
                  )}
                </div>
              </div>

              {/* Action Footer */}
              <div className="flex justify-center gap-4 pt-4">
                <button 
                  onClick={() => { setUrl(''); setResult(null); }}
                  className="px-6 py-2 rounded-xl border border-white/10 hover:bg-white/5 transition-colors text-slate-400 text-sm"
                >
                  Clear Result
                </button>
                {result.status === 'safe' && (
                  <a 
                    href={url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="px-6 py-2 rounded-xl bg-emerald-500 text-black font-semibold text-sm flex items-center gap-2 hover:bg-emerald-400 transition-colors"
                  >
                    Visit Link <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer Info */}
        <div className="mt-24 text-center border-t border-white/5 pt-12">
          <div className="text-slate-500 text-sm mb-4 space-y-1">
            <p className="font-medium text-slate-400">Final Year Project</p>
            <p>Submitted by:</p>
            <p className="font-semibold text-slate-300">Dhanaji Jadhav</p>
            <p className="font-semibold text-slate-300">Prashant Bedage</p>
          </div>
          <div className="flex justify-center gap-8 grayscale opacity-30">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-widest">Heuristics</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-widest">AI Engine</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
