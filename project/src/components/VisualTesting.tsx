import React, { useState } from 'react';
import { Play, Eye, Download, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

interface Step {
  step: number;
  elementType: string;
  selector: string;
  color: string;
  elementsFound: number;
  screenshot: string;
  timestamp: string;
}

interface TestResults {
  testId: string;
  url: string;
  timestamp: string;
  steps: Step[];
  screenshots: string[];
  videoPath: string | null;
  summary: {
    totalElements: number;
    elementTypes: Record<string, number>;
    testDuration: number;
  };
}

interface StepCardProps {
  step: Step;
  isActive: boolean;
  onClick: () => void;
}

const VisualTesting: React.FC = () => {
  const [url, setUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [testResults, setTestResults] = useState<TestResults | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<number>(0);

  const handleVisualTest = async (): Promise<void> => {
    if (!url) {
      setError('Please enter a URL to test');
      return;
    }

    setIsLoading(true);
    setError(null);
    setTestResults(null);

    try {
      const response = await fetch('/api/visual/visual-test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();

      if (data.success) {
        setTestResults(data.results);
        setCurrentStep(0);
      } else {
        setError(data.error || 'Visual testing failed');
      }
    } catch {
      setError('Failed to connect to testing service');
    } finally {
      setIsLoading(false);
    }
  };

  const downloadVideo = async () => {
    if (testResults?.videoPath) {
      try {
        // Extract filename from the full path
        const filename = testResults.videoPath.split('/').pop() || 'visual-test-recording.webm';
        const videoUrl = `/videos/${filename}`;
        
        // Fetch the video as a blob
        const response = await fetch(videoUrl);
        if (!response.ok) {
          throw new Error(`Failed to fetch video: ${response.status}`);
        }
        
        const blob = await response.blob();
        
        // Create object URL and download
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `visual-test-${testResults.testId}.webm`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up object URL
        window.URL.revokeObjectURL(url);
      } catch (error) {
        console.error('Download failed:', error);
        alert('Failed to download video. Please try again.');
      }
    }
  };

  const getElementTypeColor = (elementType: string): string => {
    const colors: Record<string, string> = {
      'Navigation Links': '#98D8C8',
      'Primary Buttons': '#FF6B6B',
      'Form Inputs': '#4ECDC4',
      'Interactive Buttons': '#F7DC6F',
      'Forms': '#45B7D1',
      'Links': '#96CEB4',
      'Images': '#DDA0DD',
      'Text Areas': '#FFEAA7',
      'Final Overview': '#85C1E9'
    };
    return colors[elementType] || '#85C1E9';
  };

  const StepCard: React.FC<StepCardProps> = ({ step, isActive, onClick }) => (
    <div
      className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
        isActive 
          ? 'border-blue-500 bg-blue-50 shadow-md' 
          : 'border-gray-200 hover:border-gray-300'
      }`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <div 
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: getElementTypeColor(step.elementType) }}
          ></div>
          <span className="font-medium text-gray-900">
            Step {step.step}: {step.elementType}
          </span>
        </div>
        <span className="text-sm text-gray-500">
          {step.elementsFound} elements
        </span>
      </div>
      
      {step.screenshot && (
        <img
          src={`/screenshots/${step.screenshot}`}
          alt={`Step ${step.step} screenshot`}
          className="w-full h-32 object-cover rounded border"
        />
      )}
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6">
          <h2 className="text-2xl font-bold mb-2 flex items-center">
            <Eye className="mr-3" size={28} />
            Visual Testing & Component Analysis
          </h2>
          <p className="text-purple-200">
            Stepwise visual analysis of UI components
          </p>
        </div>

        {/* URL Input */}
        <div className="p-6 border-b">
          <div className="flex space-x-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Website URL to Test
              </label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={handleVisualTest}
                disabled={isLoading || !url}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isLoading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <Play size={20} />
                )}
                <span>{isLoading ? 'Testing...' : 'Start Visual Test'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="p-4 bg-red-50 border-l-4 border-red-400">
            <div className="flex items-center">
              <AlertCircle className="text-red-400 mr-2" size={20} />
              <span className="text-red-700">{error}</span>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="p-8 text-center">
            <Loader2 className="mx-auto animate-spin mb-4" size={40} />
            <p className="text-gray-600">
              Analyzing website components and generating visual overlays...
            </p>
            <p className="text-sm text-gray-500 mt-2">
              This may take a few minutes depending on the website complexity
            </p>
          </div>
        )}

        {/* Results */}
        {testResults && (
          <div className="p-6">
            {/* Summary */}
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center mb-2">
                <CheckCircle className="text-green-600 mr-2" size={20} />
                <span className="font-medium text-green-800">
                  Visual Analysis Complete
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Total Elements:</span>
                  <span className="ml-2 font-semibold text-gray-900">
                    {testResults.summary.totalElements}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Steps Completed:</span>
                  <span className="ml-2 font-semibold text-gray-900">
                    {testResults.steps.length}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Duration:</span>
                  <span className="ml-2 font-semibold text-gray-900">
                    {Math.round(testResults.summary.testDuration / 1000)}s
                  </span>
                </div>
              </div>
            </div>

            {/* Element Type Summary */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4">Component Types Found</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Object.entries(testResults.summary.elementTypes).map(([type, count]) => (
                  <div key={type} className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: getElementTypeColor(type) }}
                    ></div>
                    <div>
                      <div className="font-medium text-sm">{type}</div>
                      <div className="text-xs text-gray-600">{count} elements</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Step-by-Step Results */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4">Step-by-Step Analysis</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {testResults.steps.map((step, index) => (
                  <StepCard
                    key={index}
                    step={step}
                    isActive={currentStep === index}
                    onClick={() => setCurrentStep(index)}
                  />
                ))}
              </div>
            </div>

            {/* Current Step Details */}
            {testResults.steps[currentStep] && (
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">
                  Step {testResults.steps[currentStep].step}: {testResults.steps[currentStep].elementType}
                </h3>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Screenshot */}
                  <div>
                    <h4 className="font-medium mb-2">Visual Analysis</h4>
                    <img
                      src={`/screenshots/${testResults.steps[currentStep].screenshot}`}
                      alt={`Step ${testResults.steps[currentStep].step} analysis`}
                      className="w-full border rounded-lg shadow-sm"
                    />
                  </div>
                  
                  {/* Details */}
                  <div>
                    <h4 className="font-medium mb-2">Details</h4>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: getElementTypeColor(testResults.steps[currentStep].elementType) }}
                        ></div>
                        <span className="text-sm">
                          <strong>Color Code:</strong> {testResults.steps[currentStep].color}
                        </span>
                      </div>
                      
                      <div className="text-sm">
                        <strong>Elements Found:</strong> {testResults.steps[currentStep].elementsFound}
                      </div>
                      
                      <div className="text-sm">
                        <strong>CSS Selector:</strong>
                        <code className="ml-2 px-2 py-1 bg-gray-100 rounded text-xs">
                          {testResults.steps[currentStep].selector}
                        </code>
                      </div>
                      
                      <div className="text-sm">
                        <strong>Timestamp:</strong> {new Date(testResults.steps[currentStep].timestamp).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Video Download */}
            {testResults.videoPath && (
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-blue-900">Recording Available</h4>
                    <p className="text-sm text-blue-700">
                      Complete video recording of the visual analysis process
                    </p>
                  </div>
                  <button 
                    onClick={downloadVideo}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Download size={16} />
                    <span>Download Video</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default VisualTesting;
