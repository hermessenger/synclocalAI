import React from 'react';
import { IconVideoCamera, IconSparkles } from './IconComponents';

export const Header: React.FC = () => {
  return (
    <header className="w-full max-w-6xl bg-white shadow-md rounded-lg p-6 mb-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <IconVideoCamera className="w-10 h-10 text-sky-600" />
          <h1 className="text-3xl font-bold text-slate-800">
            AI Lip-Sync <span className="text-sky-600">Studio</span>
          </h1>
        </div>
        <IconSparkles className="w-8 h-8 text-amber-500" />
      </div>
       <p className="mt-2 text-sm text-slate-600">
        Create compelling, multi-language lip-synced videos with advanced AI.
      </p>
    </header>
  );
};
