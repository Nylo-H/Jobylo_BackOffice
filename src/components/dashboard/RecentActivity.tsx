import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { formatRelativeDate } from '../../lib/utils';
import type { ActionLog } from '../../types/audit';

interface RecentActivityProps {
  logs: ActionLog[];
}

const ACTION_EMOJIS: Record<string, string> = {
  REGISTER: '👤',
  LOGIN: '🔑',
  KYC_SUBMITTED: '📄',
  KYC_APPROVED: '✅',
  KYC_REJECTED: '❌',
  PAYMENT_INITIATED: '💳',
  PAYMENT_CONFIRMED: '✓',
  SUBMIT_RATING: '⭐',
  CREATE_JOB: '📋',
  ASSIGN_JOB: '👥',
  COMPLETE_JOB: '🏁',
  SEND_MESSAGE: '💬',
};

export function RecentActivity({ logs }: RecentActivityProps) {
  const recentLogs = logs.slice(0, 8);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">🕐 Activité récente</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentLogs.map((log) => (
            <div key={log.id} className="flex items-start gap-3">
              <div className="text-lg">
                {ACTION_EMOJIS[log.action] || '📌'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary truncate">
                  {log.user?.username || 'Utilisateur'}
                </p>
                <p className="text-xs text-text-secondary truncate">
                  {log.details}
                </p>
              </div>
              <span className="text-xs text-text-hint whitespace-nowrap">
                {formatRelativeDate(log.timestamp)}
              </span>
            </div>
          ))}
          {recentLogs.length === 0 && (
            <p className="text-sm text-text-secondary text-center py-4">
              Aucune activité récente
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}