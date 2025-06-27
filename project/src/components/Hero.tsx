import React from 'react';
import { ArrowRight, Sparkles, Code, Play, CheckCircle } from 'lucide-react';

interface HeroProps {
  onGetStarted: () => void;
}

const Hero: React.FC<HeroProps> = ({ onGetStarted }) => {
  return (
    <div className="max-w-7xl mx-auto px-6 pt-20 pb-32">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <div className="inline-flex items-center px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-full text-purple-300 text-sm mb-8 backdrop-blur-sm">
          <Sparkles className="h-4 w-4 mr-2" />
          Powered by Google Gemini AI
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-8 leading-tight">
          AI-Powered
          <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent block">
            Test Generation
          </span>
        </h1>
        
        <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
          Transform any website URL into comprehensive Playwright test suites. 
          Our AI analyzes your web application and generates intelligent, production-ready tests in seconds.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button 
            onClick={onGetStarted}
            className="group px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-blue-700 transition-all transform hover:scale-105 shadow-2xl shadow-purple-500/25 flex items-center"
          >
            Generate Tests Now
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </button>
          
          <button className="px-8 py-4 border border-gray-600 text-gray-300 rounded-xl font-semibold hover:border-gray-500 hover:text-white transition-all flex items-center backdrop-blur-sm">
            <Play className="mr-2 h-5 w-5" />
            Watch Demo
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
        <div className="text-center p-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl">
          <div className="text-3xl font-bold text-white mb-2">10,000+</div>
          <div className="text-gray-400">Tests Generated</div>
        </div>
        <div className="text-center p-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl">
          <div className="text-3xl font-bold text-white mb-2">99.9%</div>
          <div className="text-gray-400">Uptime</div>
        </div>
        <div className="text-center p-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl">
          <div className="text-3xl font-bold text-white mb-2">{"< 30s"}</div>
          <div className="text-gray-400">Generation Time</div>
        </div>
      </div>

      {/* How it works */}
      <div className="text-center mb-16">
        <h2 className="text-3xl font-bold text-white mb-4">How It Works</h2>
        <p className="text-gray-400 mb-12 max-w-2xl mx-auto">
          Our advanced AI system analyzes your website and creates intelligent test scenarios
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="relative">
            <div className="p-6 bg-gradient-to-b from-purple-500/10 to-transparent border border-purple-500/20 rounded-2xl backdrop-blur-sm">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl flex items-center justify-center mb-4 mx-auto">
                <span className="text-white font-bold">1</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Enter URL</h3>
              <p className="text-gray-400">
                Simply paste your website URL and select your preferred test type and language
              </p>
            </div>
            <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-purple-500 to-transparent"></div>
          </div>
          
          <div className="relative">
            <div className="p-6 bg-gradient-to-b from-blue-500/10 to-transparent border border-blue-500/20 rounded-2xl backdrop-blur-sm">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-green-600 rounded-xl flex items-center justify-center mb-4 mx-auto">
                <Code className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">AI Analysis</h3>
              <p className="text-gray-400">
                Our AI analyzes your website's structure and generates comprehensive test scenarios
              </p>
            </div>
            <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-blue-500 to-transparent"></div>
          </div>
          
          <div className="p-6 bg-gradient-to-b from-green-500/10 to-transparent border border-green-500/20 rounded-2xl backdrop-blur-sm">
            <div className="w-12 h-12 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl flex items-center justify-center mb-4 mx-auto">
              <CheckCircle className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">Get Results</h3>
            <p className="text-gray-400">
              Receive production-ready Playwright tests with execution results and insights
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;