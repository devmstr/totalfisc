import type { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Icons } from '@/components/Icons'
import { DataTableColumnHeader } from '@/components/shared/data-table/data-table-column-header'

export type PurchaseInvoice = {
  id: number
  invoiceNumber: string
  date: string
  dueDate: string
  supplier: string
  amountHT: number
  vat: number
  amountTTC: number
  status: string
}

export const getColumns = (
  t: any,
  formatCurrency: (amount: number) => string,
  getStatusColor: (status: string) => string
): ColumnDef<PurchaseInvoice>[] => [
  {
    accessorKey: 'invoiceNumber',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title={t('purchases.invoice_number')}
      />
    ),
    meta: {
      title: t('purchases.invoice_number')
    },
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue('invoiceNumber')}</div>
    )
  },
  {
    accessorKey: 'supplier',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={t('purchases.supplier')} />
    ),
    meta: {
      title: t('purchases.supplier')
    }
  },
  {
    accessorKey: 'date',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={t('purchases.date')} />
    ),
    meta: {
      title: t('purchases.date')
    },
    cell: ({ row }) => (
      <div className="text-muted-foreground">{row.getValue('date')}</div>
    )
  },
  {
    accessorKey: 'dueDate',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={t('purchases.due_date')} />
    ),
    meta: {
      title: t('purchases.due_date')
    },
    cell: ({ row }) => (
      <div className="text-muted-foreground">{row.getValue('dueDate')}</div>
    )
  },
  {
    accessorKey: 'amountHT',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title={t('purchases.amount_ht')}
        className="justify-end"
      />
    ),
    meta: {
      title: t('purchases.amount_ht')
    },
    cell: ({ row }) => (
      <div className="text-end ltr:font-poppins rtl:font-somar">
        {formatCurrency(row.getValue('amountHT'))}
      </div>
    )
  },
  {
    accessorKey: 'vat',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title={t('purchases.vat')}
        className="justify-end"
      />
    ),
    meta: {
      title: t('purchases.vat')
    },
    cell: ({ row }) => (
      <div className="text-end ltr:font-poppins rtl:font-somar">
        {formatCurrency(row.getValue('vat'))}
      </div>
    )
  },
  {
    accessorKey: 'amountTTC',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title={t('purchases.amount_ttc')}
        className="justify-end"
      />
    ),
    meta: {
      title: t('purchases.amount_ttc')
    },
    cell: ({ row }) => (
      <div className="text-end font-bold ltr:font-poppins rtl:font-somar">
        {formatCurrency(row.getValue('amountTTC'))}
      </div>
    )
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title={t('purchases.status')}
        className="justify-center"
      />
    ),
    meta: {
      title: t('purchases.status')
    },
    cell: ({ row }) => {
      const status = row.getValue('status') as string
      return (
        <div className="flex justify-center">
          <Badge variant="default" className={getStatusColor(status)}>
            {t(`purchases.${status}`)}
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
        <Button variant="ghost" size="sm">
          <Icons.FileText className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="sm">
          <Icons.Settings className="w-4 h-4" />
        </Button>
      </div>
    )
  }
]
