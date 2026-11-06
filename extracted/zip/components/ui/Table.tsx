// components/ui/Table.tsx
import React from "react";

interface TableProps {
  headers: string[];
  children: React.ReactNode;
  emptyMessage?: string;
  isEmpty?: boolean;
}

export function Table({ headers, children, emptyMessage = "No records found.", isEmpty = false }: TableProps) {
  return (
    <div className="w-full overflow-x-auto border border-zinc-200 rounded-lg bg-white shadow-xs">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-zinc-200 bg-zinc-50/75">
            {headers.map((header, index) => (
              <th key={index} className="px-4 py-3 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100 text-xs text-zinc-700">
          {isEmpty ? (
            <tr>
              <td colSpan={headers.length} className="px-4 py-8 text-center text-zinc-500">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            children
          )}
        </tbody>
      </table>
    </div>
  );
}