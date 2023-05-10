import { Fragment, useEffect, useState } from 'react';

import { getCoreRowModel, useReactTable, createColumnHelper } from '@tanstack/react-table';

import type { ColumnDef, Row, Table as ReactTable, PaginationState } from '@tanstack/react-table';

import {
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/outline';

interface IconButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
}

const IconButton = ({ children, onClick, disabled, className }: IconButtonProps) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className={`inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-800 hover:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
      disabled ? 'cursor-not-allowed opacity-50' : ''
    } ${className}`}
  >
    {children}
  </button>
);

interface ReactTableProps<T extends object> {
  data: T[];
  columns: object[];
  renderSubComponent?: (props: { row: Row<T> }) => React.ReactElement;
  pageIndex?: number;
  pageSize?: number;
  pageCount?: number;
  onPaginationChange?: (pagination: PaginationState) => void;
  className?: string;
  loading?: boolean;
}

function Table<T extends object>({
  data,
  columns,
  renderSubComponent,
  pageIndex,
  pageSize,
  pageCount,
  onPaginationChange,
  loading,
  className = '',
}: ReactTableProps<T>) {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: pageIndex ?? 0,
    pageSize: pageSize ?? 15,
  });

  const table = useReactTable({
    data,
    columns: columns as ColumnDef<T>[],
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount,
    state: {
      pagination,
    },
    onPaginationChange: setPagination,
  });

  useEffect(() => {
    if (onPaginationChange) {
      onPaginationChange(pagination);
    }
  }, [pagination, onPaginationChange]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const flexRender = (column: any, context: any) => {
    if (typeof column === 'function') {
      return column(context);
    }
    return column;
  };

  if (loading) {
    return (
      <div className="mt-3 flex w-full flex-col gap-3">
        <div className="h-10 w-full animate-pulse rounded-md bg-gray-200"></div>
        <div className="h-10 w-full animate-pulse rounded-md bg-gray-200"></div>
        <div className="h-10 w-full animate-pulse rounded-md bg-gray-200"></div>
        <div className="h-10 w-full animate-pulse rounded-md bg-gray-200"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full py-1">
          <div className="overflow-hidden rounded-lg border border-gray-200 bg-white p-1 ">
            <table className={'Table min-w-full divide-y divide-gray-200 ' + className}>
              <thead className="bg-gray-50">
                {table.getHeaderGroups().map((headerGroup, i) => (
                  <tr key={i}>
                    {headerGroup.headers.map((header, index) => (
                      <th
                        key={index}
                        className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                      >
                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>

              <tbody className="divide-y divide-gray-200 bg-white">
                {!Boolean(loading) &&
                  table.getRowModel().rows.map((row, i) => (
                    <Fragment key={i}>
                      <tr className={`transition-colors ${row.getIsExpanded() ? 'bg-gray-50' : ''}`}>
                        {row.getVisibleCells().map((cell, index) => (
                          <td
                            style={{
                              width: cell.column.getSize(),
                            }}
                            key={index}
                            className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-500"
                          >
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </td>
                        ))}
                      </tr>

                      {renderSubComponent ? (
                        <tr key={i + '-expanded'}>
                          <td
                            colSpan={columns.length}
                            className="px-6 py-4 text-xs font-medium uppercase tracking-wider text-gray-500"
                          >
                            {renderSubComponent({ row })}
                          </td>
                        </tr>
                      ) : null}
                    </Fragment>
                  ))}
              </tbody>
            </table>
          </div>

          {Boolean(pageSize) && (
            <div className="mx-auto mt-5">
              <Pagination table={table} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
function Pagination<T>({
  table,
}: React.PropsWithChildren<{
  table: ReactTable<T>;
}>) {
  return (
    <div className="flex items-center gap-2">
      <IconButton onClick={() => table.setPageIndex(0)} disabled={!table.getCanPreviousPage()}>
        <ChevronDoubleLeftIcon className={'h-5'} />
      </IconButton>

      <IconButton onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
        <ChevronLeftIcon className={'h-5'} />
      </IconButton>

      <IconButton onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
        <ChevronRightIcon className={'h-5'} />
      </IconButton>

      <IconButton onClick={() => table.setPageIndex(table.getPageCount() - 1)} disabled={!table.getCanNextPage()}>
        <ChevronDoubleRightIcon className={'h-5'} />
      </IconButton>

      <span className="flex items-center gap-1 text-sm">
        <div>Page</div>

        <strong>
          {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
        </strong>
      </span>
    </div>
  );
}

function Test() {
  type Person = {
    firstName: string;
    lastName: string;
    age: number;
    visits: number;
    status: string;
    progress: number;
  };

  const data: Person[] = [
    {
      firstName: 'Mark',
      lastName: 'Otto',
      age: 40,
      visits: 100,
      status: 'complicated',
      progress: 100,
    },
  ];

  const columnHelper = createColumnHelper<Person>();

  const columns = [
    columnHelper.display({
      header: 'First Name',
      cell: (cell) => cell.row.original.firstName,
    }),
    columnHelper.display({
      header: 'Last Name',
      cell: (cell) => cell.row.original.lastName,
    }),
    columnHelper.display({
      header: 'Age',
      cell: (cell) => cell.row.original.age,
    }),
  ];

  return <Table data={data} columns={columns} />;
}

export { Table, Test };
