import React from 'react';
import { Building2, Server, Shield, Users } from 'lucide-react';

const solutions = [
  {
    icon: Server,
    title: "Server Solutions",
    description: "Custom server configurations for your business needs"
  },
  {
    icon: Shield,
    title: "Security Systems",
    description: "Enterprise-grade security infrastructure"
  },
  {
    icon: Users,
    title: "Workstation Fleets",
    description: "Bulk workstation deployment and management"
  }
];

export default function Enterprise() {
  return (
    <div className="pt-20 bg-dark min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <Building2 className="h-16 w-16 text-primary mx-auto mb-6" />
          <h1 className="text-4xl font-bold text-light mb-4">Enterprise Solutions</h1>
          <p className="text-accent max-w-2xl mx-auto">
            Comprehensive computing solutions designed for business and enterprise deployment.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {solutions.map((solution, index) => {
            const Icon = solution.icon;
            return (
              <div key={index} className="bg-light rounded-2xl p-8 border border-lime-500/20">
                <Icon className="h-12 w-12 text-primary mb-6" />
                <h3 className="text-xl font-bold text-dark mb-3">{solution.title}</h3>
                <p className="text-dark">{solution.description}</p>
              </div>
            );
          })}
        </div>

        <div className="bg-linear-to-r from-primary/50 to-secodary/50 rounded-2xl p-12 text-center">
          <h2 className="text-3xl font-bold text-light mb-6">Ready to Scale Your Business?</h2>
          <p className="text-accent max-w-2xl mx-auto mb-8">
            Let our enterprise team help you design the perfect solution for your organization's needs.
          </p>
          <button className="bg-white text-lime-900 px-8 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors">
            Contact Enterprise Sales
          </button>
        </div>
      </div>
    </div>
  );
}