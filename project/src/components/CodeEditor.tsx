import React from 'react';
import { Copy, Download } from 'lucide-react';

interface CodeEditorProps {
  code: string;
  language: string;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ code, language }) => {
  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
  };

  const downloadCode = () => {
    const extension = language === 'javascript' ? 'js' : 'py';
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `playwright-test.${extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-slate-900 border border-gray-700 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-slate-800 border-b border-gray-700">
        <div className="flex items-center space-x-4">
          <div className="flex space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          </div>
          <span className="text-gray-400 text-sm">
            playwright-test.{language === 'javascript' ? 'js' : 'py'}
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={copyToClipboard}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-all"
            title="Copy to clipboard"
          >
            <Copy className="h-4 w-4" />
          </button>
          <button
            onClick={downloadCode}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-all"
            title="Download file"
          >
            <Download className="h-4 w-4" />
          </button>
        </div>
      </div>
      
      <div className="p-6 overflow-x-auto">
        <pre className="text-sm text-gray-300 font-mono leading-relaxed">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
};

export default CodeEditor;