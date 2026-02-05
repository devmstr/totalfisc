import { useTranslation } from 'react-i18next'
import { useI18n } from '../lib/i18n-context'
import { Icons } from '../components/Icons'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '../components/ui/table'

export const Dashboard = () => {
  const { t } = useTranslation()
  const { language } = useI18n()

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(language === 'ar' ? 'ar-DZ' : 'fr-DZ', {
      style: 'currency',
      currency: 'DZD',
      minimumFractionDigits: 2
    }).format(amount)
  }

  return (
    <div className="p-6 space-y-8 animate-in fade-in duration-500">
      {/* 1. Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {t('common.welcome', { name: 'Ismail' })}{' '}
            <span className="text-2xl">👋</span>
          </h1>
          <p className="text-muted-foreground mt-1">
            {t('common.welcome_subtitle')}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button className="bg-white text-primary border border-border hover:bg-gray-50 shadow-sm">
            <Icons.FileText className="w-4 h-4 me-2" />
            {t('common.new_quote')}
          </Button>
          <Button className="bg-white text-primary border border-border hover:bg-gray-50 shadow-sm">
            <Icons.Plus className="w-4 h-4 me-2" />
            {t('common.sale_invoice')}
          </Button>
          <Button className="bg-primary text-white hover:bg-primary/90 shadow-md">
            <Icons.Plus className="w-4 h-4 me-2" />
            {t('common.purchase_invoice')}
          </Button>
        </div>
      </div>

      {/* 2. Section A: Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Cash Flow */}
        <Card className="shadow-sm border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t('dashboard.cash_flow')}
            </CardTitle>
            <Icons.Banknote className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground ltr:font-poppins rtl:font-somar">
              {formatCurrency(250236.4)}
            </div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center">
              <span className="text-emerald-600 font-medium flex items-center me-1">
                <Icons.ChevronDown className="w-3 h-3 rotate-180 me-1" />
                +12.5%
              </span>
              {t('dashboard.from_last_month')}
            </p>
          </CardContent>
        </Card>

        {/* Receivables */}
        <Card className="shadow-sm border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t('dashboard.receivables')}
            </CardTitle>
            <Icons.ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground ltr:font-poppins rtl:font-somar">
              {formatCurrency(125545.0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center">
              <span className="text-amber-600 font-medium me-1">
                10 {t('dashboard.open_invoices')}
              </span>
            </p>
          </CardContent>
        </Card>

        {/* Payables */}
        <Card className="shadow-sm border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t('dashboard.payables')}
            </CardTitle>
            <Icons.ListOrdered className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground ltr:font-poppins rtl:font-somar">
              {formatCurrency(9090.0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center">
              <span className="text-primary font-medium me-1">
                2 {t('dashboard.due_invoices')}
              </span>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 3. Section B: Alerts */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold tracking-tight">
          {t('dashboard.actions_required')}
        </h2>
        <Card className="border-border shadow-sm p-0 overflow-hidden">
          <div className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border rtl:divide-x-reverse">
            {/* Alert 1 */}
            <div className="p-4 flex flex-col justify-between hover:bg-muted/30 transition-colors">
              <div>
                <span className="text-sm text-muted-foreground font-medium">
                  {t('dashboard.unjustified')}
                </span>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-xl font-bold">10</span>
                  <span className="text-sm text-foreground">
                    {t('dashboard.transactions')}
                  </span>
                </div>
              </div>
              <Button
                size="sm"
                className="mt-4 w-fit bg-primary text-white hover:bg-primary/90"
              >
                {t('dashboard.justify')}
              </Button>
            </div>

            {/* Alert 2 */}
            <div className="p-4 flex flex-col justify-between hover:bg-muted/30 transition-colors">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground font-medium">
                    {t('dashboard.overdue_invoices')}
                  </span>
                  <Badge variant="destructive" className="rounded-full px-2">
                    1
                  </Badge>
                </div>
                <div className="mt-1">
                  <span className="text-xl font-bold">
                    {formatCurrency(450.9)}
                  </span>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="mt-4 w-fit border-primary text-primary hover:bg-primary/5"
              >
                {t('dashboard.remind')}
              </Button>
            </div>

            {/* Alert 3 */}
            <div className="p-4 flex flex-col justify-between hover:bg-muted/30 transition-colors">
              <div>
                <span className="text-sm text-muted-foreground font-medium">
                  {t('dashboard.overdue_purchases')}
                </span>
                <div className="mt-2 text-emerald-600 flex items-center font-medium">
                  <Icons.Plus
                    className="w-4 h-4 bg-emerald-100 rounded-full p-0.5 me-2"
                    strokeWidth={3}
                  />
                  {t('dashboard.no_delay')}
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* 4. Section C: Recent Activity */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold tracking-tight">
          {t('dashboard.recent_activity')}
        </h2>
        <Card className="border-border shadow-sm">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead className="w-[100px] text-start">
                  {t('dashboard.col_type')}
                </TableHead>
                <TableHead className="text-start">
                  {t('dashboard.col_desc')}
                </TableHead>
                <TableHead className="text-start">
                  {t('dashboard.col_date')}
                </TableHead>
                <TableHead className="text-end">
                  {t('dashboard.col_amount')}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[1, 2, 3].map((i) => (
                <TableRow key={i}>
                  <TableCell>
                    <div className="flex items-center">
                      {i === 1 && (
                        <Icons.Banknote className="w-4 h-4 text-blue-500 me-2" />
                      )}
                      {i === 2 && (
                        <Icons.ShoppingCart className="w-4 h-4 text-amber-500 me-2" />
                      )}
                      {i === 3 && (
                        <Icons.ListOrdered className="w-4 h-4 text-purple-500 me-2" />
                      )}
                      <span className="text-xs font-medium text-muted-foreground">
                        {i === 1 ? 'Bank' : i === 2 ? 'Vente' : 'Achat'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    {i === 1
                      ? 'Prélèvement Free Mob'
                      : i === 2
                        ? 'Facture #F2023-001'
                        : 'Achat Matériel Bureau'}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    03 Nov. 2023
                  </TableCell>
                  <TableCell className="text-end font-bold ltr:font-poppins rtl:font-somar">
                    {formatCurrency(i === 1 ? 19.99 : i === 2 ? 450.9 : 276.0)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  )
}
