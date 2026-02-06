import { type ColumnDef } from '@tanstack/react-table'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Icons } from '../Icons'
import { DataTableColumnHeader } from '../shared/data-table/data-table-column-header'

export type AccountEntry = {
  id: number
  accountNumber: string
  label: string
  class: number
  type: string
  balance: number
}

export const getColumns = (
  t: any,
  formatCurrency: (amount: number) => string
): ColumnDef<AccountEntry>[] => [
  {
    accessorKey: 'accountNumber',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title={t('accounts.account_number')}
      />
    ),
    meta: {
      title: t('accounts.account_number')
    },
    cell: ({ row }) => (
      <div className="font-medium font-mono">
        {row.getValue('accountNumber')}
      </div>
    )
  },
  {
    accessorKey: 'label',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={t('accounts.label')} />
    ),
    meta: {
      title: t('accounts.label')
    }
  },
  {
    accessorKey: 'class',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={t('accounts.class')} />
    ),
    meta: {
      title: t('accounts.class')
    },
    cell: ({ row }) => (
      <div className="font-medium">
        {t('accounts.class_prefix')} {row.getValue('class')}
      </div>
    )
  },
  {
    accessorKey: 'type',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={t('accounts.type')} />
    ),
    meta: {
      title: t('accounts.type')
    },
    cell: ({ row }) => {
      const type = row.getValue('type') as string
      return <Badge variant="outline">{t(`accounts.types.${type}`)}</Badge>
    }
  },
  {
    accessorKey: 'balance',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title={t('accounts.balance')}
        className="justify-end"
      />
    ),
    meta: {
      title: t('accounts.balance')
    },
    cell: ({ row }) => (
      <div className="text-end font-bold ltr:font-poppins rtl:font-somar">
        {formatCurrency(row.getValue('balance'))}
      </div>
    )
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
    cell: () => (
      <div className="flex items-center justify-center gap-2">
        <Button variant="ghost" size="sm">
          <Icons.Edit className="w-4 h-4" />
        </Button>
      </div>
    )
  }
]
