import React from 'react';
import { motion } from 'framer-motion';
import { Rss, Upload, DollarSign, RefreshCw } from 'lucide-react';
import { Card } from '@/components/ui/card';

const StatCard = ({ title, value, icon: Icon, iconColor, gradient }) => (
  <Card className={`p-6 ${gradient} border-purple-500/20`}>
    <div className="flex items-center justify-between">
      <div>
        <p className={`text-sm text-${iconColor}-200`}>{title}</p>
        <p className="text-3xl font-bold text-white">{value}</p>
      </div>
      <Icon className={`h-8 w-8 text-${iconColor}-400`} />
    </div>
  </Card>
);

const StatsDashboard = ({ stats, onRefresh }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.2 }}
    className="grid grid-cols-1 md:grid-cols-4 gap-6"
  >
    <StatCard title="Total Posts" value={stats.totalPosts} icon={Rss} iconColor="purple" gradient="bg-gradient-to-br from-purple-800/50 to-purple-900/50" />
    <StatCard title="Published Today" value={stats.publishedToday} icon={Upload} iconColor="blue" gradient="bg-gradient-to-br from-blue-800/50 to-blue-900/50" />
    <StatCard title="Revenue (Simulated)" value={`$${stats.totalRevenue}`} icon={DollarSign} iconColor="green" gradient="bg-gradient-to-br from-green-800/50 to-green-900/50" />
    <Card className="p-6 bg-gradient-to-br from-orange-800/50 to-orange-900/50 border-orange-500/20">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-orange-200 text-sm">Avg CTR (Simulated)</p>
          <p className="text-3xl font-bold text-white">{stats.avgCtr}%</p>
        </div>
        <RefreshCw 
          className="h-8 w-8 text-orange-400 cursor-pointer hover:rotate-180 transition-transform duration-500" 
          onClick={onRefresh}
        />
      </div>
    </Card>
  </motion.div>
);

export default StatsDashboard;