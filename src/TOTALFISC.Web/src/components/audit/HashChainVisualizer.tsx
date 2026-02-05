import type { AuditLogEntry } from '@/schemas/audit-log'
import { Icons } from '@/components/Icons'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface HashChainVisualizerProps {
  logs: AuditLogEntry[]
  maxBlocks?: number
}

export const HashChainVisualizer = ({
  logs,
  maxBlocks = 5
}: HashChainVisualizerProps) => {
  // Take the most recent N blocks, but reverse to show oldest -> newest (Left -> Right)
  const recentLogs = [...logs].slice(0, maxBlocks).reverse()

  return (
    <div className="w-full overflow-x-auto pb-4">
      <div className="flex items-start gap-2 min-w-max p-4">
        {recentLogs.map((log, index) => {
          const isLast = index === recentLogs.length - 1
          const isValid = log.status === 'valid'

          return (
            <div key={log.id} className="flex items-center gap-2">
              <Card
                className={cn(
                  'w-64 p-3 border-2 transition-all hover:scale-105',
                  isValid
                    ? 'border-emerald-500/20 bg-emerald-50/10'
                    : 'border-destructive/50 bg-destructive/10'
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xs font-mono text-muted-foreground">
                    Block #{log.id.split('-')[1]}
                  </div>
                  {isValid ? (
                    <Icons.Lock className="w-3 h-3 text-emerald-500" />
                  ) : (
                    <Icons.Unlock className="w-3 h-3 text-destructive" />
                  )}
                </div>

                <div className="space-y-1">
                  <div className="font-semibold text-sm truncate">
                    {log.action} {log.entity}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    {log.user}
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-border/50 space-y-1">
                  <div className="flex items-center gap-1 text-[10px] font-mono text-muted-foreground">
                    <span className="opacity-50">Prev:</span>
                    <span className="truncate" title={log.previousHash}>
                      {log.previousHash.substring(0, 8)}...
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] font-mono font-medium">
                    <span className="opacity-50">Hash:</span>
                    <span
                      className={cn(
                        'truncate',
                        isValid ? 'text-emerald-600' : 'text-destructive'
                      )}
                      title={log.hash}
                    >
                      {log.hash.substring(0, 8)}...
                    </span>
                  </div>
                </div>
              </Card>

              {!isLast && (
                <div className="flex flex-col items-center justify-center -mx-1 text-muted-foreground/30">
                  <div className="h-[2px] w-8 bg-current" />
                  <Icons.ArrowRight className="w-4 h-4 -ml-2" />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
