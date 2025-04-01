import React from 'react';
import { Shield, Cpu, Wrench, Headphones } from 'lucide-react';

const features = [
  {
    icon: Cpu,
    title: "Custom Builds",
    description: "Every system is custom-built to your exact specifications"
  },
  {
    icon: Shield,
    title: "3-Year Warranty",
    description: "Complete coverage with our premium warranty service"
  },
  {
    icon: Wrench,
    title: "Lifetime Support",
    description: "Free lifetime technical support and maintenance"
  },
  {
    icon: Headphones,
    title: "24/7 Assistance",
    description: "Round-the-clock expert technical consultation"
  }
];

export default function Features() {
  return (
    <div className="bg-gray-800 py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-purple-500/5 backdrop-blur-3xl"></div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={index} className="bg-gray-900/50 backdrop-blur-lg rounded-2xl p-8 border border-purple-500/20">
                <div className="inline-flex p-3 rounded-lg bg-purple-500/10 mb-6">
                  <Icon className="h-7 w-7 text-purple-500" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}