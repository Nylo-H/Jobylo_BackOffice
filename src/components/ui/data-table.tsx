import { motion } from 'framer-motion';
import { ChevronDown, ChevronUp, ChevronsUpDown } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useState } from 'react';

export interface Column<T> {
  accessorKey?: string;
  id?: string;
  header: string;
  cell?: (props: { row: { original: T } }) => React.ReactNode;
  enableSorting?: boolean;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  onRowClick?: (row: T) => void;
}

export function DataTable<T extends { id: string }>({
  columns,
  data,
  isLoading,
  onRowClick,
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const sortedData = [...data].sort((a: any, b: any) => {
    if (!sortKey) return 0;
    const aVal = a[sortKey];
    const bVal = b[sortKey];
    if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border">
            {columns.map((col) => (
              <th
                key={col.id || col.accessorKey}
                className={cn(
                  'text-left text-xs font-medium text-text-secondary uppercase tracking-wider px-4 py-3',
                  col.enableSorting && 'cursor-pointer hover:text-text-primary select-none'
                )}
                onClick={() => col.enableSorting && col.accessorKey && handleSort(col.accessorKey)}
              >
                <div className="flex items-center gap-1">
                  {col.header}
                  {col.enableSorting && (
                    <span className="text-text-hint">
                      {sortKey === col.accessorKey ? (
                        sortDir === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                      ) : (
                        <ChevronsUpDown size={14} />
                      )}
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <motion.tbody
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.03 } },
          }}
          initial="hidden"
          animate="show"
        >
          {sortedData.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="text-center py-16 text-text-secondary">
                Aucune donnée disponible
              </td>
            </tr>
          ) : (
            sortedData.map((row) => (
              <motion.tr
                key={row.id}
                variants={{
                  hidden: { opacity: 0, y: 10 },
                  show: { opacity: 1, y: 0 },
                }}
                className={cn(
                  'border-b border-border-light hover:bg-surface-variant transition-colors',
                  onRowClick && 'cursor-pointer'
                )}
                onClick={() => onRowClick?.(row)}
              >
                {columns.map((col) => (
                  <td key={col.id || col.accessorKey} className="px-4 py-3 text-sm">
                    {col.cell
                      ? col.cell({ row: { original: row } })
                      : col.accessorKey
                      ? (row as any)[col.accessorKey]
                      : null}
                  </td>
                ))}
              </motion.tr>
            ))
          )}
        </motion.tbody>
      </table>
    </div>
  );
}