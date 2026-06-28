import React from 'react';
import { Settings, BarChart2, CheckSquare, Sparkles, AlertTriangle } from 'lucide-react';
import { AnalysisResult } from '../types';
import { getLetterStatistics } from '../utils/analyzer';

interface StatsPanelProps {
  analysis: AnalysisResult;
  findStr: string;
  setFindStr: (str: string) => void;
  replaceStr: string;
  setReplaceStr: (str: string) => void;
  matchCase: boolean;
  setMatchCase: (val: boolean) => void;
  onExecuteReplace: () => void;
  isExecutingReplace: boolean;
  isPastedMode: boolean;
}

export default function StatsPanel({
  analysis,
  findStr,
  setFindStr,
  replaceStr,
  setReplaceStr,
  matchCase,
  setMatchCase,
  onExecuteReplace,
  isExecutingReplace,
  isPastedMode,
}: StatsPanelProps) {
  
  const stats = getLetterStatistics(analysis.text);

  return (
    <div className="space-y-6">
      {/* Target Letter Analysis */}
      <div className="bg-zinc-900 text-white rounded-xl p-5 border border-zinc-800 shadow-md">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400">Target Analytics</h3>
        </div>
        
        {/* Large Counter Badges */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-zinc-800/60 rounded-lg p-3 border border-zinc-700/50">
            <span className="text-[10px] font-mono text-zinc-400 uppercase">Uppercase 'R'</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-bold font-mono text-amber-300">{stats.R}</span>
              <span className="text-xs text-zinc-500">occurrences</span>
            </div>
          </div>
          <div className="bg-zinc-800/60 rounded-lg p-3 border border-zinc-700/50">
            <span className="text-[10px] font-mono text-zinc-400 uppercase">Lowercase 'r'</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-bold font-mono text-amber-300">{stats.r}</span>
              <span className="text-xs text-zinc-500">occurrences</span>
            </div>
          </div>
        </div>

        {/* Dynamic Comparison Banner */}
        <div className="bg-zinc-800 p-3 rounded-lg border border-zinc-700/50 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-medium text-zinc-300">Total 'R' + 'r' Count:</span>
            <span className="text-sm font-bold font-mono text-amber-300">{stats.R + stats.r}</span>
          </div>
          <div className="h-[1px] bg-zinc-700/50" />
          <div className="flex justify-between items-center text-xs text-zinc-400">
            <span>Current 'T' + 't' Count:</span>
            <span className="font-mono text-zinc-300">{stats.T + stats.t} (T: {stats.T}, t: {stats.t})</span>
          </div>
        </div>
      </div>

      {/* Find and Replace Settings */}
      <div className="bg-white rounded-xl border border-zinc-200 p-5 shadow-xs">
        <div className="flex items-center gap-2 mb-4">
          <Settings className="w-4 h-4 text-zinc-500" />
          <h3 className="text-sm font-semibold text-zinc-800">Find & Replace Console</h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-500 mb-1.5 uppercase tracking-wider">Find Character/Text</label>
            <input
              type="text"
              value={findStr}
              onChange={e => setFindStr(e.target.value)}
              placeholder="e.g. r"
              maxLength={20}
              className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-1 focus:ring-blue-500 bg-zinc-50"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-500 mb-1.5 uppercase tracking-wider">Replace With</label>
            <input
              type="text"
              value={replaceStr}
              onChange={e => setReplaceStr(e.target.value)}
              placeholder="e.g. t"
              maxLength={20}
              className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-1 focus:ring-blue-500 bg-zinc-50"
            />
          </div>

          <div className="flex items-center gap-2.5 pt-1">
            <input
              type="checkbox"
              id="matchCase"
              checked={matchCase}
              onChange={e => setMatchCase(e.target.checked)}
              className="w-4 h-4 text-blue-600 border-zinc-300 rounded-sm focus:ring-blue-500"
            />
            <label htmlFor="matchCase" className="text-xs text-zinc-600 font-medium select-none cursor-pointer">
              Preserve Case-Matching
              <span className="block text-[10px] text-zinc-400 font-normal mt-0.5">
                (e.g., replaces 'r' with 't', and 'R' with 'T')
              </span>
            </label>
          </div>

          <button
            onClick={onExecuteReplace}
            disabled={isExecutingReplace || !findStr}
            className={`w-full py-2.5 px-4 rounded-lg font-medium text-xs transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer ${
              isPastedMode
                ? 'bg-zinc-800 hover:bg-zinc-900 text-white'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50'
            }`}
          >
            {isExecutingReplace ? 'Executing...' : isPastedMode ? 'Execute Local Replace' : 'Update Google Doc'}
          </button>
        </div>
      </div>

      {/* Letter Frequency Distribution */}
      <div className="bg-white rounded-xl border border-zinc-200 p-5 shadow-xs">
        <div className="flex items-center gap-2 mb-4">
          <BarChart2 className="w-4 h-4 text-zinc-500" />
          <h3 className="text-sm font-semibold text-zinc-800">Letter Frequency (A-Z)</h3>
        </div>

        <div className="space-y-2.5 max-h-[250px] overflow-y-auto pr-1">
          {analysis.letterMetrics.length === 0 ? (
            <p className="text-xs text-zinc-400 italic text-center py-4">No letters to display.</p>
          ) : (
            analysis.letterMetrics.slice(0, 10).map((metric) => {
              const isTarget = metric.char === 'R' || metric.char === 'T';
              return (
                <div key={metric.char} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className={`font-mono font-bold ${isTarget ? 'text-blue-600' : 'text-zinc-700'}`}>
                      {metric.char} {isTarget && '⭐'}
                    </span>
                    <span className="text-zinc-500 font-mono text-[11px]">
                      {metric.count} times ({metric.percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-zinc-100 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        isTarget ? 'bg-amber-400' : 'bg-blue-500/80'
                      }`}
                      style={{ width: `${metric.percentage}%` }}
                    />
                  </div>
                </div>
              );
            })
          )}
          {analysis.letterMetrics.length > 10 && (
            <p className="text-[10px] text-zinc-400 font-mono text-center pt-2">Showing top 10 characters</p>
          )}
        </div>
      </div>
    </div>
  );
}
