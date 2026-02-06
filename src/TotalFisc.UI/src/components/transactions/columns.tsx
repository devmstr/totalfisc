import type { ColumnDef } from '@tanstack/react-table'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Icons } from '../Icons'
import { DataTableColumnHeader } from '../shared/data-table/data-table-column-header'

export type TransactionEntry = {
  id: string
  entryNumber: string
  entryDate: string
  journalCode: string
  reference: string
  description: string
  totalDebit: number
  totalCredit: number
  status: string
}

export const getColumns = (
  t: any,
  formatCurrency: (amount: number) => string,
  getStatusColor: (status: string) => string,
  onEdit?: (entry: TransactionEntry) => void,
  onDelete?: (id: string) => void,
  onPost?: (id: string) => void
): ColumnDef<TransactionEntry>[] => [
  {
    accessorKey: 'entryNumber',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title={t('transactions.entry_number')}
      />
    ),
    meta: {
      title: t('transactions.entry_number')
    },
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue('entryNumber')}</div>
    )
  },
  {
    accessorKey: 'entryDate',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title={t('transactions.entry_date')}
      />
    ),
    meta: {
      title: t('transactions.entry_date')
    }
  },
  {
    accessorKey: 'journalCode',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title={t('transactions.journal')}
      />
    ),
    meta: {
      title: t('transactions.journal')
    },
    cell: ({ row }) => {
      const journalCode = row.getValue('journalCode') as string
      return <Badge variant="outline">{journalCode}</Badge>
    }
  },
  {
    accessorKey: 'reference',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title={t('transactions.reference')}
      />
    ),
    meta: {
      title: t('transactions.reference')
    },
    cell: ({ row }) => (
      <div className="text-muted-foreground">{row.getValue('reference')}</div>
    )
  },
  {
    accessorKey: 'description',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title={t('transactions.description')}
      />
    ),
    meta: {
      title: t('transactions.description')
    }
  },
  {
    accessorKey: 'totalDebit',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title={t('transactions.debit')}
        className="justify-end"
      />
    ),
    meta: {
      title: t('transactions.debit')
    },
    cell: ({ row }) => (
      <div className="text-end font-bold ltr:font-poppins rtl:font-somar">
        {formatCurrency(row.getValue('totalDebit'))}
      </div>
    )
  },
  {
    accessorKey: 'totalCredit',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title={t('transactions.credit')}
        className="justify-end"
      />
    ),
    meta: {
      title: t('transactions.credit')
    },
    cell: ({ row }) => (
      <div className="text-end font-bold ltr:font-poppins rtl:font-somar">
        {formatCurrency(row.getValue('totalCredit'))}
      </div>
    )
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title={t('transactions.status')}
        className="justify-center"
      />
    ),
    meta: {
      title: t('transactions.status')
    },
    cell: ({ row }) => {
      const status = row.getValue('status') as string
      return (
        <div className="flex justify-center">
          <Badge
            variant={status === 'posted' ? 'default' : 'secondary'}
            className={getStatusColor(status)}
          >
            {t(`transactions.${status}`)}
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
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onEdit?.(row.original)}
        >
          <Icons.Edit className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={() => onDelete?.(row.original.id)}
        >
          <Icons.Trash className="w-4 h-4" />
        </Button>
      </div>
    )
  }
]
