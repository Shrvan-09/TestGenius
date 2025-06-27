import React, { useState } from 'react';
import { ArrowLeft, Globe, Code, Play, Download, Copy, CheckCircle, XCircle, Clock, Loader } from 'lucide-react';
import CodeEditor from './CodeEditor';
import TestResults from './TestResults';

interface TestGeneratorProps {
  onBack: () => void;
}

interface TestData {
  testId: string;
  url: string;
  testType: string;
  language: string;
  code: string;
  analysis: any;
}

interface ExecutionResults {
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
}

const TestGenerator: React.FC<TestGeneratorProps> = ({ onBack }) => {
  const [url, setUrl] = useState('');
  const [testType, setTestType] = useState('basic');
  const [language, setLanguage] = useState('javascript');
  const [loading, setLoading] = useState(false);
  const [executing, setExecuting] = useState(false);
  const [testData, setTestData] = useState<TestData | null>(null);
  const [executionResults, setExecutionResults] = useState<ExecutionResults | null>(null);
  const [activeTab, setActiveTab] = useState('generator');
  const [error, setError] = useState('');

  const testTypes = [
    { value: 'basic', label: 'Basic Interactions', description: 'Navigation, clicks, and basic user flows' },
    { value: 'forms', label: 'Form Testing', description: 'Form validation and submission testing' },
    { value: 'responsive', label: 'Responsive Design', description: 'Cross-device compatibility testing' },
    { value: 'comprehensive', label: 'Comprehensive Suite', description: 'Full-scale testing with edge cases' }
  ];

  const languages = [
    { value: 'javascript', label: 'JavaScript', description: 'Playwright with Node.js' },
    { value: 'python', label: 'Python', description: 'Playwright with Python' }
  ];

  const generateTest = async () => {
    if (!url.trim()) {
      setError('Please enter a valid URL');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: url.trim(),
          testType,
          language
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to generate test');
      }

      const data = await response.json();
      setTestData(data);
      setActiveTab('code');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const executeTest = async () => {
    if (!testData) return;

    setExecuting(true);
    setError('');

    try {
      const response = await fetch('/api/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: testData.code,
          language: testData.language,
          testId: testData.testId
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to execute test');
      }

      const results = await response.json();
      setExecutionResults(results);
      setActiveTab('results');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during execution');
    } finally {
      setExecuting(false);
    }
  };

  const copyToClipboard = () => {
    if (testData?.code) {
      navigator.clipboard.writeText(testData.code);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/10"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-white">Test Generator</h1>
            <p className="text-gray-400">Generate AI-powered Playwright tests for any website</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveTab('generator')}
            className={`px-4 py-2 rounded-lg transition-all ${
              activeTab === 'generator' 
                ? 'bg-purple-600 text-white' 
                : 'text-gray-400 hover:text-white hover:bg-white/10'
            }`}
          >
            Generator
          </button>
          <button
            onClick={() => setActiveTab('code')}
            disabled={!testData}
            className={`px-4 py-2 rounded-lg transition-all ${
              activeTab === 'code' 
                ? 'bg-purple-600 text-white' 
                : 'text-gray-400 hover:text-white hover:bg-white/10 disabled:opacity-50'
            }`}
          >
            Code
          </button>
          <button
            onClick={() => setActiveTab('results')}
            disabled={!executionResults}
            className={`px-4 py-2 rounded-lg transition-all ${
              activeTab === 'results' 
                ? 'bg-purple-600 text-white' 
                : 'text-gray-400 hover:text-white hover:bg-white/10 disabled:opacity-50'
            }`}
          >
            Results
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-300">
          <div className="flex items-center space-x-2">
            <XCircle className="h-5 w-5" />
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Generator Tab */}
      {activeTab === 'generator' && (
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Input Section */}
            <div className="space-y-6">
              <div>
                <label className="block text-white font-semibold mb-3">Website URL</label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://example.com"
                    className="w-full pl-10 pr-4 py-3 bg-white/10 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-white font-semibold mb-3">Test Type</label>
                <div className="grid grid-cols-1 gap-3">
                  {testTypes.map((type) => (
                    <div
                      key={type.value}
                      onClick={() => setTestType(type.value)}
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${
                        testType === type.value
                          ? 'border-purple-500 bg-purple-500/10'
                          : 'border-gray-600 hover:border-gray-500 bg-white/5'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-white font-medium">{type.label}</div>
                          <div className="text-gray-400 text-sm">{type.description}</div>
                        </div>
                        <div className={`w-4 h-4 rounded-full border-2 ${
                          testType === type.value 
                            ? 'border-purple-500 bg-purple-500' 
                            : 'border-gray-400'
                        }`}>
                          {testType === type.value && (
                            <div className="w-full h-full rounded-full bg-white scale-50"></div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-white font-semibold mb-3">Language</label>
                <div className="grid grid-cols-1 gap-3">
                  {languages.map((lang) => (
                    <div
                      key={lang.value}
                      onClick={() => setLanguage(lang.value)}
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${
                        language === lang.value
                          ? 'border-blue-500 bg-blue-500/10'
                          : 'border-gray-600 hover:border-gray-500 bg-white/5'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-white font-medium">{lang.label}</div>
                          <div className="text-gray-400 text-sm">{lang.description}</div>
                        </div>
                        <div className={`w-4 h-4 rounded-full border-2 ${
                          language === lang.value 
                            ? 'border-blue-500 bg-blue-500' 
                            : 'border-gray-400'
                        }`}>
                          {language === lang.value && (
                            <div className="w-full h-full rounded-full bg-white scale-50"></div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={generateTest}
                disabled={loading || !url.trim()}
                className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:transform-none flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <Loader className="animate-spin h-5 w-5 mr-2" />
                    Generating Tests...
                  </>
                ) : (
                  <>
                    <Code className="h-5 w-5 mr-2" />
                    Generate Test Suite
                  </>
                )}
              </button>
            </div>

            {/* Preview Section */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h3 className="text-white font-semibold mb-4">Preview Configuration</h3>
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">URL:</span>
                  <span className="text-white">{url || 'Not specified'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Test Type:</span>
                  <span className="text-white">{testTypes.find(t => t.value === testType)?.label}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Language:</span>
                  <span className="text-white">{languages.find(l => l.value === language)?.label}</span>
                </div>
              </div>
              
              {testData && (
                <div className="mt-6 pt-6 border-t border-white/10">
                  <h4 className="text-white font-medium mb-3">Website Analysis</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Page Title:</span>
                      <span className="text-white truncate max-w-32">{testData.analysis.title || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Buttons Found:</span>
                      <span className="text-white">{testData.analysis.buttons?.length || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Forms Found:</span>
                      <span className="text-white">{testData.analysis.forms?.length || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Links Found:</span>
                      <span className="text-white">{testData.analysis.links?.length || 0}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Code Tab */}
      {activeTab === 'code' && testData && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h2 className="text-2xl font-bold text-white">Generated Test Code</h2>
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span>AI Generated</span>
                </div>
                <span>•</span>
                <span>{testData.language === 'javascript' ? 'JavaScript' : 'Python'}</span>
                <span>•</span>
                <span>{testData.testType} tests</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={copyToClipboard}
                className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all flex items-center space-x-2"
              >
                <Copy className="h-4 w-4" />
                <span>Copy</span>
              </button>
              <button
                onClick={executeTest}
                disabled={executing}
                className="px-6 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all flex items-center space-x-2 disabled:opacity-50"
              >
                {executing ? (
                  <>
                    <Loader className="animate-spin h-4 w-4" />
                    <span>Executing...</span>
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" />
                    <span>Execute Tests</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <CodeEditor code={testData.code} language={testData.language} />
        </div>
      )}

      {/* Results Tab */}
      {activeTab === 'results' && executionResults && (
        <TestResults results={executionResults} />
      )}
    </div>
  );
};

export default TestGenerator;