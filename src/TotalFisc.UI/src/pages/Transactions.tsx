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
import { useFiscalYears } from '../hooks/use-fiscal-years'
import { useJournalEntries } from '../hooks/use-journal-entries'
import {
  useDeleteJournalEntry,
  usePostJournalEntry
} from '../hooks/use-journal-mutation'

export const Transactions = () => {
  const { t } = useTranslation()
  const { language } = useI18n()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null)
  const [selectedFiscalYearId, setSelectedFiscalYearId] = useState<string>('')

  const { data: fiscalYears } = useFiscalYears()

  // Derived fiscalYearId: uses user selection or defaults to open/first year
  const fiscalYearId =
    selectedFiscalYearId ||
    (fiscalYears?.find((fy) => fy.status === 'Open') || fiscalYears?.[0])?.id ||
    ''

  const { data: entries, isLoading } = useJournalEntries(fiscalYearId)
  const { mutate: deleteEntry } = useDeleteJournalEntry()
  const { mutate: postEntry } = usePostJournalEntry()

  const handleEdit = (entry: any) => {
    setEditingEntryId(entry.id)
    setIsFormOpen(true)
  }

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this entry?')) {
      deleteEntry(id)
    }
  }

  const handlePost = (id: string) => {
    if (
      window.confirm(
        'Are you sure you want to post this entry? This action is irreversible.'
      )
    ) {
      postEntry(id)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(language === 'ar' ? 'ar-DZ' : 'fr-DZ', {
      style: 'currency',
      currency: 'DZD',
      minimumFractionDigits: 2
    }).format(amount)
  }

  // Calculate stats from entries
  const totalEntries = entries?.length || 0
  const totalDebit =
    entries?.reduce(
      (acc: number, curr: any) => acc + (curr.totalDebit || 0),
      0
    ) || 0
  const totalCredit =
    entries?.reduce(
      (acc: number, curr: any) => acc + (curr.totalCredit || 0),
      0
    ) || 0

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
        <div className="flex items-center gap-3">
          <div className="min-w-40">
            <Select
              value={fiscalYearId}
              onValueChange={setSelectedFiscalYearId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Fiscal Year" />
              </SelectTrigger>
              <SelectContent>
                {fiscalYears?.map((fy) => (
                  <SelectItem key={fy.id} value={fy.id}>
                    {fy.yearNumber} (
                    {t(`common.status_${fy.status.toLowerCase()}`) || fy.status}
                    )
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            className="bg-primary text-white hover:bg-primary/90 shadow-md"
            onClick={() => setIsFormOpen(true)}
          >
            <Icons.Plus className="w-4 h-4 me-2" />
            {t('transactions.new_entry')}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="flex flex-wrap gap-4">
        <Card className="flex-1 min-w-50 p-4 shadow-sm border-border overflow-hidden">
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

        <Card className="flex-1 min-w-50 p-4 shadow-sm border-border overflow-hidden">
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

        <Card className="flex-1 min-w-50 p-4 shadow-sm border-border overflow-hidden">
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

        <Card className="flex-1 min-w-50 p-4 shadow-sm border-border overflow-hidden">
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
          <div className="flex-1 min-w-40 lg:min-w-60">
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

          <div className="flex-1 min-w-40 lg:min-w-60">
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

          <div className="flex-2 hidden lg:block"></div>

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
          columns={getColumns(
            t,
            formatCurrency,
            (status) =>
              status === 'posted'
                ? 'bg-emerald-500'
                : 'bg-amber-500 text-white',
            handleEdit,
            handleDelete,
            handlePost
          )}
          data={entries || []}
          searchKey="description"
          isLoading={isLoading}
        />
      </Card>

      <JournalEntryForm
        open={isFormOpen}
        onOpenChange={(open) => {
          setIsFormOpen(open)
          if (!open) setEditingEntryId(null)
        }}
        id={editingEntryId}
        fiscalYearId={fiscalYearId}
      />
    </div>
  )
}
