import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useI18n } from '../lib/i18n-context'
import { Icons } from '../components/Icons'
import { Button } from '../components/ui/button'
import { Card } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../components/ui/select'
import { DataTable } from '../components/shared/data-table/data-table'
import { getColumns } from '../components/transactions/columns'
import { JournalEntryForm } from '../components/journal/JournalEntryForm'
import { useJournalEntries } from '../hooks/use-journal-entries'
import type { JournalEntry } from '../schemas/journal-entry'

export const Transactions = () => {
  const { t } = useTranslation()
  const { language } = useI18n()
  const [isFormOpen, setIsFormOpen] = useState(false)

  // For MVP, we use a placeholder or derived fiscal year ID
  const fiscalYearId = 'current'
  const { data: entries, isLoading } = useJournalEntries(fiscalYearId)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(language === 'ar' ? 'ar-DZ' : 'fr-DZ', {
      style: 'currency',
      currency: 'DZD',
      minimumFractionDigits: 2
    }).format(amount)
  }

  const handleSaveEntry = (entry: JournalEntry) => {
    console.log('Saved entry:', entry)
    // Here we would call API to save
    // And refresher the table
  }

  // Calculate stats from entries
  const totalEntries = entries?.length || 0
  const totalDebit =
    entries?.reduce((acc, curr) => acc + curr.totalDebit, 0) || 0
  const totalCredit =
    entries?.reduce((acc, curr) => acc + curr.totalCredit, 0) || 0

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {t('transactions.title')}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t('transactions.subtitle')}
          </p>
        </div>
        <Button
          className="bg-primary text-white hover:bg-primary/90 shadow-md"
          onClick={() => setIsFormOpen(true)}
        >
          <Icons.Plus className="w-4 h-4 me-2" />
          {t('transactions.new_entry')}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="p-4 shadow-sm border-border overflow-hidden">
          <div className="flex items-center justify-between gap-2 overflow-hidden">
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-muted-foreground truncate">
                {t('transactions.total_entries')}
              </p>
              <p className="text-2xl font-bold mt-1 truncate">
                {totalEntries.toLocaleString()}
              </p>
            </div>
            <Icons.FileText className="h-8 w-8 text-primary opacity-50 shrink-0" />
          </div>
        </Card>

        <Card className="p-4 shadow-sm border-border overflow-hidden">
          <div className="flex items-center justify-between gap-2 overflow-hidden">
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-muted-foreground truncate">
                {t('transactions.debit')}
              </p>
              <p
                className="text-2xl font-bold mt-1 ltr:font-poppins rtl:font-somar truncate"
                title={formatCurrency(totalDebit)}
              >
                {formatCurrency(totalDebit)}
              </p>
            </div>
            <Icons.ChevronDown className="h-8 w-8 text-emerald-500 opacity-50 rotate-180 shrink-0" />
          </div>
        </Card>

        <Card className="p-4 shadow-sm border-border overflow-hidden">
          <div className="flex items-center justify-between gap-2 overflow-hidden">
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-muted-foreground truncate">
                {t('transactions.credit')}
              </p>
              <p
                className="text-2xl font-bold mt-1 ltr:font-poppins rtl:font-somar truncate"
                title={formatCurrency(totalCredit)}
              >
                {formatCurrency(totalCredit)}
              </p>
            </div>
            <Icons.ChevronDown className="h-8 w-8 text-blue-500 opacity-50 shrink-0" />
          </div>
        </Card>

        <Card className="p-4 shadow-sm border-border overflow-hidden">
          <div className="flex items-center justify-between gap-2 overflow-hidden">
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-muted-foreground truncate">
                {t('transactions.balance')}
              </p>
              <div className="flex items-center gap-2 mt-1 overflow-hidden">
                <Badge
                  variant="default"
                  className={
                    totalDebit === totalCredit && totalEntries > 0
                      ? 'bg-emerald-500 truncate'
                      : 'bg-amber-500 truncate'
                  }
                >
                  {totalDebit === totalCredit && totalEntries > 0
                    ? t('transactions.balanced')
                    : t('transactions.unbalanced')}
                </Badge>
              </div>
            </div>
            <Icons.Plus className="h-8 w-8 text-emerald-500 opacity-50 bg-emerald-100 rounded-full p-1 shrink-0" />
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4 shadow-sm border-border">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex-1 min-w-50">
            <label className="text-sm font-medium text-muted-foreground mb-2 block">
              {t('transactions.journal')}
            </label>
            <Select defaultValue="all">
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  {t('transactions.all_journals')}
                </SelectItem>
                <SelectItem value="VTE">{t('journals.VTE')}</SelectItem>
                <SelectItem value="ACH">{t('journals.ACH')}</SelectItem>
                <SelectItem value="BQ">{t('journals.BQ')}</SelectItem>
                <SelectItem value="CAI">{t('journals.CAI')}</SelectItem>
                <SelectItem value="OD">{t('journals.OD')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1 min-w-50">
            <label className="text-sm font-medium text-muted-foreground mb-2 block">
              {t('transactions.status')}
            </label>
            <Select defaultValue="all">
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('common.status')}</SelectItem>
                <SelectItem value="draft">{t('transactions.draft')}</SelectItem>
                <SelectItem value="posted">
                  {t('transactions.posted')}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1 min-w-50"></div>

          <div className="flex-none">
            <Button variant="outline">
              <Icons.FileText className="w-4 h-4 me-2" />
              {t('common.export')}
            </Button>
          </div>
        </div>
      </Card>

      {/* Entries Table */}
      <Card className="p-4 shadow-sm border-border">
        <DataTable
          columns={getColumns(t, formatCurrency, (status) =>
            status === 'posted' ? 'bg-emerald-500' : 'bg-amber-500 text-white'
          )}
          data={entries || []}
          searchKey="description"
          isLoading={isLoading}
        />
      </Card>

      <JournalEntryForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSave={handleSaveEntry}
      />
    </div>
  )
}
