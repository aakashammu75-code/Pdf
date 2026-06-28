import React, { useState, useEffect, useMemo } from 'react';
import { User } from 'firebase/auth';
import { 
  initAuth, 
  googleSignIn, 
  logout, 
  getAccessToken 
} from './firebase';
import { GoogleDocFile, AnalysisResult } from './types';
import { analyzeText, extractTextFromDoc } from './utils/analyzer';
import { RESUME_TEXT } from './data/resume';
import Header from './components/Header';
import DocumentSelector from './components/DocumentSelector';
import DocumentViewer from './components/DocumentViewer';
import StatsPanel from './components/StatsPanel';
import { motion, AnimatePresence } from 'motion/react';
import { FileText, Sparkles, Check, AlertTriangle, AlertCircle, RefreshCw, LogIn, ExternalLink } from 'lucide-react';

export default function App() {
  // Auth state
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [needsAuth, setNeedsAuth] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Files & Selector state
  const [activeTab, setActiveTab] = useState<'drive' | 'paste'>('paste');
  const [files, setFiles] = useState<GoogleDocFile[]>([]);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string>('Pasted Text Sandbox');
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [isCreatingTestDoc, setIsCreatingTestDoc] = useState(false);

  // Document Content state
  const [rawText, setRawText] = useState<string>(RESUME_TEXT);
  const [isLoadingContent, setIsLoadingContent] = useState(false);

  // Find / Replace configuration
  const [findStr, setFindStr] = useState<string>('r');
  const [replaceStr, setReplaceStr] = useState<string>('t');
  const [matchCase, setMatchCase] = useState<boolean>(true);
  const [highlightMode, setHighlightMode] = useState<'none' | 'highlight' | 'preview'>('highlight');

  // Execution and UI feedback
  const [isExecutingReplace, setIsExecutingReplace] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [toast, setToast] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  // Trigger brief toasts
  const triggerToast = (type: 'success' | 'error' | 'info', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 5000);
  };

  // Auth Initialization on load
  useEffect(() => {
    const unsubscribe = initAuth(
      async (loggedInUser, accessToken) => {
        setUser(loggedInUser);
        setToken(accessToken);
        setNeedsAuth(false);
        triggerToast('success', `Signed in as ${loggedInUser.email}`);
        // Fetch files automatically upon login
        fetchDriveFiles(accessToken);
      },
      () => {
        setUser(null);
        setToken(null);
        setNeedsAuth(true);
      }
    );
    return () => unsubscribe();
  }, []);

  // Handle manual login
  const handleLogin = async () => {
    setIsLoggingIn(true);
    try {
      const result = await googleSignIn();
      if (result) {
        setUser(result.user);
        setToken(result.accessToken);
        setNeedsAuth(false);
        setActiveTab('drive');
        triggerToast('success', `Logged in successfully!`);
        fetchDriveFiles(result.accessToken);
      }
    } catch (err: any) {
      console.error(err);
      triggerToast('error', `Login failed: ${err.message || 'Unknown error'}`);
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      setUser(null);
      setToken(null);
      setNeedsAuth(true);
      setActiveTab('paste');
      setSelectedFileId(null);
      setSelectedFileName('Pasted Text Sandbox');
      setRawText(RESUME_TEXT);
      triggerToast('info', 'Logged out successfully');
    } catch (err: any) {
      triggerToast('error', `Logout failed: ${err.message}`);
    }
  };

  // Fetch Google Docs from Drive
  const fetchDriveFiles = async (accessToken: string) => {
    if (!accessToken) return;
    setIsLoadingFiles(true);
    try {
      const query = encodeURIComponent("mimeType='application/vnd.google-apps.document' and trashed=false");
      const url = `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,mimeType,modifiedTime,webViewLink)&orderBy=modifiedTime desc`;
      
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (res.status === 401) {
        // Token expired
        handleLogout();
        return;
      }

      if (!res.ok) {
        throw new Error(`API error: ${res.statusText}`);
      }

      const data = await res.json();
      setFiles(data.files || []);
    } catch (err: any) {
      console.error(err);
      triggerToast('error', `Could not fetch files: ${err.message}`);
    } finally {
      setIsLoadingFiles(false);
    }
  };

  // Load a selected Google Doc's content
  const loadDocContent = async (fileId: string, accessToken: string) => {
    if (!fileId || !accessToken) return;
    setIsLoadingContent(true);
    try {
      const res = await fetch(`https://docs.googleapis.com/v1/documents/${fileId}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!res.ok) {
        throw new Error(`Failed to load document content: ${res.statusText}`);
      }

      const doc = await res.json();
      const extracted = extractTextFromDoc(doc);
      setRawText(extracted);
      
      // Update selected file details
      const matchedFile = files.find(f => f.id === fileId);
      if (matchedFile) {
        setSelectedFileName(matchedFile.name);
      }
      triggerToast('success', 'Document loaded successfully');
    } catch (err: any) {
      console.error(err);
      triggerToast('error', `Error loading doc: ${err.message}`);
    } finally {
      setIsLoadingContent(false);
    }
  };

  // Create a brand new Google Doc with the resume content
  const handleCreateTestDoc = async () => {
    const accessToken = token || await getAccessToken();
    if (!accessToken) {
      triggerToast('error', 'Authentication required to write to Google Drive');
      return;
    }

    setIsCreatingTestDoc(true);
    try {
      // 1. Create a blank document
      const createRes = await fetch('https://docs.googleapis.com/v1/documents', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: 'Aakash Kumar Resume' }),
      });

      if (!createRes.ok) {
        throw new Error(`Failed to create document structure: ${createRes.statusText}`);
      }

      const newDoc = await createRes.json();
      const docId = newDoc.documentId;

      // 2. Insert the Resume content
      const updateRes = await fetch(`https://docs.googleapis.com/v1/documents/${docId}:batchUpdate`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requests: [
            {
              insertText: {
                text: RESUME_TEXT,
                location: { index: 1 },
              },
            },
          ],
        }),
      });

      if (!updateRes.ok) {
        throw new Error(`Failed to populate document text: ${updateRes.statusText}`);
      }

      triggerToast('success', 'Created "Aakash Kumar Resume" in your Google Docs!');
      
      // Refresh the file list and auto-select the new file
      await fetchDriveFiles(accessToken);
      setSelectedFileId(docId);
      setRawText(RESUME_TEXT);
      setSelectedFileName('Aakash Kumar Resume');
    } catch (err: any) {
      console.error(err);
      triggerToast('error', `Failed to create test document: ${err.message}`);
    } finally {
      setIsCreatingTestDoc(false);
    }
  };

  // Perform character replacement in either offline text or online Google Doc
  const handleExecuteReplace = () => {
    // Show mandatory confirmation modal before applying mutations
    setShowConfirmModal(true);
  };

  const confirmAndExecute = async () => {
    setShowConfirmModal(false);
    
    if (activeTab === 'paste') {
      // Offline direct string replacement
      setIsExecutingReplace(true);
      try {
        let updatedText = rawText;
        if (matchCase) {
          // Case-preserving replacement for single characters
          // e.g. 'r' -> 't' and 'R' -> 'T'
          if (findStr.length === 1 && replaceStr.length === 1) {
            const findLower = findStr.toLowerCase();
            const findUpper = findStr.toUpperCase();
            const replaceLower = replaceStr.toLowerCase();
            const replaceUpper = replaceStr.toUpperCase();
            
            updatedText = rawText
              .replace(new RegExp(findLower, 'g'), replaceLower)
              .replace(new RegExp(findUpper, 'g'), replaceUpper);
          } else {
            // Standard global regex with word boundaries
            updatedText = rawText.replace(new RegExp(findStr, 'g'), replaceStr);
          }
        } else {
          // Case-insensitive global replace
          updatedText = rawText.replace(new RegExp(findStr, 'gi'), replaceStr);
        }

        setRawText(updatedText);
        triggerToast('success', `Replaced all instances of "${findStr}" with "${replaceStr}" locally!`);
      } catch (err: any) {
        triggerToast('error', `Replacement error: ${err.message}`);
      } finally {
        setIsExecutingReplace(false);
      }
    } else {
      // Cloud Document batchUpdate execution
      if (!selectedFileId) {
        triggerToast('error', 'No Google Doc is selected.');
        return;
      }
      
      const accessToken = token || await getAccessToken();
      if (!accessToken) {
        triggerToast('error', 'OAuth token is missing. Please sign in again.');
        return;
      }

      setIsExecutingReplace(true);
      try {
        const requests = [];

        if (matchCase && findStr.length === 1 && replaceStr.length === 1) {
          // Elegant case preservation for standard letters
          requests.push(
            {
              replaceAllText: {
                containsText: {
                  text: findStr.toLowerCase(),
                  matchCase: true,
                },
                replaceText: replaceStr.toLowerCase(),
              },
            },
            {
              replaceAllText: {
                containsText: {
                  text: findStr.toUpperCase(),
                  matchCase: true,
                },
                replaceText: replaceStr.toUpperCase(),
              },
            }
          );
        } else {
          requests.push({
            replaceAllText: {
              containsText: {
                text: findStr,
                matchCase: matchCase,
              },
              replaceText: replaceStr,
            },
          });
        }

        const res = await fetch(`https://docs.googleapis.com/v1/documents/${selectedFileId}:batchUpdate`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ requests }),
        });

        if (!res.ok) {
          throw new Error(`Google Docs API returned error: ${res.statusText}`);
        }

        triggerToast('success', `Successfully updated "${selectedFileName}" on Google Docs!`);
        
        // Reload content to show new states
        await loadDocContent(selectedFileId, accessToken);
      } catch (err: any) {
        console.error(err);
        triggerToast('error', `Cloud edit failed: ${err.message}`);
      } finally {
        setIsExecutingReplace(false);
      }
    }
  };

  // Selection Callback
  const handleSelectFile = (fileId: string) => {
    setSelectedFileId(fileId);
    if (token) {
      loadDocContent(fileId, token);
    }
  };

  // Compute real-time text analysis metrics using useMemo
  const analysis = useMemo<AnalysisResult>(() => {
    return analyzeText(rawText);
  }, [rawText]);

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col text-zinc-800 font-sans antialiased">
      <Header 
        user={user} 
        needsAuth={needsAuth} 
        onLogout={handleLogout} 
        onLogin={handleLogin} 
        isLoggingIn={isLoggingIn} 
      />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Selectors */}
        <section className="lg:col-span-4 flex flex-col gap-6" id="doc-selection-panel">
          <DocumentSelector
            files={files}
            selectedFileId={selectedFileId}
            onSelectFile={handleSelectFile}
            onRefresh={() => token && fetchDriveFiles(token)}
            isLoadingFiles={isLoadingFiles}
            onCreateTestDoc={handleCreateTestDoc}
            isCreatingTestDoc={isCreatingTestDoc}
            isAuthenticated={!needsAuth}
            onLogin={handleLogin}
            isLoggingIn={isLoggingIn}
            activeTab={activeTab}
            setActiveTab={(tab) => {
              setActiveTab(tab);
              if (tab === 'paste') {
                setSelectedFileName('Pasted Text Sandbox');
                setRawText(RESUME_TEXT);
              } else if (selectedFileId && token) {
                loadDocContent(selectedFileId, token);
              } else {
                setRawText('');
                setSelectedFileName('Select a Google Doc');
              }
            }}
          />

          {/* Quick Stats Summary */}
          <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-xs space-y-3">
            <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Quick Document Stats</h4>
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="bg-zinc-50 p-2.5 rounded-lg border border-zinc-100">
                <p className="text-[10px] text-zinc-400 font-mono">CHARACTERS</p>
                <p className="text-lg font-bold font-mono text-zinc-800">{analysis.totalChars}</p>
              </div>
              <div className="bg-zinc-50 p-2.5 rounded-lg border border-zinc-100">
                <p className="text-[10px] text-zinc-400 font-mono">WORDS</p>
                <p className="text-lg font-bold font-mono text-zinc-800">{analysis.totalWords}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Center: Live Viewer */}
        <section className="lg:col-span-5 flex flex-col h-full" id="doc-viewer-panel">
          <DocumentViewer
            text={rawText}
            onChangeText={(newText) => {
              if (activeTab === 'paste') setRawText(newText);
            }}
            documentName={selectedFileName}
            isPastedMode={activeTab === 'paste'}
            highlightMode={highlightMode}
            setHighlightMode={setHighlightMode}
            findStr={findStr}
            replaceStr={replaceStr}
          />
        </section>

        {/* Right Side: Find & Replace Analytics */}
        <section className="lg:col-span-3" id="doc-stats-panel">
          <StatsPanel
            analysis={analysis}
            findStr={findStr}
            setFindStr={setFindStr}
            replaceStr={replaceStr}
            setReplaceStr={setReplaceStr}
            matchCase={matchCase}
            setMatchCase={setMatchCase}
            onExecuteReplace={handleExecuteReplace}
            isExecutingReplace={isExecutingReplace}
            isPastedMode={activeTab === 'paste'}
          />
        </section>
      </main>

      {/* Confirmation Modal (MANDATORY per safety guidelines) */}
      <AnimatePresence>
        {showConfirmModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl max-w-md w-full p-6 border border-zinc-200 shadow-xl space-y-4"
            >
              <div className="flex gap-3 items-start">
                <div className="bg-amber-50 text-amber-600 p-2 rounded-full border border-amber-200">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-zinc-800">Confirm Find & Replace Action</h3>
                  <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                    You are about to perform a global search & replace in your document.
                  </p>
                </div>
              </div>

              <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-3 space-y-2 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Target File:</span>
                  <span className="text-zinc-800 font-semibold truncate max-w-[200px]">{selectedFileName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Find:</span>
                  <span className="text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">"{findStr}"</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Replace with:</span>
                  <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">"{replaceStr}"</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Case Preserving:</span>
                  <span>{matchCase ? 'Yes' : 'No'}</span>
                </div>
              </div>

              {activeTab !== 'paste' && (
                <div className="p-3 bg-red-50 text-red-700 rounded-lg text-xs leading-normal flex gap-2 border border-red-200">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
                  <div>
                    <strong>Warning:</strong> This will execute a direct write update in your actual Google Doc in Google Drive. This modification cannot be automatically undone.
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="px-4 py-2 border border-zinc-200 text-zinc-600 hover:bg-zinc-50 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmAndExecute}
                  className={`px-4 py-2 rounded-lg text-xs font-medium text-white transition-colors cursor-pointer ${
                    activeTab === 'paste' ? 'bg-zinc-800 hover:bg-zinc-900' : 'bg-emerald-600 hover:bg-emerald-700'
                  }`}
                >
                  Confirm & Replace
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Notification Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 20, x: '-50%' }}
            className={`fixed bottom-6 left-1/2 z-50 px-4 py-3 rounded-xl shadow-lg border text-xs font-medium flex items-center gap-2 max-w-sm ${
              toast.type === 'success'
                ? 'bg-emerald-900 text-emerald-100 border-emerald-800'
                : toast.type === 'error'
                ? 'bg-rose-900 text-rose-100 border-rose-800'
                : 'bg-zinc-900 text-zinc-100 border-zinc-800'
            }`}
          >
            {toast.type === 'success' && <Check className="w-4 h-4 shrink-0 text-emerald-400" />}
            {toast.type === 'error' && <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />}
            <span>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
