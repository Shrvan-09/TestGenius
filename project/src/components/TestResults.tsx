import React from 'react';
import { CheckCircle, XCircle, Clock, Download, Eye } from 'lucide-react';


interface TestResultsProps {
  results: {
    testId: string;
    status: string;
    results: {
      passed: number;
      failed: number;
      skipped: number;
      duration: number;
    };
    logs: string[];
    screenshots: any[];
  };
}

const TestResults: React.FC<TestResultsProps> = ({ results }) => {
  const { passed, failed, skipped, duration } = results.results;
  const total = passed + failed + skipped;
  const successRate = total > 0 ? Math.round((passed / total) * 100) : 0;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-400';
      case 'completed_with_failures':
        return 'text-yellow-400';
      case 'failed':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-400" />;
      case 'completed_with_failures':
        return <XCircle className="h-5 w-5 text-yellow-400" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-400" />;
      default:
        return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  const handleExportPDF = () => {
   window.print();
    // If you want to use html2pdf instead of print, uncomment the following lines:
   
        


    
  };

  return (
    <div id="report-content">
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-bold text-white">Test Execution Results</h2>
          <div className="flex items-center space-x-2">
            {getStatusIcon(results.status)}
            <span className={`font-medium ${getStatusColor(results.status)}`}>
              {results.status.replace('_', ' ').toUpperCase()}
            </span>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <button onClick={() => handleExportPDF()} className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all flex items-center space-x-2">
            <Download className="h-4 w-4" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{passed}</div>
              <div className="text-green-400 text-sm">Passed</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-500/20 rounded-lg">
              <XCircle className="h-6 w-6 text-red-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{failed}</div>
              <div className="text-red-400 text-sm">Failed</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-yellow-500/20 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{skipped}</div>
              <div className="text-yellow-400 text-sm">Skipped</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Clock className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{(duration / 1000).toFixed(1)}s</div>
              <div className="text-blue-400 text-sm">Duration</div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold">Success Rate</h3>
          <span className="text-2xl font-bold text-white">{successRate}%</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-3">
          <div 
            className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${successRate}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-sm text-gray-400 mt-2">
          <span>{passed} passed</span>
          <span>{total} total tests</span>
        </div>
      </div>

      {/* Test Logs */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
        <h3 className="text-white font-semibold mb-4">Execution Logs</h3>
        <div className="bg-slate-900 rounded-lg p-4 max-h-96 overflow-y-auto">
          <div className="font-mono text-sm space-y-1">
            {results.logs.map((log, index) => (
              <div 
                key={index} 
                className={`flex items-start space-x-3 ${
                  log.startsWith('✓') ? 'text-green-400' :
                  log.startsWith('✗') ? 'text-red-400' :
                  'text-gray-300'
                }`}
              >
                <span className="text-gray-500 text-xs mt-1">{(index + 1).toString().padStart(2, '0')}</span>
                <span>{log}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Screenshots */}
      {results.screenshots && results.screenshots.length > 0 && (
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold">Screenshots</h3>
            <span className="text-gray-400 text-sm">{results.screenshots.length} captured</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {results.screenshots.map((screenshot, index) => (
              <div key={index} className="bg-slate-800 rounded-lg p-4 border border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white text-sm font-medium">{screenshot.name}</span>
                  <button className="p-1 text-gray-400 hover:text-white transition-colors">
                    <Eye className="h-4 w-4" />
                  </button>
                </div>
                <div className="aspect-video bg-gradient-to-br from-gray-700 to-gray-800 rounded flex items-center justify-center overflow-hidden">
                  {screenshot.url || screenshot.data ? (
                    <img
                      src={screenshot.url || `data:image/png;base64,${screenshot.data}`}
                      alt={screenshot.name}
                      className="object-contain max-h-full max-w-full"
                    />
                  ) : (
                    <span className="text-gray-500 text-xs">Screenshot Preview</span>
                  )}
                </div>
                <div className="text-xs text-gray-400 mt-2">
                  {new Date(screenshot.timestamp).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
</div>

    </div>
  );
};

export default TestResults;