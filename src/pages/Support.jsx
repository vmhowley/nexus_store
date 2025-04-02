import React from 'react';
import { LifeBuoy, MessageSquare, Phone, Mail } from 'lucide-react';

const supportChannels = [
  {
    icon: MessageSquare,
    title: "Live Chat",
    description: "Chat with our support team",
    action: "Start Chat"
  },
  {
    icon: Phone,
    title: "Phone Support",
    description: "Call us 24/7",
    action: "1-800-NEXUS"
  },
  {
    icon: Mail,
    title: "Email Support",
    description: "Get help via email",
    action: "Send Email"
  }
];

export default function Support() {
  return (
    <div className="pt-20 bg-gray-900 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <LifeBuoy className="h-16 w-16 text-lime-500 mx-auto mb-6" />
          <h1 className="text-4xl font-bold text-white mb-4">Support Center</h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Need help? Our support team is here for you 24/7.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {supportChannels.map((channel, index) => {
            const Icon = channel.icon;
            return (
              <div key={index} className="bg-gray-800 rounded-2xl p-8 border border-lime-500/20 hover:border-lime-500/40 transition-all">
                <Icon className="h-12 w-12 text-lime-500 mb-6" />
                <h3 className="text-xl font-bold text-white mb-3">{channel.title}</h3>
                <p className="text-gray-400 mb-6">{channel.description}</p>
                <button className="w-full bg-lime-500/10 hover:bg-lime-500/20 text-lime-500 py-2 rounded-lg transition-colors">
                  {channel.action}
                </button>
              </div>
            );
          })}
        </div>

        <div className="bg-gray-800 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {[
              "How do I track my order?",
              "What is your return policy?",
              "Do you offer international shipping?",
              "How long is the warranty?"
            ].map((question, index) => (
              <div key={index} className="border-b border-gray-700 pb-4">
                <button className="w-full text-left text-gray-300 hover:text-lime-500 transition-colors">
                  {question}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}