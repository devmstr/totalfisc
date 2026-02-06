import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react'
import type { Table } from '@tanstack/react-table'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'

interface DataTablePaginationProps<TData> {
  table: Table<TData>
}

export function DataTablePagination<TData>({
  table
}: DataTablePaginationProps<TData>) {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'

  return (
    <div className="flex items-center justify-between px-2">
      <div className="flex-1 text-sm text-muted-foreground">
        {t('common.rows_selected', {
          count: table.getFilteredSelectedRowModel().rows.length,
          total: table.getFilteredRowModel().rows.length
        })}
      </div>
      <div className="flex items-center space-x-6 lg:space-x-8 rtl:space-x-reverse">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium">{t('common.rows_per_page')}</p>
          <Select
            value={`${table.getState().pagination.pageSize}`}
            onValueChange={(value) => {
              table.setPageSize(Number(value))
            }}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={table.getState().pagination.pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {[10, 20, 30, 40, 50].map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex w-[100px] items-center justify-center text-sm font-medium">
          {t('common.page_of', {
            current: table.getState().pagination.pageIndex + 1,
            total: table.getPageCount()
          })}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">{t('common.go_to_first_page')}</span>
            {isRTL ? <ChevronsRight /> : <ChevronsLeft />}
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">{t('common.go_to_previous_page')}</span>
            {isRTL ? <ChevronRight /> : <ChevronLeft />}
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">{t('common.go_to_next_page')}</span>
            {isRTL ? <ChevronLeft /> : <ChevronRight />}
          </Button>
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">{t('common.go_to_last_page')}</span>
            {isRTL ? <ChevronsLeft /> : <ChevronsRight />}
          </Button>
        </div>
      </div>
    </div>
  )
}
