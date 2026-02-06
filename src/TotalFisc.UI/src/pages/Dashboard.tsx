import * as React from 'react'
import { useTranslation } from 'react-i18next'
import { useI18n } from '../lib/i18n-context'
import { Icons } from '../components/Icons'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Input } from '../components/ui/input'
import { normalizeString } from '../lib/utils'
import { useJournalEntries } from '../hooks/use-journal-entries'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'

export const Dashboard = () => {
  const { t } = useTranslation()
  const { language } = useI18n()
  const [searchQuery, setSearchQuery] = React.useState('')

  // For MVP, we use a placeholder or derived fiscal year ID
  const fiscalYearId = 'current'

  const { data: transactions, isLoading: isLoadingTransactions } =
    useJournalEntries(fiscalYearId, 5)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(language === 'ar' ? 'ar-DZ' : 'fr-DZ', {
      style: 'currency',
      currency: 'DZD',
      minimumFractionDigits: 2
    }).format(amount)
  }

  const isLoading = isLoadingTransactions

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
        <Card className="shadow-sm border-border overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2 overflow-hidden">
            <CardTitle className="text-sm font-medium text-muted-foreground truncate">
              {t('dashboard.cash_flow')}
            </CardTitle>
            <Icons.Banknote className="h-4 w-4 text-muted-foreground shrink-0" />
          </CardHeader>
          <CardContent className="overflow-hidden">
            {isLoading ? (
              <Skeleton className="h-8 w-3/4" />
            ) : (
              <div
                className="text-2xl font-bold text-foreground ltr:font-poppins rtl:font-somar truncate"
                title={formatCurrency(250236.4)}
              >
                {formatCurrency(250236.4)}
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-1 flex items-center truncate">
              <span className="text-emerald-600 font-medium flex items-center me-1 shrink-0">
                <Icons.ChevronDown className="w-3 h-3 rotate-180 me-1" />
                +12.5%
              </span>
              <span className="truncate">{t('dashboard.from_last_month')}</span>
            </p>
          </CardContent>
        </Card>

        {/* Receivables */}
        <Card className="shadow-sm border-border overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2 overflow-hidden">
            <CardTitle className="text-sm font-medium text-muted-foreground truncate">
              {t('dashboard.receivables')}
            </CardTitle>
            <Icons.ShoppingCart className="h-4 w-4 text-muted-foreground shrink-0" />
          </CardHeader>
          <CardContent className="overflow-hidden">
            {isLoading ? (
              <Skeleton className="h-8 w-3/4" />
            ) : (
              <div
                className="text-2xl font-bold text-foreground ltr:font-poppins rtl:font-somar truncate"
                title={formatCurrency(125545.0)}
              >
                {formatCurrency(125545.0)}
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-1 flex items-center truncate">
              <span className="text-amber-600 font-medium me-1 truncate">
                10 {t('dashboard.open_invoices')}
              </span>
            </p>
          </CardContent>
        </Card>

        {/* Payables */}
        <Card className="shadow-sm border-border overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2 overflow-hidden">
            <CardTitle className="text-sm font-medium text-muted-foreground truncate">
              {t('dashboard.payables')}
            </CardTitle>
            <Icons.ListOrdered className="h-4 w-4 text-muted-foreground shrink-0" />
          </CardHeader>
          <CardContent className="overflow-hidden">
            {isLoading ? (
              <Skeleton className="h-8 w-3/4" />
            ) : (
              <div
                className="text-2xl font-bold text-foreground ltr:font-poppins rtl:font-somar truncate"
                title={formatCurrency(9090.0)}
              >
                {formatCurrency(9090.0)}
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-1 flex items-center truncate">
              <span className="text-primary font-medium me-1 truncate">
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

      <Card className="border-border shadow-sm p-4 ">
        <div className="space-y-3">
          <h2 className="text-lg font-semibold tracking-tight ">
            {t('dashboard.recent_activity')}
          </h2>
          <div className="flex items-center justify-start gap-4">
            <Input
              placeholder={t('common.search')}
              className="h-8 max-w-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="rounded-lg border border-border ">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow>
                  <TableHead className="w-25 text-start">
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
                {isLoading
                  ? Array.from({ length: 3 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell>
                          <Skeleton className="h-4 w-12" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-full" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-24" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-16" />
                        </TableCell>
                      </TableRow>
                    ))
                  : (transactions || [])
                      .filter(
                        (item) =>
                          normalizeString(item.journalCode).includes(
                            normalizeString(searchQuery)
                          ) ||
                          normalizeString(item.description).includes(
                            normalizeString(searchQuery)
                          )
                      )
                      .map((item, i) => (
                        <TableRow key={i}>
                          <TableCell>
                            <div className="flex items-center">
                              <span className="text-xs font-medium text-muted-foreground">
                                {item.journalCode}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">
                            {item.description}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {new Date(item.entryDate).toLocaleDateString(
                              language === 'ar' ? 'ar-DZ' : 'fr-DZ'
                            )}
                          </TableCell>
                          <TableCell className="text-end font-bold ltr:font-poppins rtl:font-somar">
                            {formatCurrency(item.totalDebit)}
                          </TableCell>
                        </TableRow>
                      ))}
                {!isLoading && transactions?.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center py-8 text-muted-foreground"
                    >
                      {t('common.no_data')}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </Card>
    </div>
  )
}
