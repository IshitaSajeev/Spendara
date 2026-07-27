import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { motion } from 'framer-motion';
import { PieChart as PieIcon } from 'lucide-react';

const COLORS = ['#3b82f6', '#6366f1', '#22c55e', '#f59e0b', '#ec4899', '#14b8a6', '#a855f7', '#ef4444'];

const CategoryChart = ({ data }) => {
  const hasData = data && data.length > 0;

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.15 }}
      className="bg-slate-900/40 rounded-[2.5rem] border border-slate-800 backdrop-blur-xl p-8"
    >
      <div className="flex items-center gap-2 mb-6">
        <PieIcon size={18} className="text-blue-500" />
        <h3 className="text-xl font-bold text-white">Spending by Category</h3>
      </div>

      {hasData ? (
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie
              data={data}
              dataKey="total"
              nameKey="category"
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={3}
            >
              {data.map((_, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} stroke="none" />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => `₹${Number(value).toLocaleString()}`}
              contentStyle={{
                background: '#0f172a',
                border: '1px solid #1e293b',
                borderRadius: '12px',
                color: '#e2e8f0',
              }}
            />
            <Legend
              verticalAlign="bottom"
              iconType="circle"
              wrapperStyle={{ fontSize: '12px', color: '#94a3b8' }}
            />
          </PieChart>
        </ResponsiveContainer>
      ) : (
        <div className="h-[280px] flex items-center justify-center text-slate-600 text-sm">
          Add some expenses to see your breakdown here.
        </div>
      )}
    </motion.div>
  );
};

export default CategoryChart;
