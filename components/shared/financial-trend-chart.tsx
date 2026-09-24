"use client";

import React from "react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";

const data = [
  { name: "1 Jul", income: 4000, expense: 2400 },
  { name: "5 Jul", income: 3000, expense: 1398 },
  { name: "10 Jul", income: 2000, expense: 9800 },
  { name: "15 Jul", income: 2780, expense: 3908 },
  { name: "20 Jul", income: 1890, expense: 4800 },
  { name: "25 Jul", income: 2390, expense: 3800 },
  { name: "31 Jul", income: 3490, expense: 4300 },
];

export function FinancialTrendChart() {
  return (
    <div className="bg-canvas border border-hairline rounded-[24px] md:rounded-[32px] p-4 sm:p-8 w-full max-w-full min-w-0 overflow-hidden h-[340px]">
      <div className="mb-4 sm:mb-6">
        <h3 className="font-semibold text-ink text-[18px] sm:text-[22px] truncate">Tren Keuangan</h3>
        <p className="text-mute text-xs sm:text-[14px]">Pemasukan vs Pengeluaran</p>
      </div>
      <div className="h-[210px] w-full min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#e60023" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#e60023" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e5e0" />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#91918c', fontSize: 12 }} 
              dy={10} 
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#91918c', fontSize: 12 }} 
              tickFormatter={(value) => `Rp${value / 1000}k`}
            />
            <Tooltip 
              contentStyle={{ borderRadius: '16px', border: '1px solid #dadad3', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
              itemStyle={{ fontWeight: 'bold' }}
            />
            <Area 
              type="monotone" 
              dataKey="income" 
              name="Pemasukan"
              stroke="#10b981" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorIncome)" 
            />
            <Area 
              type="monotone" 
              dataKey="expense" 
              name="Pengeluaran"
              stroke="#e60023" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorExpense)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
