import React from 'react';
import { ChevronRight } from 'lucide-react';

export default function Hero() {
  return (
    <div className="relative bg-dark min-h-screen flex items-center overflow-hidden">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=2072')] bg-cover bg-center opacity-10"></div>
      <div className="absolute inset-0 bg-linear-to-br from-primary/50 to-transparent"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-5xl lg:text-7xl font-bold">
              <span className="text-light">Next-Gen</span>
              <span className="block mt-2 bg-linear-to-br from-primary to-secondary via-accent  bg-clip-text text-transparent">
                Computing
              </span>
            </h1>
            <p className="mt-6 text-accent text-lg leading-relaxed">
              Experience unparalleled performance with our cutting-edge
              workstations and gaming rigs. Built for professionals, designed
              for excellence.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <button className="px-8 py-4 bg-primary shadow-md hover:bg-secondary hover:text-light text-dark rounded-full font-medium flex items-center justify-center group transition-all">
                Configure Your Build
                <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="px-8 py-4 border shadow-md border-secondary/30  hover:text-accent text-light hover:bg-secondary/10 rounded-full font-medium transition-colors">
                View Showcase
              </button>
            </div>
          </div>

          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1623126908029-58cb08a2b272?auto=format&fit=crop&q=80&w=1000"
              alt="Premium Gaming PC"
              className="rounded-2xl shadow-2xl shadow-primary/20 hover:shadow-secondary/30 transition-shadow"
            />
            <div className="absolute -bottom-4 left-4 right-4 bg-light/80 backdrop-blur-xs rounded-xl p-4 border border-lime-500/20">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-dark font-semibold">NEXUS TITAN PRO</h3>
                  <p className="text-dark text-sm">
                    RTX 4090 • i9-13900K • 64GB RAM
                  </p>
                </div>
                <span className="text-dark hover:text-primary font-bold">$1,499</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}