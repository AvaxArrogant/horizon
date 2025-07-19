import React from 'react';
import { motion } from 'framer-motion';

const DashboardHeader = () => (
  <motion.div
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    className="text-center space-y-4 py-8"
  >
    <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
      HyperfueledBlog Hub
    </h1>
    <p className="text-xl text-gray-300 max-w-3xl mx-auto">
      Transform Reddit content into engaging WordPress posts with AI-powered automation, SEO optimization, and monetization tracking
    </p>
  </motion.div>
);

export default DashboardHeader;