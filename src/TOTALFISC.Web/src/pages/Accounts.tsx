import { useTranslation } from 'react-i18next'
import { useI18n } from '../lib/i18n-context'
import { Icons } from '../components/Icons'
import { Button } from '../components/ui/button'
import { Card } from '../components/ui/card'
import { DataTable } from '../components/shared/data-table/data-table'
import { getColumns, type AccountEntry } from '../components/accounts/columns'

export const Accounts = () => {
  const { t } = useTranslation()
  const { language } = useI18n()

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(language === 'ar' ? 'ar-DZ' : 'fr-DZ', {
      style: 'currency',
      currency: 'DZD',
      minimumFractionDigits: 2
    }).format(amount)
  }

  // Mock data for demonstration
  const accounts: AccountEntry[] = [
    {
      id: 1,
      accountNumber: '101',
      label: 'Capital social',
      class: 1,
      type: 'equity',
      balance: 1000000
    },
    {
      id: 2,
      accountNumber: '411',
      label: 'Clients',
      class: 4,
      type: 'asset',
      balance: 150000
    },
    {
      id: 3,
      accountNumber: '401',
      label: 'Fournisseurs',
      class: 4,
      type: 'liability',
      balance: 80000
    },
    {
      id: 4,
      accountNumber: '512',
      label: 'Banque',
      class: 5,
      type: 'asset',
      balance: 50000
    },
    {
      id: 5,
      accountNumber: '600',
      label: 'Achats de marchandises',
      class: 6,
      type: 'expense',
      balance: 300000
    },
    {
      id: 6,
      accountNumber: '700',
      label: 'Ventes de marchandises',
      class: 7,
      type: 'revenue',
      balance: 500000
    }
  ]

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {t('accounts.title')}
          </h1>
          <p className="text-muted-foreground mt-1">{t('accounts.subtitle')}</p>
        </div>
        <Button className="bg-primary text-white hover:bg-primary/90 shadow-md">
          <Icons.Plus className="w-4 h-4 me-2" />
          {t('accounts.new_account')}
        </Button>
      </div>

      {/* Accounts Table */}
      <Card className="p-4 shadow-sm border-border">
        <DataTable
          columns={getColumns(t, formatCurrency)}
          data={accounts}
          searchKey="label"
        />
      </Card>
    </div>
  )
}
