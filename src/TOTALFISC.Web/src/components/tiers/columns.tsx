import type { ColumnDef } from '@tanstack/react-table'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Icons } from '../Icons'
import { DataTableColumnHeader } from '../shared/data-table/data-table-column-header'
import { cn } from '@/lib/utils'

export type ThirdParty = {
  id: number
  code: string
  name: string
  type: string
  nif: string
  nis: string
  rc: string
  phone: string
  email: string
  balance: number
}

export const getColumns = (
  t: any,
  formatCurrency: (amount: number) => string,
  getTypeColor: (type: string) => string
): ColumnDef<ThirdParty>[] => [
  {
    accessorKey: 'code',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={t('tiers.code')} />
    ),
    meta: {
      title: t('tiers.code')
    },
    cell: ({ row }) => <div className="font-medium">{row.getValue('code')}</div>
  },
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={t('tiers.name')} />
    ),
    meta: {
      title: t('tiers.name')
    }
  },
  {
    accessorKey: 'type',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={t('tiers.type')} />
    ),
    meta: {
      title: t('tiers.type')
    },
    cell: ({ row }) => {
      const type = row.getValue('type') as string
      return (
        <Badge variant="default" className={getTypeColor(type)}>
          {t(`tiers.${type}`)}
        </Badge>
      )
    }
  },
  {
    accessorKey: 'phone',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={t('tiers.phone')} />
    ),
    meta: {
      title: t('tiers.phone')
    },
    cell: ({ row }) => (
      <div className="text-muted-foreground">{row.getValue('phone')}</div>
    )
  },
  {
    accessorKey: 'balance',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title={t('tiers.balance')}
        className="justify-end"
      />
    ),
    meta: {
      title: t('tiers.balance')
    },
    cell: ({ row }) => {
      const balance = row.getValue('balance') as number
      return (
        <div
          className={cn(
            'text-end font-bold ltr:font-poppins rtl:font-somar',
            balance < 0 ? 'text-rose-500' : 'text-emerald-500'
          )}
        >
          {formatCurrency(balance)}
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
