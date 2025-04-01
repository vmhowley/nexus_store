import React from 'react';
import { Compass, Laptop, Monitor, Cpu } from 'lucide-react';

const categories = [
  {
    icon: Laptop,
    title: "Gaming PCs",
    description: "High-performance gaming rigs built for victory"
  },
  {
    icon: Monitor,
    title: "Workstations",
    description: "Professional workstations for demanding tasks"
  },
  {
    icon: Cpu,
    title: "Custom Builds",
    description: "Tailor-made systems to your exact specifications"
  }
];

export default function Discover() {
  return (
    <div className="pt-20 bg-gray-900 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <Compass className="h-16 w-16 text-purple-500 mx-auto mb-6" />
          <h1 className="text-4xl font-bold text-white mb-4">Discover Our Range</h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Explore our comprehensive collection of high-performance computing solutions designed for every need.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {categories.map((category, index) => {
            const Icon = category.icon;
            return (
              <div key={index} className="bg-gray-800 rounded-2xl p-8 border border-purple-500/20 hover:border-purple-500/40 transition-all">
                <Icon className="h-12 w-12 text-purple-500 mb-6" />
                <h3 className="text-xl font-bold text-white mb-3">{category.title}</h3>
                <p className="text-gray-400 mb-6">{category.description}</p>
                <button className="w-full bg-purple-500/10 hover:bg-purple-500/20 text-purple-500 py-2 rounded-lg transition-colors">
                  Learn More
                </button>
              </div>
            );
          })}
        </div>

        <div className="bg-gray-800 rounded-2xl p-8 border border-purple-500/20">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl font-bold text-white mb-4">Need Help Choosing?</h2>
              <p className="text-gray-400 mb-6">
                Our expert team is here to help you find the perfect system for your needs. Schedule a free consultation today.
              </p>
              <button className="bg-purple-500 hover:bg-purple-600 text-white px-8 py-3 rounded-lg transition-colors">
                Book Consultation
              </button>
            </div>
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1560264280-88b68371db39?auto=format&fit=crop&q=80&w=800"
                alt="Tech consultation"
                className="rounded-lg shadow-xl"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}