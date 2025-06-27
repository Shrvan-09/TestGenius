import React, { useState } from 'react';
import { Bot as TestBot, Code, Play, CheckCircle, XCircle, Clock, Zap, Globe, Shield } from 'lucide-react';
import TestGenerator from './components/TestGenerator';
import Hero from './components/Hero';
import Features from './components/Features';

function App() {
  const [showGenerator, setShowGenerator] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%239C92AC%22 fill-opacity=%220.05%22%3E%3Ccircle cx=%2230%22 cy=%2230%22 r=%221%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40"></div>
      
      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between p-6 max-w-7xl mx-auto">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl">
            <TestBot className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">TestGenius</h1>
            <p className="text-purple-300 text-sm">AI-Powered Testing Platform</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <button className="text-gray-300 hover:text-white transition-colors">
            Documentation
          </button>
          <button className="text-gray-300 hover:text-white transition-colors">
            Pricing
          </button>
          <button className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all transform hover:scale-105">
            Sign In
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative z-10">
        {!showGenerator ? (
          <>
            <Hero onGetStarted={() => setShowGenerator(true)} />
            <Features />
          </>
        ) : (
          <TestGenerator onBack={() => setShowGenerator(false)} />
        )}
      </div>

      {/* Footer */}
      {!showGenerator && (
        <footer className="relative z-10 mt-24 border-t border-gray-800 bg-slate-900/50 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-6 py-12">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="col-span-1 md:col-span-2">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl">
                    <TestBot className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white">TestGenius</h3>
                </div>
                <p className="text-gray-400 mb-4 max-w-md">
                  Transform your testing workflow with AI-powered test generation. 
                  Create comprehensive Playwright test suites in seconds.
                </p>
                <div className="flex space-x-4">
                  <div className="flex items-center text-sm text-gray-400">
                    <Shield className="h-4 w-4 mr-2" />
                    Enterprise Security
                  </div>
                  <div className="flex items-center text-sm text-gray-400">
                    <Globe className="h-4 w-4 mr-2" />
                    Global CDN
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="text-white font-semibold mb-4">Platform</h4>
                <ul className="space-y-2 text-gray-400">
                  <li><a href="#" className="hover:text-white transition-colors">Test Generator</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">API Documentation</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Integrations</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Status Page</a></li>
                </ul>
              </div>
              
              <div>
                <h4 className="text-white font-semibold mb-4">Support</h4>
                <ul className="space-y-2 text-gray-400">
                  <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Community</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">System Status</a></li>
                </ul>
              </div>
            </div>
            
            <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 text-sm">
                © 2025 TestGenius. All rights reserved.
              </p>
              <div className="flex space-x-6 mt-4 md:mt-0 text-sm text-gray-400">
                <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                <a href="#" className="hover:text-white transition-colors">Cookie Policy</a>
              </div>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}

export default App;