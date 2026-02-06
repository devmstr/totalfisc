import type { AuditLogEntry } from '@/schemas/audit-log'
import type { ColumnDef } from '@tanstack/react-table'
import { DataTableColumnHeader } from '../shared/data-table/data-table-column-header'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'

export const getAuditColumns = (
  t: (key: string) => string
): ColumnDef<AuditLogEntry>[] => [
  {
    accessorKey: 'timestamp',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={t('common.date')} />
    ),
    cell: ({ row }) => {
      const date = row.getValue('timestamp') as Date
      return (
        <div className="font-mono text-xs">
          {format(date, 'yyyy-MM-dd HH:mm:ss')}
        </div>
      )
    },
    meta: {
      title: t('common.date')
    }
  },
  {
    accessorKey: 'action',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={t('common.action')} />
    ),
    cell: ({ row }) => {
      const action = row.getValue('action') as string
      let variant: 'default' | 'secondary' | 'outline' | 'destructive' =
        'outline'

      switch (action) {
        case 'CREATE':
          variant = 'secondary'
          break
        case 'POST':
          variant = 'default'
          break
        case 'DELETE':
          variant = 'destructive'
          break
      }

      return (
        <Badge variant={variant} className="w-16 justify-center">
          {action}
        </Badge>
      )
    },
    meta: {
      title: t('common.action')
    },
    filterFn: 'arrIncludesSome'
  },
  {
    accessorKey: 'user',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={t('common.user')} />
    ),
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue('user')}</div>
    ),
    meta: {
      title: t('common.user')
    }
  },
  {
    accessorKey: 'entity',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={t('common.entity')} />
    ),
    cell: ({ row }) => (
      <div className="font-medium text-muted-foreground">
        {row.getValue('entity')}
      </div>
    ),
    meta: {
      title: t('common.entity')
    }
  },
  {
    accessorKey: 'details',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={t('common.details')} />
    ),
    cell: ({ row }) => {
      return (
        <div className="max-w-[400px] truncate" title={row.getValue('details')}>
          {row.getValue('details')}
        </div>
      )
    },
    meta: {
      title: t('common.details')
    }
  },
  {
    accessorKey: 'hash',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Hash" />
    ),
    cell: ({ row }) => {
      const hash = row.getValue('hash') as string
      return (
        <div
          className="font-mono text-xs text-muted-foreground truncate w-32"
          title={hash}
        >
          {hash}
        </div>
      )
    },
    meta: {
      title: 'Hash'
    }
  }
]
