import React, { useState } from 'react';
import { Search, RefreshCw, FilePlus, Globe, FileText, Check, AlertCircle, Sparkles } from 'lucide-react';
import { GoogleDocFile } from '../types';
import { motion } from 'motion/react';

interface DocumentSelectorProps {
  files: GoogleDocFile[];
  selectedFileId: string | null;
  onSelectFile: (fileId: string) => void;
  onRefresh: () => void;
  isLoadingFiles: boolean;
  onCreateTestDoc: () => void;
  isCreatingTestDoc: boolean;
  isAuthenticated: boolean;
  onLogin: () => void;
  isLoggingIn: boolean;
  activeTab: 'drive' | 'paste';
  setActiveTab: (tab: 'drive' | 'paste') => void;
}

export default function DocumentSelector({
  files,
  selectedFileId,
  onSelectFile,
  onRefresh,
  isLoadingFiles,
  onCreateTestDoc,
  isCreatingTestDoc,
  isAuthenticated,
  onLogin,
  isLoggingIn,
  activeTab,
  setActiveTab,
}: DocumentSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFiles = files.filter(f =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-white rounded-xl border border-zinc-200 shadow-xs overflow-hidden flex flex-col h-full min-h-[480px]">
      {/* Tabs */}
      <div className="flex border-b border-zinc-200 bg-zinc-50 p-1">
        <button
          onClick={() => setActiveTab('paste')}
          className={`flex-1 py-2 px-3 text-xs font-medium rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'paste'
              ? 'bg-white text-zinc-900 shadow-xs border border-zinc-200/50'
              : 'text-zinc-500 hover:text-zinc-800'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          Paste Raw Text
        </button>
        <button
          onClick={() => setActiveTab('drive')}
          className={`flex-1 py-2 px-3 text-xs font-medium rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'drive'
              ? 'bg-white text-zinc-900 shadow-xs border border-zinc-200/50'
              : 'text-zinc-500 hover:text-zinc-800'
          }`}
        >
          <Globe className="w-3.5 h-3.5" />
          Google Drive Docs
        </button>
      </div>

      <div className="p-4 flex-1 flex flex-col min-h-0">
        {activeTab === 'paste' ? (
          <div className="flex-1 flex flex-col justify-between">
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-zinc-800">Direct Paste Playground</h3>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Analyze and test replacements on arbitrary text. We've preloaded Aakash Kumar's full CV so you can answer "How many R" and replace them offline instantly.
              </p>
              
              <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-100 flex gap-2 text-xs text-blue-700 leading-normal">
                <Sparkles className="w-4 h-4 shrink-0 text-blue-500 mt-0.5" />
                <div>
                  <strong>Tip:</strong> Try signing in to connect with Google Drive. You can instantly copy this CV text into a live Google Doc to see the API modify your cloud files.
                </div>
              </div>
            </div>
            
            {!isAuthenticated && (
              <div className="mt-6 border-t border-zinc-100 pt-4">
                <p className="text-[11px] text-zinc-400 text-center mb-3">Want to edit on Google Docs instead?</p>
                <button
                  onClick={onLogin}
                  disabled={isLoggingIn}
                  className="gsi-material-button w-full"
                  style={{ cursor: 'pointer' }}
                >
                  <div className="gsi-material-button-state"></div>
                  <div className="gsi-material-button-content-wrapper">
                    <div className="gsi-material-button-icon">
                      <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" style={{ display: 'block' }}>
                        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                        <path fill="none" d="M0 0h48v48H0z"></path>
                      </svg>
                    </div>
                    <span className="gsi-material-button-contents font-sans font-medium text-zinc-700">Connect Google Account</span>
                  </div>
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1 flex flex-col min-h-0">
            {!isAuthenticated ? (
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4 border border-blue-100">
                  <Globe className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-semibold text-zinc-800 mb-1">Google Workspace Connection Required</h4>
                <p className="text-xs text-zinc-500 max-w-xs mb-6 leading-relaxed">
                  To view, count, and replace text inside your real cloud documents with permission, please sign in with your Google Account.
                </p>
                <button
                  onClick={onLogin}
                  disabled={isLoggingIn}
                  className="gsi-material-button"
                  style={{ cursor: 'pointer' }}
                >
                  <div className="gsi-material-button-state"></div>
                  <div className="gsi-material-button-content-wrapper">
                    <div className="gsi-material-button-icon">
                      <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" style={{ display: 'block' }}>
                        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                        <path fill="none" d="M0 0h48v48H0z"></path>
                      </svg>
                    </div>
                    <span className="gsi-material-button-contents font-sans font-medium text-zinc-700">Sign in with Google</span>
                  </div>
                </button>
              </div>
            ) : (
              <div className="flex-1 flex flex-col min-h-0">
                {/* Search & Actions */}
                <div className="space-y-2 mb-4">
                  <div className="flex gap-2">
                    <button
                      onClick={onCreateTestDoc}
                      disabled={isCreatingTestDoc}
                      className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-xs font-medium transition-colors shadow-xs"
                    >
                      <FilePlus className="w-3.5 h-3.5" />
                      {isCreatingTestDoc ? 'Creating Doc...' : 'Create Doc from CV'}
                    </button>
                    <button
                      onClick={onRefresh}
                      disabled={isLoadingFiles}
                      className="p-1.5 border border-zinc-200 hover:bg-zinc-50 rounded-lg text-zinc-500 transition-colors disabled:opacity-50"
                      title="Refresh Document List"
                    >
                      <RefreshCw className={`w-4 h-4 ${isLoadingFiles ? 'animate-spin' : ''}`} />
                    </button>
                  </div>
                  
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-zinc-400" />
                    <input
                      type="text"
                      placeholder="Search Google Docs..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 border border-zinc-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 bg-zinc-50/50"
                    />
                  </div>
                </div>

                {/* File List */}
                <div className="flex-1 overflow-y-auto border border-zinc-100 rounded-lg bg-zinc-50/20 max-h-[300px]">
                  {isLoadingFiles ? (
                    <div className="flex flex-col items-center justify-center p-12 text-center text-zinc-500">
                      <RefreshCw className="w-6 h-6 animate-spin text-zinc-400 mb-2" />
                      <p className="text-xs">Fetching Google Docs...</p>
                    </div>
                  ) : filteredFiles.length === 0 ? (
                    <div className="p-8 text-center text-zinc-400 flex flex-col items-center gap-2">
                      <AlertCircle className="w-8 h-8 text-zinc-300" />
                      <p className="text-xs font-medium text-zinc-600">No Google Docs found</p>
                      <p className="text-[11px] leading-normal max-w-[200px]">
                        Click "Create Doc from CV" above to automatically create a test document with the resume text!
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-zinc-100">
                      {filteredFiles.map((file) => (
                        <button
                          key={file.id}
                          onClick={() => onSelectFile(file.id)}
                          className={`w-full p-3 text-left hover:bg-zinc-50 flex items-start gap-2.5 transition-all ${
                            selectedFileId === file.id ? 'bg-blue-50/40 border-l-2 border-blue-600' : ''
                          }`}
                        >
                          <FileText className={`w-4 h-4 mt-0.5 shrink-0 ${selectedFileId === file.id ? 'text-blue-600' : 'text-zinc-400'}`} />
                          <div className="min-w-0 flex-1">
                            <p className={`text-xs font-medium truncate ${selectedFileId === file.id ? 'text-blue-700' : 'text-zinc-800'}`}>
                              {file.name}
                            </p>
                            <span className="text-[10px] font-mono text-zinc-400">
                              Modified: {file.modifiedTime ? new Date(file.modifiedTime).toLocaleDateString() : 'N/A'}
                            </span>
                          </div>
                          {selectedFileId === file.id && (
                            <Check className="w-3.5 h-3.5 text-blue-600 self-center shrink-0" />
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        /* Google Sign In Button Styling conforming to guidelines */
        .gsi-material-button {
          -moz-user-select: none;
          -webkit-user-select: none;
          -ms-user-select: none;
          -webkit-appearance: none;
          background-color: WHITE;
          background-image: none;
          border: 1px solid #747775;
          -webkit-border-radius: 4px;
          border-radius: 4px;
          -webkit-box-sizing: border-box;
          box-sizing: border-box;
          color: #1f1f1f;
          cursor: pointer;
          font-family: 'Roboto', arial, sans-serif;
          font-size: 14px;
          height: 40px;
          letter-spacing: 0.25px;
          outline: none;
          padding: 0 12px;
          position: relative;
          text-align: center;
          transition: background-color .218s, border-color .218s, box-shadow .218s;
          vertical-align: middle;
          white-space: nowrap;
          width: auto;
          max-width: 400px;
          min-width: min-content;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
        .gsi-material-button .gsi-material-button-icon {
          height: 20px;
          min-width: 20px;
          width: 20px;
        }
        .gsi-material-button .gsi-material-button-content-wrapper {
          align-items: center;
          display: flex;
          flex-direction: row;
          flex-wrap: nowrap;
          height: 100%;
          justify-content: space-between;
          position: relative;
          width: 100%;
          gap: 12px;
        }
        .gsi-material-button .gsi-material-button-contents {
          flex-grow: 1;
          font-family: 'Inter', sans-serif;
          font-size: 13px;
          font-weight: 500;
          overflow: hidden;
          text-overflow: ellipsis;
          vertical-align: top;
          white-space: nowrap;
        }
        .gsi-material-button .gsi-material-button-state {
          -webkit-transition: opacity .218s;
          transition: opacity .218s;
          bottom: 0;
          left: 0;
          opacity: 0;
          position: absolute;
          right: 0;
          top: 0;
        }
        .gsi-material-button:hover {
          -webkit-box-shadow: 0 1px 2px 0 rgba(60,64,67,0.30), 0 1px 3px 1px rgba(60,64,67,0.15);
          box-shadow: 0 1px 2px 0 rgba(60,64,67,0.30), 0 1px 3px 1px rgba(60,64,67,0.15);
        }
        .gsi-material-button:hover .gsi-material-button-state {
          background-color: #303030;
          opacity: 0.04;
        }
        .gsi-material-button:focus {
          border-color: #0b57d0;
          outline: none;
        }
        .gsi-material-button:focus .gsi-material-button-state {
          background-color: #303030;
          opacity: 0.12;
        }
        .gsi-material-button:active .gsi-material-button-state {
          background-color: #303030;
          opacity: 0.2;
        }
        .gsi-material-button:disabled {
          border-color: #1f1f1f1f;
        }
        .gsi-material-button:disabled .gsi-material-button-contents {
          color: #1f1f1f1f;
        }
        .gsi-material-button:disabled .gsi-material-button-icon path {
          fill: #1f1f1f1f;
        }
      `}</style>
    </div>
  );
}
