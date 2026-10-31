import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const Pagination = ({
  currentPage = 1,
  totalItems = 0,
  pageSize = 10,
  onPageChange
}) => {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  if (totalItems <= pageSize) {
    return (
      <div className="flex items-center justify-between text-xs text-slate-500 py-3 px-4 border-t border-slate-100">
        <span>Showing {totalItems} total {totalItems === 1 ? 'record' : 'records'}</span>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between text-xs text-slate-500 py-3 px-4 border-t border-slate-100 select-none">
      <div>
        Showing <span className="font-medium text-slate-800">{startItem}</span> to{' '}
        <span className="font-medium text-slate-800">{endItem}</span> of{' '}
        <span className="font-medium text-slate-800">{totalItems}</span> results
      </div>
      <div className="flex items-center space-x-1.5">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="p-1 rounded border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          title="Previous Page"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div className="px-2 font-medium text-slate-700">
          Page {currentPage} of {totalPages}
        </div>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="p-1 rounded border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          title="Next Page"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

