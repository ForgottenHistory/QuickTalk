import React from 'react';
import { Button } from './Button';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage, totalPages, onPageChange, className = ''
}) => {
  if (totalPages <= 1) return null;

  return (
    <div className={`pagination ${className}`}>
      <Button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        variant="secondary"
      >
        ← Previous
      </Button>
      
      <span className="pagination-info">
        Page {currentPage} of {totalPages}
      </span>
      
      <Button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        variant="secondary"
      >
        Next →
      </Button>
    </div>
  );
};