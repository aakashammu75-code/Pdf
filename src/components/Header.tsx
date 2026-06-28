import React from 'react';
import { User } from 'firebase/auth';
import { LogOut, FileText, CheckCircle, HelpCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface HeaderProps {
  user: User | null;
  needsAuth: boolean;
  onLogout: () => void;
  onLogin: () => void;
  isLoggingIn: boolean;
}

export default function Header({ user, needsAuth, onLogout, onLogin, isLoggingIn }: HeaderProps) {
  return (
    <header className="border-b border-zinc-200 bg-white sticky top-0 z-10 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-blue-50 text-blue-600 p-2 rounded-lg border border-blue-100 shadow-xs">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-zinc-900 tracking-tight flex items-center gap-2">
              Doc Text Replacer & Counter
            </h1>
            <p className="text-xs text-zinc-500 font-mono">Google Docs & Drive Integration</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3 bg-zinc-50 border border-zinc-200/60 p-1.5 pl-3 pr-2.5 rounded-full"
            >
              <div className="flex flex-col text-right">
                <span className="text-xs font-medium text-zinc-800">{user.displayName || 'Google User'}</span>
                <span className="text-[10px] font-mono text-zinc-500 leading-none">{user.email}</span>
              </div>
              {user.photoURL ? (
                <img 
                  src={user.photoURL} 
                  alt={user.displayName || 'Avatar'} 
                  referrerPolicy="no-referrer"
                  className="w-8 h-8 rounded-full border border-zinc-300"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-semibold flex items-center justify-center text-xs">
                  {user.displayName ? user.displayName[0].toUpperCase() : 'U'}
                </div>
              )}
              <button
                onClick={onLogout}
                title="Sign out"
                className="p-1.5 text-zinc-500 hover:text-zinc-800 hover:bg-zinc-200/50 rounded-full transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </motion.div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-zinc-400 flex items-center gap-1 bg-zinc-50 px-2 py-1 border border-zinc-200 rounded">
                <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-pulse"></span>
                Sandbox Mode (Offline)
              </span>
              <button
                onClick={onLogin}
                disabled={isLoggingIn}
                className="text-xs px-3 py-1.5 font-medium border border-blue-600 text-blue-600 hover:bg-blue-50 transition-colors rounded-md disabled:opacity-50"
              >
                {isLoggingIn ? 'Connecting...' : 'Sign in for Docs Sync'}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
