import { useTranslation } from 'react-i18next'
import { useI18n } from '../lib/i18n-context'
import { Icons } from '../components/Icons'
import { Button } from '../components/ui/button'
import { Card } from '../components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../components/ui/select'
import { DataTable } from '../components/shared/data-table/data-table'
import { getColumns } from '../components/tiers/columns'

export const Tiers = () => {
  const { t } = useTranslation()
  const { language } = useI18n()

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(language === 'ar' ? 'ar-DZ' : 'fr-DZ', {
      style: 'currency',
      currency: 'DZD',
      minimumFractionDigits: 2
    }).format(amount)
  }

  // Mock data
  const thirdParties = [
    {
      id: 1,
      code: 'CLI-001',
      name: t('mock_data.clients.client_abc'),
      type: 'client',
      nif: '099123456789012',
      nis: '123456789012345',
      rc: '16B0123456',
      phone: '+213 21 12 34 56',
      email: 'contact@clientabc.dz',
      balance: 11900.0
    },
    {
      id: 2,
      code: 'FOU-001',
      name: t('mock_data.suppliers.fournisseur_alpha'),
      type: 'supplier',
      nif: '099987654321098',
      nis: '987654321098765',
      rc: '16A9876543',
      phone: '+213 21 98 76 54',
      email: 'info@alpha.dz',
      balance: -17850.0
    },
    {
      id: 3,
      code: 'CLI-002',
      name: t('mock_data.clients.entreprise_xyz'),
      type: 'client',
      nif: '099555666777888',
      nis: '555666777888999',
      rc: '16B5556667',
      phone: '+213 21 55 66 77',
      email: 'contact@xyz.dz',
      balance: 29750.0
    }
  ]

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'client':
        return 'bg-blue-500'
      case 'supplier':
        return 'bg-purple-500'
      case 'both':
        return 'bg-emerald-500'
      default:
        return 'bg-gray-500'
    }
  }

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {t('tiers.title')}
          </h1>
          <p className="text-muted-foreground mt-1">{t('tiers.subtitle')}</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="border-primary text-primary hover:bg-primary/5"
          >
            <Icons.Users className="w-4 h-4 me-2" />
            {t('tiers.new_supplier')}
          </Button>
          <Button className="bg-primary text-white hover:bg-primary/90 shadow-md">
            <Icons.Plus className="w-4 h-4 me-2" />
            {t('tiers.new_client')}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-4 shadow-sm border-border overflow-hidden">
          <div className="flex items-center justify-between gap-2 overflow-hidden">
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-muted-foreground truncate">
                {t('tiers.total_clients')}
              </p>
              <p className="text-2xl font-bold mt-1 truncate">125</p>
            </div>
            <Icons.Users className="h-8 w-8 text-blue-500 opacity-50 shrink-0" />
          </div>
        </Card>

        <Card className="p-4 shadow-sm border-border overflow-hidden">
          <div className="flex items-center justify-between gap-2 overflow-hidden">
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-muted-foreground truncate">
                {t('tiers.total_suppliers')}
              </p>
              <p className="text-2xl font-bold mt-1 truncate">78</p>
            </div>
            <Icons.ListOrdered className="h-8 w-8 text-purple-500 opacity-50 shrink-0" />
          </div>
        </Card>

        <Card className="p-4 shadow-sm border-border overflow-hidden">
          <div className="flex items-center justify-between gap-2 overflow-hidden">
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-muted-foreground truncate">
                {t('tiers.balance')}
              </p>
              <p
                className="text-2xl font-bold mt-1 ltr:font-poppins rtl:font-somar truncate"
                title={formatCurrency(125545)}
              >
                {formatCurrency(125545)}
              </p>
            </div>
            <Icons.Banknote className="h-8 w-8 text-emerald-500 opacity-50 shrink-0" />
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4 shadow-sm border-border">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex-1 min-w-[200px]">
            <label className="text-sm font-medium text-muted-foreground mb-2 block">
              {t('tiers.type')}
            </label>
            <Select defaultValue="all">
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('tiers.type')}</SelectItem>
                <SelectItem value="client">{t('tiers.client')}</SelectItem>
                <SelectItem value="supplier">{t('tiers.supplier')}</SelectItem>
                <SelectItem value="both">{t('tiers.both')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1 min-w-[200px]"></div>

          <div className="flex-none">
            <Button variant="outline">
              <Icons.FileText className="w-4 h-4 me-2" />
              {t('common.export')}
            </Button>
          </div>
        </div>
      </Card>

      {/* Third Parties Table */}
      <Card className="p-4 shadow-sm border-border">
        <DataTable
          columns={getColumns(t, formatCurrency, getTypeColor)}
          data={thirdParties}
          searchKey="name"
        />
      </Card>
    </div>
  )
}
