import React, { useState } from 'react';
import { Eye, Edit3, Sparkles, CheckSquare, Layers, Download, Check } from 'lucide-react';
import { motion } from 'motion/react';
import { jsPDF } from 'jspdf';

interface DocumentViewerProps {
  text: string;
  onChangeText?: (newText: string) => void;
  documentName: string;
  isPastedMode: boolean;
  highlightMode: 'none' | 'highlight' | 'preview';
  setHighlightMode: (mode: 'none' | 'highlight' | 'preview') => void;
  findStr: string;
  replaceStr: string;
}

export default function DocumentViewer({
  text,
  onChangeText,
  documentName,
  isPastedMode,
  highlightMode,
  setHighlightMode,
  findStr,
  replaceStr,
}: DocumentViewerProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  
  // Custom text formatter to render HTML with styled highlights
  const renderFormattedText = () => {
    if (!text) {
      return (
        <div className="text-zinc-400 italic text-center py-20 font-sans">
          No text content loaded. Select a document or paste some text.
        </div>
      );
    }

    if (highlightMode === 'none') {
      return <pre className="whitespace-pre-wrap font-sans text-sm text-zinc-800 leading-relaxed break-words">{text}</pre>;
    }

    // Escape regex characters helper
    const escapeRegExp = (string: string) => {
      return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    };

    if (highlightMode === 'highlight') {
      // Find all occurrences of target strings
      if (!findStr) {
        return <pre className="whitespace-pre-wrap font-sans text-sm text-zinc-800 leading-relaxed break-words">{text}</pre>;
      }
      
      const searchRegex = new RegExp(`(${escapeRegExp(findStr)})`, 'gi');
      const parts = text.split(searchRegex);
      
      return (
        <pre className="whitespace-pre-wrap font-sans text-sm text-zinc-800 leading-relaxed break-words">
          {parts.map((part, index) => {
            const isMatch = part.toLowerCase() === findStr.toLowerCase();
            if (isMatch) {
              const isUpper = part === part.toUpperCase();
              return (
                <span 
                  key={index} 
                  className={`px-0.5 rounded font-bold ${
                    isUpper ? 'bg-amber-100 text-amber-900 border border-amber-300/40' : 'bg-amber-50 text-amber-800 border border-amber-200/40'
                  }`}
                  title={`Occurrence: ${part}`}
                >
                  {part}
                </span>
              );
            }
            return part;
          })}
        </pre>
      );
    }

    if (highlightMode === 'preview') {
      // Show replacement preview. For example, replace 'r' -> 't', 'R' -> 'T'
      if (!findStr) {
        return <pre className="whitespace-pre-wrap font-sans text-sm text-zinc-800 leading-relaxed break-words">{text}</pre>;
      }

      // We want to highlight the replacement process
      const escapedFind = escapeRegExp(findStr);
      const searchRegex = new RegExp(`(${escapedFind})`, 'gi');
      const parts = text.split(searchRegex);

      return (
        <pre className="whitespace-pre-wrap font-sans text-sm text-zinc-800 leading-relaxed break-words">
          {parts.map((part, index) => {
            const isMatch = part.toLowerCase() === findStr.toLowerCase();
            if (isMatch) {
              // Map character case: if uppercase 'R', replace with uppercase 'T'. If lowercase 'r', replace with 't'.
              let actualReplacement = replaceStr;
              if (part === part.toUpperCase()) {
                actualReplacement = replaceStr.toUpperCase();
              } else {
                actualReplacement = replaceStr.toLowerCase();
              }
              return (
                <span 
                  key={index} 
                  className="bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold px-1 rounded inline-flex items-center gap-0.5"
                  title={`Replaces '${part}' with '${actualReplacement}'`}
                >
                  <span className="line-through text-amber-700 text-xs mr-0.5">{part}</span>
                  <span>{actualReplacement}</span>
                </span>
              );
            }
            return part;
          })}
        </pre>
      );
    }

    return null;
  };

  const handleExportPDF = () => {
    if (!text) return;
    setIsExporting(true);
    
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const margin = 20;
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const maxLineWidth = pageWidth - (margin * 2);

      // Start printing content immediately from the top margin for a completely clean, unbranded document
      let cursorY = margin;
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(51, 65, 85); // Slate-700

      // Split text on newlines to preserve structure, then wrap lines
      const paragraphs = text.split('\n');
      const lineHeight = 5.5;

      paragraphs.forEach((para) => {
        // If it's an empty line, just add spacing
        if (para.trim() === '') {
          cursorY += lineHeight;
          return;
        }

        const lines = doc.splitTextToSize(para, maxLineWidth);
        lines.forEach((line: string) => {
          if (cursorY + lineHeight > pageHeight - margin) {
            doc.addPage();
            cursorY = margin;
          }
          doc.text(line, margin, cursorY);
          cursorY += lineHeight;
        });
      });

      const formattedName = (documentName || 'sandbox-export')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      
      doc.save(`${formattedName}.pdf`);
      
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3000);
    } catch (err) {
      console.error('Error generating PDF:', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-zinc-200 shadow-xs flex flex-col h-full min-h-[520px] overflow-hidden">
      {/* Viewer Header */}
      <div className="border-b border-zinc-150 bg-zinc-50/50 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">Active Document</p>
          <h2 className="text-sm font-semibold text-zinc-800 truncate" title={documentName}>
            {documentName || 'No file loaded'}
          </h2>
        </div>

        <div className="flex items-center gap-3">
          {/* Highlight Toggles */}
          <div className="flex bg-zinc-200/70 p-0.5 rounded-lg border border-zinc-200">
            <button
              onClick={() => setHighlightMode('none')}
              className={`py-1 px-2.5 rounded-md text-xs font-medium transition-all flex items-center gap-1 ${
                highlightMode === 'none'
                  ? 'bg-white text-zinc-800 shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-800'
              }`}
            >
              Original
            </button>
            <button
              onClick={() => setHighlightMode('highlight')}
              className={`py-1 px-2.5 rounded-md text-xs font-medium transition-all flex items-center gap-1 ${
                highlightMode === 'highlight'
                  ? 'bg-amber-100/80 text-amber-900 border border-amber-200/50 shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-800'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Highlight
            </button>
            <button
              onClick={() => setHighlightMode('preview')}
              className={`py-1 px-2.5 rounded-md text-xs font-medium transition-all flex items-center gap-1 ${
                highlightMode === 'preview'
                  ? 'bg-emerald-100/80 text-emerald-900 border border-emerald-200/50 shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-800'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              Preview Replace
            </button>
          </div>

          {/* Export PDF Button */}
          <button
            onClick={handleExportPDF}
            disabled={!text || isExporting}
            className={`py-1.5 px-3 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 shadow-xs shrink-0 cursor-pointer border ${
              exportSuccess
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-zinc-800 text-white hover:bg-zinc-900 border-transparent disabled:opacity-50 disabled:cursor-not-allowed'
            }`}
            title="Download PDF"
          >
            {exportSuccess ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Saved PDF!</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                <span>{isExporting ? 'Exporting...' : 'Export PDF'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Editor or Viewer Panel */}
      <div className="flex-1 p-6 overflow-y-auto bg-zinc-50/10 min-h-0 flex flex-col">
        {isPastedMode ? (
          <div className="flex-1 flex flex-col h-full min-h-0 relative">
            <div className="absolute right-3 top-3 z-10 flex gap-2">
              <span className="bg-blue-50 text-blue-700 text-[10px] font-semibold font-mono border border-blue-100 px-2 py-1 rounded shadow-xs">
                Interactive Editor
              </span>
            </div>
            
            {highlightMode === 'none' ? (
              <textarea
                value={text}
                onChange={e => onChangeText?.(e.target.value)}
                placeholder="Paste your document content here to analyze and perform string replacements..."
                className="w-full flex-1 p-4 bg-white border border-zinc-200 rounded-lg text-sm font-sans focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none leading-relaxed text-zinc-800 shadow-inner min-h-[350px]"
              />
            ) : (
              <div className="w-full flex-1 p-4 bg-white border border-zinc-200 rounded-lg overflow-y-auto leading-relaxed shadow-xs min-h-[350px]">
                {renderFormattedText()}
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1 bg-white border border-zinc-200 rounded-lg p-6 shadow-xs overflow-y-auto max-h-[440px]">
            {renderFormattedText()}
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="border-t border-zinc-150 bg-zinc-50/50 px-4 py-2 text-[10px] font-mono text-zinc-400 flex justify-between">
        <span>MODE: {isPastedMode ? 'LOCAL SANDBOX' : 'GOOGLE DOCS CLOUD'}</span>
        <span>LENGTH: {text.length} CHARS</span>
      </div>
    </div>
  );
}
