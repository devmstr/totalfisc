import { useTranslation } from 'react-i18next'
import { Icons } from '../components/Icons'
import { Button } from '../components/ui/button'
import { Card } from '../components/ui/card'
import { DataTable } from '../components/shared/data-table/data-table'
import {
  getColumns,
  type FiscalYearEntry
} from '../components/fiscal-years/columns'

export const FiscalYears = () => {
  const { t } = useTranslation()

  // Mock data for demonstration
  const fiscalYears: FiscalYearEntry[] = [
    {
      id: 1,
      year: 2026,
      startDate: '01/01/2026',
      endDate: '31/12/2026',
      status: 'open',
      entryCount: 1250
    },
    {
      id: 2,
      year: 2025,
      startDate: '01/01/2025',
      endDate: '31/12/2025',
      status: 'closed',
      entryCount: 5430
    },
    {
      id: 3,
      year: 2024,
      startDate: '01/01/2024',
      endDate: '31/12/2024',
      status: 'closed',
      entryCount: 4890
    }
  ]

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {t('fiscal_years.title')}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t('fiscal_years.subtitle')}
          </p>
        </div>
        <Button className="bg-primary text-white hover:bg-primary/90 shadow-md">
          <Icons.Plus className="w-4 h-4 me-2" />
          {t('fiscal_years.new_year')}
        </Button>
      </div>

      {/* Fiscal Years Table */}
      <Card className="p-4 shadow-sm border-border">
        <DataTable columns={getColumns(t)} data={fiscalYears} />
      </Card>
    </div>
  )
}
