import { type Table } from '@tanstack/react-table';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

import { Button } from '@owox/ui/components/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@owox/ui/components/select';
import { useEffect, useMemo } from 'react';

interface TablePaginationProps<TData> {
  table: Table<TData>;
  pageSizeOptions?: number[];
  displaySelected?: boolean;
  labels?: Partial<TablePaginationLabels>;
}

interface TablePaginationLabels {
  rowsPerPage: string;
  selectedRow: string;
  selectedRows: string;
  row: string;
  rows: string;
  of: string;
  firstPage: string;
  previousPage: string;
  nextPage: string;
  lastPage: string;
}

const DEFAULT_LABELS: TablePaginationLabels = {
  rowsPerPage: 'Rows per page',
  selectedRow: 'row selected',
  selectedRows: 'rows selected',
  row: 'row',
  rows: 'rows',
  of: 'of',
  firstPage: 'Go to first page',
  previousPage: 'Go to previous page',
  nextPage: 'Go to next page',
  lastPage: 'Go to last page',
};

const DEFAULT_PAGE_SIZE_OPTIONS = [15, 30, 50, 100, 200];

export function TablePagination<TData>({
  table,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
  displaySelected = true,
  labels,
}: TablePaginationProps<TData>) {
  const copy = { ...DEFAULT_LABELS, ...labels };
  const pageSizeResult = useMemo(() => {
    const result = pageSizeOptions.map(item => Math.round(item)).filter(item => item > 0);
    return result.length > 0 ? result : DEFAULT_PAGE_SIZE_OPTIONS;
  }, [pageSizeOptions]);

  useEffect(() => {
    const currentPageSize = table.getState().pagination.pageSize;
    const firstPageSize = pageSizeResult[0];
    if (firstPageSize && !pageSizeResult.includes(currentPageSize)) {
      table.setPageSize(firstPageSize);
    }
  }, [pageSizeResult, table]);
  const selectedCount = table.getSelectedRowModel().rows.length;
  const pageIndex = table.getState().pagination.pageIndex;
  const pageSize = table.getState().pagination.pageSize;
  const total = table.getFilteredRowModel().rows.length;

  const from = pageIndex * pageSize + 1;
  const to = Math.min(from + pageSize - 1, total);

  return (
    <div className='text-muted-foreground/75 flex items-center text-sm'>
      <div className='flex-1'>
        {displaySelected && selectedCount > 0 && (
          <span>
            {selectedCount} {selectedCount === 1 ? copy.selectedRow : copy.selectedRows}
          </span>
        )}
      </div>
      {total > 0 && (
        <>
          <div className='flex items-center space-x-6 lg:space-x-8'>
            <div className='flex items-center space-x-2'>
              <span>{copy.rowsPerPage}</span>
              <Select
                value={`${table.getState().pagination.pageSize}`}
                onValueChange={value => {
                  table.setPageSize(Number(value));
                }}
              >
                <SelectTrigger className='bg-background h-8 w-[74px]'>
                  <SelectValue placeholder={table.getState().pagination.pageSize} />
                </SelectTrigger>
                <SelectContent>
                  {pageSizeResult.map(pageSize => (
                    <SelectItem key={pageSize} value={`${pageSize}`}>
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className='flex items-center justify-center'>
              {from}–{to} {copy.of} {total} {total === 1 ? copy.row : copy.rows}
            </div>
            <div className='flex items-center space-x-1'>
              <Button
                variant='outline'
                size='icon'
                className='hidden size-8 lg:flex'
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                <span className='sr-only'>{copy.firstPage}</span>
                <ChevronsLeft />
              </Button>
              <Button
                variant='outline'
                size='icon'
                className='size-8'
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <span className='sr-only'>{copy.previousPage}</span>
                <ChevronLeft />
              </Button>
              <Button
                variant='outline'
                size='icon'
                className='size-8'
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <span className='sr-only'>{copy.nextPage}</span>
                <ChevronRight />
              </Button>
              <Button
                variant='outline'
                size='icon'
                className='hidden size-8 lg:flex'
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
              >
                <span className='sr-only'>{copy.lastPage}</span>
                <ChevronsRight />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
