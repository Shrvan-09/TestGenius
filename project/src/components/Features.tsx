import React from 'react';
import { 
  Zap, Shield, Globe, Code, BarChart3, 
  Smartphone, Monitor, Layers, CheckCircle2,
  ArrowRight, Sparkles
} from 'lucide-react';

interface FeaturesProps {
  onStartNow?: () => void;
}

const Features: React.FC<FeaturesProps> = ({ onStartNow }) => {
  const features = [
    {
      icon: Zap,
      title: 'Lightning Fast Generation',
      description: 'Generate comprehensive test suites in under 30 seconds with our optimized AI engine.',
      color: 'from-yellow-500 to-orange-500'
    },
    {
      icon: Code,
      title: 'Multi-Language Support',
      description: 'Support for JavaScript and Python Playwright tests with more languages coming soon.',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Shield,
      title: 'Enterprise Security',
      description: 'Bank-level security with SOC 2 compliance and end-to-end encryption.',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: Globe,
      title: 'Global CDN',
      description: 'Test execution powered by global infrastructure for consistent performance worldwide.',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: Smartphone,
      title: 'Responsive Testing',
      description: 'Automatically generate tests for mobile, tablet, and desktop viewports.',
      color: 'from-indigo-500 to-purple-500'
    },
    {
      icon: BarChart3,
      title: 'Advanced Analytics',
      description: 'Detailed test execution reports with performance metrics and insights.',
      color: 'from-red-500 to-pink-500'
    }
  ];

  const testTypes = [
    {
      name: 'Basic Interactions',
      description: 'Navigation, clicks, form filling, and basic user flows',
      icon: Monitor,
      features: ['Page loading', 'Link navigation', 'Button interactions', 'Form validation']
    },
    {
      name: 'Form Testing',
      description: 'Comprehensive form validation and submission testing',
      icon: Layers,
      features: ['Input validation', 'Error handling', 'Submission flows', 'Dynamic forms']
    },
    {
      name: 'Responsive Design',
      description: 'Cross-device compatibility and responsive behavior',
      icon: Smartphone,
      features: ['Mobile viewport', 'Tablet testing', 'Desktop layouts', 'Touch interactions']
    },
    {
      name: 'Comprehensive Suite',
      description: 'Full-scale testing including edge cases and performance',
      icon: CheckCircle2,
      features: ['Error scenarios', 'Performance tests', 'Accessibility', 'Cross-browser']
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-20">
      {/* Features Grid */}
      <div className="text-center mb-16">
        <div className="inline-flex items-center px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-300 text-sm mb-8 backdrop-blur-sm">
          <Sparkles className="h-4 w-4 mr-2" />
          Platform Features
        </div>
        <h2 className="text-4xl font-bold text-white mb-4">
          Everything You Need for Modern Testing
        </h2>
        <p className="text-xl text-gray-400 max-w-3xl mx-auto">
          Built for developers, designed for scale. Our platform provides all the tools 
          you need to create, execute, and maintain robust test suites.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
        {features.map((feature, index) => (
          <div 
            key={index}
            className="group p-8 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl hover:bg-white/10 transition-all duration-300 hover:scale-105"
          >
            <div className={`w-12 h-12 bg-gradient-to-r ${feature.color} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
              <feature.icon className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-purple-300 transition-colors">
              {feature.title}
            </h3>
            <p className="text-gray-400 leading-relaxed">
              {feature.description}
            </p>
          </div>
        ))}
      </div>

      {/* Test Types */}
      <div className="text-center mb-16">
        <h2 className="text-4xl font-bold text-white mb-4">
          Intelligent Test Generation
        </h2>
        <p className="text-xl text-gray-400 max-w-3xl mx-auto">
          Choose from different test types based on your specific needs. 
          Our AI adapts to generate the most relevant tests for your application.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {testTypes.map((type, index) => (
          <div 
            key={index}
            className="p-8 bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm border border-white/10 rounded-2xl hover:from-white/10 hover:to-white/15 transition-all duration-300"
          >
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl">
                <type.icon className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-white mb-2">{type.name}</h3>
                <p className="text-gray-400 mb-4">{type.description}</p>
                <div className="grid grid-cols-2 gap-2">
                  {type.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center space-x-2 text-sm text-gray-300">
                      <CheckCircle2 className="h-4 w-4 text-green-400" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CTA Section */}
      <div className="mt-20 text-center p-12 bg-gradient-to-r from-purple-900/50 to-blue-900/50 backdrop-blur-sm border border-purple-500/20 rounded-3xl">
        <h2 className="text-3xl font-bold text-white mb-4">
          Ready to Transform Your Testing?
        </h2>
        <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
          Join thousands of developers who have already streamlined their testing workflow with TestGenius.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            className="group px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-blue-700 transition-all transform hover:scale-105 shadow-2xl shadow-purple-500/25 flex items-center justify-center"
            onClick={onStartNow}
          >
            Start Now
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </button>
          
        </div>
      </div>
    </div>
  );
};

export default Features;