import type { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Icons } from '@/components/Icons'
import { DataTableColumnHeader } from '@/components/shared/data-table/data-table-column-header'

export type SaleInvoice = {
  id: number
  invoiceNumber: string
  date: string
  client: string
  amountHT: number
  vat: number
  amountTTC: number
  status: string
}

export const getColumns = (
  t: any,
  formatCurrency: (amount: number) => string,
  getStatusColor: (status: string) => string
): ColumnDef<SaleInvoice>[] => [
  {
    accessorKey: 'invoiceNumber',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title={t('sales.invoice_number')}
      />
    ),
    meta: {
      title: t('sales.invoice_number')
    },
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue('invoiceNumber')}</div>
    )
  },
  {
    accessorKey: 'client',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={t('sales.client')} />
    ),
    meta: {
      title: t('sales.client')
    }
  },
  {
    accessorKey: 'date',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={t('sales.date')} />
    ),
    meta: {
      title: t('sales.date')
    },
    cell: ({ row }) => (
      <div className="text-muted-foreground">{row.getValue('date')}</div>
    )
  },
  {
    accessorKey: 'amountHT',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title={t('sales.amount_ht')}
        className="justify-end"
      />
    ),
    meta: {
      title: t('sales.amount_ht')
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
        title={t('sales.vat')}
        className="justify-end"
      />
    ),
    meta: {
      title: t('sales.vat')
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
        title={t('sales.amount_ttc')}
        className="justify-end"
      />
    ),
    meta: {
      title: t('sales.amount_ttc')
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
        title={t('sales.status')}
        className="justify-center"
      />
    ),
    meta: {
      title: t('sales.status')
    },
    cell: ({ row }) => {
      const status = row.getValue('status') as string
      return (
        <div className="flex justify-center">
          <Badge variant="default" className={getStatusColor(status)}>
            {t(`sales.${status}`)}
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
