
import React from 'react';
import { motion } from 'framer-motion';
import { Play, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const ControlPanel = ({ isRunning, onToggleAutomation }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className="flex flex-col sm:flex-row gap-4 items-center justify-center"
  >
    <Button
      onClick={onToggleAutomation}
      size="lg"
      className={`px-8 py-4 text-lg font-semibold ${
        isRunning 
          ? 'bg-red-600 hover:bg-red-700' 
          : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700'
      }`}
    >
      {isRunning ? <Pause className="mr-2 h-5 w-5" /> : <Play className="mr-2 h-5 w-5" />}
      {isRunning ? 'Stop Automation' : 'Start Automation'}
    </Button>
    
    <Badge variant={isRunning ? "default" : "secondary"} className={`px-4 py-2 text-sm ${isRunning ? 'bg-green-600' : ''}`}>
      {isRunning ? '🟢 Active' : '🔴 Inactive'}
    </Badge>
  </motion.div>
);

export default ControlPanel;
