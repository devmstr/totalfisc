import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Icons } from '../components/Icons'
import { Button } from '../components/ui/button'
import { Card } from '../components/ui/card'
import { DataTable } from '../components/shared/data-table/data-table'
import { HashChainVisualizer } from '../components/audit/HashChainVisualizer'
import { getAuditColumns } from '../components/audit/columns'
import { mockAuditLogs } from '../data/mock-audit-logs'

export const AuditLogs = () => {
  const { t } = useTranslation()
  const [isVerifying, setIsVerifying] = useState(false)
  const [integrityStatus, setIntegrityStatus] = useState<
    'unknown' | 'verified' | 'tampered'
  >('unknown')

  const handleVerify = () => {
    setIsVerifying(true)
    // Simulate API check time
    setTimeout(() => {
      setIsVerifying(false)
      setIntegrityStatus('verified')
    }, 2000)
  }

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {t('audit.title', 'Audit Logs')}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t('audit.subtitle', 'System activity and integrity verification')}
          </p>
        </div>
        <Button
          onClick={handleVerify}
          disabled={isVerifying}
          className={
            integrityStatus === 'verified'
              ? 'bg-emerald-600 hover:bg-emerald-700'
              : ''
          }
        >
          {isVerifying ? (
            <Icons.Sun className="w-4 h-4 mr-2 animate-spin" />
          ) : integrityStatus === 'verified' ? (
            <Icons.Lock className="w-4 h-4 mr-2" />
          ) : (
            <Icons.Search className="w-4 h-4 mr-2" />
          )}
          {isVerifying
            ? t('audit.verifying', 'Verifying Chain...')
            : integrityStatus === 'verified'
              ? t('audit.verified', 'Integration Verified')
              : t('audit.verify_integrity', 'Verify Integrity')}
        </Button>
      </div>

      {/* Visualizer */}
      <Card className="p-4 shadow-sm border-border bg-muted/20">
        <div className="flex items-center justify-between mb-4 px-2">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <Icons.ArrowRight className="w-4 h-4" />
            {t('audit.hash_chain', 'Ledger Hash Chain')}
          </h3>
          <div className="text-xs font-mono text-muted-foreground">
            SHA-256 Linked
          </div>
        </div>
        <HashChainVisualizer logs={mockAuditLogs} />
      </Card>

      {/* Logs Table */}
      <Card className="p-4 shadow-sm border-border">
        <DataTable
          columns={getAuditColumns(t)}
          data={mockAuditLogs}
          searchKey="user"
        />
      </Card>
    </div>
  )
}
