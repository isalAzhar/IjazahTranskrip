import React from 'react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from 'recharts';

// Data dummy yang disesuaikan secara visual agar mirip dengan grafik di gambar
const data = [
  { name: 'Jan', y2024: 45, y2025: 30, y2026: 70 },
  { name: 'Feb', y2024: 65, y2025: 55, y2026: 45 },
  { name: 'Mar', y2024: 25, y2025: 45, y2026: 35 },
  { name: 'Apr', y2024: 75, y2025: 50, y2026: 65 },
  { name: 'Mei', y2024: 70, y2025: 85, y2026: 80 },
  { name: 'Jun', y2024: 55, y2025: 60, y2026: 45 },
  { name: 'Jul', y2024: 70, y2025: 45, y2026: 60 },
  { name: 'Ags', y2024: 65, y2025: 55, y2026: 85 },
  { name: 'Sep', y2024: 30, y2025: 50, y2026: 40 },
  { name: 'Okt', y2024: 45, y2025: 35, y2026: 55 },
  { name: 'Nov', y2024: 80, y2025: 70, y2026: 75 },
  { name: 'Des', y2024: 65, y2025: 70, y2026: 75 },
];

const IssuanceChart = () => (
  <div className="w-full flex flex-col h-full mt-4">
    {/* Kontainer Chart */}
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        {/* barGap={0} digunakan agar bar saling berdempetan persis seperti di desain */}
        <BarChart data={data} barGap={0} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
          
          {/* Sumbu X (Bulan) */}
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tick={{fontSize: 13, fill: '#9ca3af', fontWeight: 500}} 
            dy={10} 
          />
          
          {/* Sumbu Y dan CartesianGrid Sengaja dihilangkan agar latar belakang bersih seperti desain */}

          <Tooltip 
            cursor={{fill: '#f3f4f6'}} 
            contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} 
          />
          
          {/* Warna dari kode kedua (Earth Tone) */}
          <Bar dataKey="y2024" name="2024" fill="#F4CC70" barSize={16} />
          <Bar dataKey="y2025" name="2025" fill="#DE7A22" barSize={16} />
          <Bar dataKey="y2026" name="2026" fill="#6AB187" barSize={16} />
          
        </BarChart>
      </ResponsiveContainer>
    </div>
    
    {/* Custom Legend - Warna dari kode kedua */}
    <div className="flex justify-center gap-3 mt-6">
      <div className="px-4 py-1.5 bg-[#F4CC70] text-black text-xs font-bold rounded-md shadow-sm">
        Tahun 2024
      </div>
      <div className="px-4 py-1.5 bg-[#DE7A22] text-white text-xs font-bold rounded-md shadow-sm">
        Tahun 2025
      </div>
      <div className="px-4 py-1.5 bg-[#6AB187] text-white text-xs font-bold rounded-md shadow-sm">
        Tahun 2026
      </div>
    </div>
  </div>
);

export default IssuanceChart;