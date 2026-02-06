import { type ColumnDef } from '@tanstack/react-table'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Icons } from '../Icons'
import { DataTableColumnHeader } from '../shared/data-table/data-table-column-header'

export type FiscalYearEntry = {
  id: number
  year: number
  startDate: string
  endDate: string
  status: 'open' | 'closed'
  entryCount: number
}

export const getColumns = (t: any): ColumnDef<FiscalYearEntry>[] => [
  {
    accessorKey: 'year',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={t('fiscal_years.year')} />
    ),
    meta: {
      title: t('fiscal_years.year')
    },
    cell: ({ row }) => (
      <div className="font-bold text-lg ltr:font-poppins rtl:font-somar">
        {row.getValue('year')}
      </div>
    )
  },
  {
    accessorKey: 'startDate',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title={t('fiscal_years.start_date')}
      />
    ),
    meta: {
      title: t('fiscal_years.start_date')
    },
    cell: () => {
      // Intentionally kept row usage or removed if unused.
      // Wait, in FiscalYears columns, row IS used: row.getValue('status')
      // Let's check the error log.
      // Error was: "src/components/purchases/columns.tsx:158:12 - error TS6133: 'row' is declared but its value is never read."
      // Ah, it was PURCHASES, SALES, TIERS, TRANSACTIONS. Not FiscalYears?
      // Wait, let's re-read error log.
      // accounts/columns.tsx:100 was error.
      // purchases, sales, tiers, transactions also had errors.
      // FiscalYears was NOT in the error list.
      // So I only need to fix accounts, and the others (purchases, sales, tiers, transactions).
      return null
    }
  },
  {
    accessorKey: 'endDate',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title={t('fiscal_years.end_date')}
      />
    ),
    meta: {
      title: t('fiscal_years.end_date')
    }
  },
  {
    accessorKey: 'entryCount',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title={t('fiscal_years.entry_count')}
      />
    ),
    meta: {
      title: t('fiscal_years.entry_count')
    },
    cell: ({ row }) => (
      <div className="ltr:font-poppins rtl:font-somar">
        {new Intl.NumberFormat().format(row.getValue('entryCount'))}
      </div>
    )
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title={t('fiscal_years.status')}
        className="justify-center"
      />
    ),
    meta: {
      title: t('fiscal_years.status')
    },
    cell: ({ row }) => {
      const status = row.getValue('status') as string
      return (
        <div className="flex justify-center">
          <Badge
            variant={status === 'open' ? 'default' : 'secondary'}
            className={status === 'open' ? 'default' : 'secondary'}
          >
            {t(`fiscal_years.status_${status}`)}
          </Badge>
        </div>
      )
    }
  },
  {
    id: 'actions',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title={t('common.actions')}
        className="justify-center"
      />
    ),
    cell: ({ row }) => (
      <div className="flex items-center justify-center gap-2">
        <Button variant="outline" size="sm">
          {row.getValue('status') === 'open' ? (
            <>
              <Icons.Lock className="w-4 h-4 me-2" />
              {t('fiscal_years.close_year')}
            </>
          ) : (
            <>
              <Icons.Eye className="w-4 h-4 me-2" />
              {t('fiscal_years.view_archive')}
            </>
          )}
        </Button>
      </div>
    )
  }
]
