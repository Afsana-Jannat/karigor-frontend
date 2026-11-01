// src/features/admin/components/admin-table.tsx

import * as React from 'react';
import { LoaderCircle } from 'lucide-react';

interface Column<T> {
  header: string;
  accessorKey?: keyof T;
  cell?: (item: T) => React.ReactNode;
}

interface AdminTableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  emptyMessage?: string;
  onRowClick?: (item: T) => void;
}

export function AdminTable<T extends { id?: string }>({
  columns,
  data,
  isLoading,
  emptyMessage = 'কোনো ডেটা পাওয়া যায়নি',
  onRowClick,
}: AdminTableProps<T>) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16 bg-white rounded-2xl border border-slate-100 shadow-sm">
        <LoaderCircle className="h-8 w-8 animate-spin text-brand" />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-2xl border border-slate-100 shadow-sm">
        <p className="text-sm font-semibold text-slate-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50">
              {columns.map((col, colIndex) => (
                <th key={colIndex} className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map((item, rowIndex) => (
              <tr
                key={item.id || rowIndex} // <-- ইউনিক কি প্রপ নিশ্চিত করা হলো
                onClick={() => onRowClick?.(item)}
                className={`transition ${onRowClick ? 'cursor-pointer hover:bg-slate-50/80' : ''}`}
              >
                {columns.map((col, colIndex) => (
                  <td key={colIndex} className="px-6 py-4 text-sm text-slate-700 whitespace-nowrap">
                    {col.cell ? col.cell(item) : col.accessorKey ? String(item[col.accessorKey] ?? '') : null}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}