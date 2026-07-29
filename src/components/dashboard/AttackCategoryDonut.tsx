import React from 'react';
import { Card } from '../common/Card';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { MOCK_ATTACK_CATEGORIES } from '../../mock/analyticsData';

export const AttackCategoryDonut: React.FC = () => {
  return (
    <Card
      title="Attack Vector Categories"
      subtitle="Distribution of detected intrusion signatures over past 7 days"
    >
      <div className="h-48 w-full flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={MOCK_ATTACK_CATEGORIES}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={75}
              paddingAngle={4}
              dataKey="count"
              nameKey="category"
            >
              {MOCK_ATTACK_CATEGORIES.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} stroke="#0B0F19" strokeWidth={2} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: any, name: any) => [`${value} incidents`, String(name || 'Count')]}
              contentStyle={{ backgroundColor: '#0F172A', borderColor: '#1E293B', color: '#F8FAFC' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-2 space-y-1.5">
        {MOCK_ATTACK_CATEGORIES.map((item) => (
          <div key={item.category} className="flex items-center justify-between text-xs font-mono">
            <div className="flex items-center space-x-2 truncate">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
              <span className="text-slate-600 dark:text-slate-300 truncate">{item.category}</span>
            </div>
            <span className="font-semibold text-slate-900 dark:text-slate-100 pl-2">
              {item.percentage}%
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
};
