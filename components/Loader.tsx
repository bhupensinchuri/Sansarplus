import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoaderProps {
  text?: string;
  fullScreen?: boolean;
}

const Loader: React.FC<LoaderProps> = ({ text, fullScreen }) => {
  const content = (
    <div className="flex flex-col items-center justify-center space-y-4 text-primary">
      <Loader2 className="w-10 h-10 animate-spin" />
      <p className="text-slate-500 font-medium animate-pulse">{text}</p>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
        {content}
      </div>
    );
  }

  return <div className="py-12 flex justify-center w-full">{content}</div>;
};

export default Loader;