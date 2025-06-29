import React, { useState } from 'react';
import { CheckCircle, XCircle, Clock, Download, Eye, AlertTriangle, Info, ChevronDown, ChevronUp, Bot } from 'lucide-react';

interface TestCase {
  name: string;
  status: 'passed' | 'failed' | 'skipped';
  error?: string;
  location?: string;
  timestamp: string;
  duration?: number;
  details?: string;
  troubleshooting?: string[];
}

interface TestResultsProps {
  results: {
    testId: string;
    status: string;
    url?: string;
    results: {
      passed: number;
      failed: number;
      skipped: number;
      duration: number;
      total?: number;
    };
    testCases?: TestCase[];
    logs: string[];
    screenshots: any[];
    aiAnalysis?: string;
    summary?: {
      successRate: number;
      criticalFailures: number;
      recommendations: string[];
    };
  };
}

const TestResults: React.FC<TestResultsProps> = ({ results }) => {
  const [expandedTestCase, setExpandedTestCase] = useState<string | null>(null);
  const [showAIAnalysis, setShowAIAnalysis] = useState(false);
  
  // Debug: Log screenshot data
  React.useEffect(() => {
    console.log('TestResults received data:', {
      screenshots: results.screenshots,
      screenshotCount: results.screenshots?.length || 0
    });
  }, [results.screenshots]);
  
  const { passed, failed, skipped, duration, total } = results.results;
  const totalTests = total || passed + failed + skipped;
  const successRate = totalTests > 0 ? Math.round((passed / totalTests) * 100) : 0;

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

  const getTestCaseIcon = (status: string) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-400" />;
      case 'skipped':
        return <Clock className="h-4 w-4 text-yellow-400" />;
      default:
        return <Info className="h-4 w-4 text-gray-400" />;
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
          <span>{totalTests} total tests</span>
        </div>
      </div>

      {/* AI Analysis */}
      {results.aiAnalysis && (
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Bot className="h-5 w-5 text-purple-400" />
              <h3 className="text-white font-semibold">AI Analysis</h3>
            </div>
            <button
              onClick={() => setShowAIAnalysis(!showAIAnalysis)}
              className="flex items-center space-x-1 text-purple-400 hover:text-purple-300"
            >
              <span className="text-sm">
                {showAIAnalysis ? 'Hide' : 'Show'} Analysis
              </span>
              {showAIAnalysis ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
          </div>
          {showAIAnalysis && (
            <div className="bg-slate-900 rounded-lg p-4">
              <div className="text-gray-300 text-sm whitespace-pre-wrap">
                {results.aiAnalysis}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Detailed Test Cases */}
      {results.testCases && results.testCases.length > 0 && (
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
          <h3 className="text-white font-semibold mb-4">Test Cases Details</h3>
          <div className="space-y-3">
            {results.testCases.map((testCase, index) => (
              <div key={index} className="bg-slate-800 rounded-lg border border-gray-700">
                <div 
                  className="p-4 cursor-pointer"
                  onClick={() => setExpandedTestCase(
                    expandedTestCase === testCase.name ? null : testCase.name
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getTestCaseIcon(testCase.status)}
                      <div>
                        <div className="text-white font-medium">{testCase.name}</div>
                        <div className="text-gray-400 text-sm">
                          {testCase.location} • {new Date(testCase.timestamp).toLocaleTimeString()}
                          {testCase.duration && ` • ${testCase.duration}ms`}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        testCase.status === 'passed' ? 'bg-green-500/20 text-green-400' :
                        testCase.status === 'failed' ? 'bg-red-500/20 text-red-400' :
                        'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {testCase.status.toUpperCase()}
                      </span>
                      {expandedTestCase === testCase.name ? 
                        <ChevronUp className="h-4 w-4 text-gray-400" /> : 
                        <ChevronDown className="h-4 w-4 text-gray-400" />
                      }
                    </div>
                  </div>
                </div>

                {expandedTestCase === testCase.name && (
                  <div className="px-4 pb-4 border-t border-gray-700">
                    <div className="mt-4 space-y-3">
                      {testCase.details && (
                        <div>
                          <div className="text-sm font-medium text-gray-300 mb-1">Description:</div>
                          <div className="text-sm text-gray-400">{testCase.details}</div>
                        </div>
                      )}
                      
                      {testCase.error && (
                        <div>
                          <div className="text-sm font-medium text-red-400 mb-1">Error:</div>
                          <div className="text-sm text-red-300 bg-red-500/10 p-2 rounded font-mono">
                            {testCase.error}
                          </div>
                        </div>
                      )}

                      {testCase.troubleshooting && testCase.troubleshooting.length > 0 && (
                        <div>
                          <div className="text-sm font-medium text-yellow-400 mb-2 flex items-center">
                            <AlertTriangle className="h-4 w-4 mr-1" />
                            Troubleshooting Tips:
                          </div>
                          <ul className="text-sm text-gray-400 space-y-1">
                            {testCase.troubleshooting.map((tip, tipIndex) => (
                              <li key={tipIndex} className="flex items-start">
                                <span className="text-yellow-400 mr-2">•</span>
                                {tip}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary and Recommendations */}
      {results.summary && (
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
          <h3 className="text-white font-semibold mb-4">Summary & Recommendations</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="text-sm text-gray-400 mb-2">Success Rate</div>
              <div className="text-2xl font-bold text-white">{results.summary.successRate}%</div>
              {results.summary.criticalFailures > 0 && (
                <div className="text-sm text-red-400 mt-1">
                  {results.summary.criticalFailures} critical failures detected
                </div>
              )}
            </div>
            <div>
              <div className="text-sm text-gray-400 mb-2">Recommendations</div>
              <ul className="space-y-1">
                {results.summary.recommendations.map((rec, index) => (
                  <li key={index} className="text-sm text-gray-300 flex items-start">
                    <span className="text-blue-400 mr-2">•</span>
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Test URL Info */}
      {results.url && (
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
          <h3 className="text-white font-semibold mb-2">Test Target</h3>
          <div className="text-gray-300">
            <span className="text-gray-400">URL:</span> {results.url}
          </div>
          <div className="text-gray-300 text-sm mt-1">
            <span className="text-gray-400">Test ID:</span> {results.testId}
          </div>
        </div>
      )}

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
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => {
                        console.log('Screenshot data:', screenshot);
                        if (screenshot.url) {
                          window.open(screenshot.url, '_blank');
                        }
                      }}
                      className="p-1 text-gray-400 hover:text-white transition-colors"
                      title="Open screenshot in new tab"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="text-xs text-gray-500 mb-2">
                  URL: {screenshot.url || 'No URL'} | File: {screenshot.filename || 'No filename'}
                </div>
                <div className="aspect-video bg-gradient-to-br from-gray-700 to-gray-800 rounded flex items-center justify-center overflow-hidden">
                  {screenshot.url || screenshot.data ? (
                    <img
                      src={screenshot.url || `data:image/png;base64,${screenshot.data}`}
                      alt={screenshot.name}
                      className="object-contain max-h-full max-w-full"
                      onError={(e) => {
                        console.error('Failed to load screenshot:', screenshot.url);
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent) {
                          parent.innerHTML = `
                            <div class="text-center p-4">
                              <span class="text-red-400 text-xs block">Failed to load image</span>
                              <span class="text-gray-500 text-xs">${screenshot.filename || 'unknown'}</span>
                            </div>
                          `;
                        }
                      }}
                      onLoad={() => console.log('Screenshot loaded successfully:', screenshot.url)}
                    />
                  ) : (
                    <div className="text-center p-4">
                      <span className="text-gray-500 text-xs block">No screenshot available</span>
                      <span className="text-gray-600 text-xs">{screenshot.filename || 'unknown'}</span>
                    </div>
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