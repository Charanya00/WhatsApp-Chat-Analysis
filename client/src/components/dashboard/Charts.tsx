import { useMemo } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend, PieChart, Pie, Cell
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { 
  type TimelineData, 
  type UserStats, 
  type SentimentTrend,
  type ActivityData
} from '@shared/schema';

const CHART_COLORS = {
  primary: 'hsl(var(--primary))',
  accent: 'hsl(var(--accent))',
  pink: 'hsl(var(--chart-3))',
  amber: 'hsl(var(--chart-4))',
  cyan: 'hsl(var(--chart-5))',
};

const PIE_COLORS = [CHART_COLORS.primary, CHART_COLORS.accent, CHART_COLORS.amber, CHART_COLORS.pink, CHART_COLORS.cyan];

export function TimelineAreaChart({ data }: { data: TimelineData[] }) {
  // Format dates for better display if needed
  const formattedData = useMemo(() => {
    return data.map(d => ({
      ...d,
      displayDate: d.date.length > 10 ? format(parseISO(d.date), 'MMM d, yy') : d.date,
    }));
  }, [data]);

  return (
    <div className="h-[350px] w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={formattedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorMessages" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={CHART_COLORS.primary} stopOpacity={0.3}/>
              <stop offset="95%" stopColor={CHART_COLORS.primary} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
          <XAxis 
            dataKey="displayDate" 
            stroke="hsl(var(--muted-foreground))" 
            fontSize={12} 
            tickLine={false}
            axisLine={false}
            minTickGap={30}
          />
          <YAxis 
            stroke="hsl(var(--muted-foreground))" 
            fontSize={12} 
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${value}`}
          />
          <Tooltip
            contentStyle={{ 
              backgroundColor: 'hsl(var(--card))', 
              borderColor: 'hsl(var(--border))',
              borderRadius: '0.75rem',
              boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
              color: 'hsl(var(--foreground))'
            }}
            itemStyle={{ color: 'hsl(var(--foreground))' }}
          />
          <Area 
            type="monotone" 
            dataKey="messageCount" 
            name="Messages"
            stroke={CHART_COLORS.primary} 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorMessages)" 
            activeDot={{ r: 6, fill: CHART_COLORS.primary, stroke: 'hsl(var(--background))', strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function UserActivityBarChart({ data }: { data: UserStats[] }) {
  // Sort by message count descending and take top 10
  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => b.messageCount - a.messageCount).slice(0, 10);
  }, [data]);

  return (
    <div className="h-[350px] w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={sortedData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={true} vertical={false} />
          <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} hide />
          <YAxis 
            dataKey="sender" 
            type="category" 
            stroke="hsl(var(--foreground))" 
            fontSize={12} 
            tickLine={false}
            axisLine={false}
            width={100}
            tickFormatter={(val) => val.length > 12 ? val.substring(0, 10) + '...' : val}
          />
          <Tooltip
            cursor={{ fill: 'hsl(var(--muted))', opacity: 0.4 }}
            contentStyle={{ 
              backgroundColor: 'hsl(var(--card))', 
              borderColor: 'hsl(var(--border))',
              borderRadius: '0.75rem'
            }}
          />
          <Bar 
            dataKey="messageCount" 
            name="Messages" 
            fill={CHART_COLORS.accent} 
            radius={[0, 4, 4, 0]} 
            barSize={24}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function SentimentPieChart({ data }: { data: SentimentTrend[] }) {
  // Aggregate overall sentiment from trend
  const aggregated = useMemo(() => {
    let pos = 0, neg = 0, neu = 0;
    data.forEach(d => {
      pos += d.positive;
      neg += d.negative;
      neu += d.neutral;
    });
    return [
      { name: 'Positive', value: pos },
      { name: 'Neutral', value: neu },
      { name: 'Negative', value: neg },
    ];
  }, [data]);

  const COLORS = [CHART_COLORS.primary, CHART_COLORS.amber, CHART_COLORS.pink];

  return (
    <div className="h-[300px] w-full mt-4 flex justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={aggregated}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={5}
            dataKey="value"
            stroke="none"
          >
            {aggregated.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'hsl(var(--card))', 
              borderColor: 'hsl(var(--border))',
              borderRadius: '0.75rem'
            }}
          />
          <Legend verticalAlign="bottom" height={36} iconType="circle" />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export function DayOfWeekChart({ data }: { data: ActivityData[] }) {
  // Ensure correct ordering of days
  const daysOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => daysOrder.indexOf(a.dayOfWeek) - daysOrder.indexOf(b.dayOfWeek));
  }, [data]);

  return (
    <div className="h-[250px] w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={sortedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
          <XAxis 
            dataKey="dayOfWeek" 
            stroke="hsl(var(--muted-foreground))" 
            fontSize={11} 
            tickLine={false}
            axisLine={false}
            tickFormatter={(val) => val.substring(0, 3)}
          />
          <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
          <Tooltip
            cursor={{ fill: 'hsl(var(--muted))', opacity: 0.4 }}
            contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '0.5rem', border: 'none' }}
          />
          <Bar dataKey="count" name="Messages" fill={CHART_COLORS.cyan} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
