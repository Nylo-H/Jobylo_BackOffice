import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const data = [
  { month: 'Jan', jobs: 65 },
  { month: 'Fév', jobs: 78 },
  { month: 'Mar', jobs: 90 },
  { month: 'Avr', jobs: 81 },
  { month: 'Mai', jobs: 110 },
  { month: 'Juin', jobs: 95 },
  { month: 'Juil', jobs: 120 },
  { month: 'Août', jobs: 105 },
  { month: 'Sep', jobs: 130 },
  { month: 'Oct', jobs: 115 },
  { month: 'Nov', jobs: 140 },
  { month: 'Déc', jobs: 125 },
];

export function JobsChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">📈 Missions par mois</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="month" stroke="#6B7280" fontSize={12} />
              <YAxis stroke="#6B7280" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="jobs" fill="#0D47A1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}