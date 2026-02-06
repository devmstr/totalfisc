import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Icons } from '@/components/Icons'
import { cn } from '@/lib/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import { useEffect, useMemo, type KeyboardEvent } from 'react'
import { useFieldArray, useForm, useWatch } from 'react-hook-form'
import { EntryLineRow } from './EntryLineRow'
import {
  useCreateJournalEntry,
  useUpdateJournalEntry
} from '../../hooks/use-journal-mutation'
import { useJournalEntry } from '../../hooks/use-journal-entry'
import { useTranslation } from 'react-i18next'
import {
  createJournalEntrySchema,
  type JournalEntry
} from '@/schemas/journal-entry'
import { ScrollArea } from '@/components/ui/scroll-area'

// Define relative widths here to ensure Header, Rows and Footer align perfectly
const SHARED_COLS = {
  account: 'flex-[3]', // Takes 3 parts space
  desc: 'flex-[3]', // Takes 3 parts space
  debit: 'flex-1', // Takes 1 part space
  credit: 'flex-1', // Takes 1 part space
  action: 'w-10 shrink-0' // Fixed width for X button
}

interface JournalEntryFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  id?: string | null
  fiscalYearId?: string
}

export const JournalEntryForm = ({
  open,
  onOpenChange,
  id,
  fiscalYearId
}: JournalEntryFormProps) => {
  const { t, i18n } = useTranslation()
  const dir = i18n.language === 'ar' ? 'rtl' : 'ltr'
  const schema = useMemo(() => createJournalEntrySchema(t), [t])

  const form = useForm<JournalEntry>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      date: new Date(),
      reference: '',
      journalCode: 'OD',
      description: '',
      lines: [
        { accountId: '', description: '', debit: 0, credit: 0 },
        { accountId: '', description: '', debit: 0, credit: 0 }
      ]
    }
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'lines'
  })

  const lines = useWatch({ control: form.control, name: 'lines' })

  const { mutate: createEntry, isPending: isCreating } =
    useCreateJournalEntry(fiscalYearId)
  const { mutate: updateEntry, isPending: isUpdating } = useUpdateJournalEntry()
  const { data: entryData, isLoading: isLoadingEntry } = useJournalEntry(id)

  const isSaving = isCreating || isUpdating || isLoadingEntry
  const isEdit = !!id

  // Load existing data
  useEffect(() => {
    if (entryData && isEdit) {
      form.reset({
        ...entryData,
        date: new Date(entryData.entryDate),
        lines: entryData.lines.map((line: any) => ({
          accountId: line.accountId,
          description: line.label,
          debit: line.debit,
          credit: line.credit
        }))
      })
    }
  }, [entryData, id, form, isEdit])

  // Reset on open new
  useEffect(() => {
    if (open && !id) {
      form.reset({
        date: new Date(),
        reference: '',
        journalCode: 'OD',
        description: '',
        lines: [
          { accountId: '', description: '', debit: 0, credit: 0 },
          { accountId: '', description: '', debit: 0, credit: 0 }
        ]
      })
    }
  }, [open, id, form])

  const totalDebit = lines.reduce((sum, line) => sum + (line.debit || 0), 0)
  const totalCredit = lines.reduce((sum, line) => sum + (line.credit || 0), 0)
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01

  const handleKeyDown = (
    e: KeyboardEvent<HTMLInputElement>,
    fieldName: string,
    index: number
  ) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (fieldName === 'credit' && index === fields.length - 1) {
        append({ accountId: '', description: '', debit: 0, credit: 0 })
      }
    }
  }

  const onSubmit = (data: JournalEntry) => {
    const payload = { ...data } as any
    const options = {
      onSuccess: () => {
        form.reset()
        onOpenChange(false)
      }
    }

    if (isEdit && id) updateEntry({ id, data: payload }, options)
    else createEntry(payload, options)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        dir={dir}
        className="w-full max-w-5xl flex flex-col p-0 gap-0"
      >
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="text-start">
            {isEdit
              ? t('journal.form.title_edit')
              : t('journal.form.title_create')}
          </DialogTitle>
          <DialogDescription className="text-start">
            {isEdit
              ? t('journal.form.desc_edit')
              : t('journal.form.desc_create')}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col overflow-hidden"
          >
            {/* TOP HEADER INPUTS - FIXED OVERLAP */}
            <div className="flex flex-col md:flex-row w-full gap-4 p-6 bg-muted/20 border-b">
              <FormField
                control={form.control}
                name="journalCode"
                render={({ field }) => (
                  <FormItem className="w-full md:w-35 shrink-0">
                    <FormLabel>{t('journal.form.fields.journal')}</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={t('journal.form.placeholders.select')}
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent dir={dir}>
                        {['OD', 'AN', 'VR', 'AC', 'BQ', 'CA'].map((code) => (
                          <SelectItem key={code} value={code}>
                            {t(`journals.${code}`)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="w-full md:w-[240px] shrink-0">
                    <FormLabel>{t('journal.form.fields.date')}</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={'outline'}
                            className={cn(
                              'w-full ps-3 text-start font-normal',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            {field.value
                              ? format(field.value, 'PPP')
                              : t('journal.form.placeholders.pick_date')}
                            <Icons.Calendar className="ms-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date > new Date() || date < new Date('1900-01-01')
                          }
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="reference"
                render={({ field }) => (
                  <FormItem className="flex-1 min-w-[150px]">
                    <FormLabel>{t('journal.form.fields.reference')}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t('journal.form.placeholders.reference')}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="flex-[1.5] min-w-[200px]">
                    <FormLabel>
                      {t('journal.form.fields.description')}
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t('journal.form.placeholders.global_desc')}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* TABLE HEADER */}
            <div className="flex gap-4 px-6 py-3 bg-muted border-b text-sm font-medium text-muted-foreground shrink-0">
              <div className={cn(SHARED_COLS.account, 'text-start')}>
                {t('journal.form.fields.account')}
              </div>
              <div className={cn(SHARED_COLS.desc, 'text-start')}>
                {t('journal.form.fields.description')}
              </div>
              <div className={cn(SHARED_COLS.debit, 'text-end')}>
                {t('journal.form.fields.debit')}
              </div>
              <div className={cn(SHARED_COLS.credit, 'text-end')}>
                {t('journal.form.fields.credit')}
              </div>
              <div className={cn(SHARED_COLS.action, 'text-center')}>
                {t('journal.form.fields.actions')}
              </div>
            </div>

            {/* SCROLLABLE ROWS */}
            <ScrollArea className="flex-1">
              <div className="flex flex-col gap-2 p-6">
                {fields.map((field, index) => (
                  <EntryLineRow
                    key={field.id}
                    index={index}
                    control={form.control}
                    register={form.register}
                    remove={remove}
                    onKeyDown={handleKeyDown}
                    className={SHARED_COLS}
                  />
                ))}

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-2 border-dashed w-full"
                  onClick={() =>
                    append({
                      accountId: '',
                      description: '',
                      debit: 0,
                      credit: 0
                    })
                  }
                >
                  <Icons.Plus className="w-4 h-4 me-2" />
                  {t('journal.form.add_line')}
                </Button>

                {form.formState.errors.lines && (
                  <p className="text-sm font-medium text-destructive">
                    {form.formState.errors.lines.message as string}
                  </p>
                )}
              </div>
            </ScrollArea>

            {/* FOOTER TOTALS */}
            <div className="border-t bg-muted/20 p-6 flex flex-col gap-4 shrink-0">
              <div className="flex gap-4 text-sm font-bold items-center">
                <div className="flex-[6] text-end pe-4">
                  {t('journal.form.totals')}
                </div>

                <div
                  className={cn(
                    SHARED_COLS.debit,
                    'text-end text-emerald-600 truncate'
                  )}
                >
                  {totalDebit.toFixed(2)}
                </div>

                <div
                  className={cn(
                    SHARED_COLS.credit,
                    'text-end text-emerald-600 truncate'
                  )}
                >
                  {totalCredit.toFixed(2)}
                </div>

                <div className={SHARED_COLS.action}></div>
              </div>

              {!isBalanced && (
                <div className="text-center text-destructive font-medium text-sm">
                  {t('journal.form.unbalanced_by', {
                    amount: Math.abs(totalDebit - totalCredit).toFixed(2)
                  })}
                </div>
              )}

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  {t('journal.form.cancel')}
                </Button>
                <Button type="submit" disabled={!isBalanced || isSaving}>
                  {isSaving ? (
                    <Icons.Loader2 className="w-4 h-4 me-2 animate-spin" />
                  ) : (
                    <Icons.Save className="w-4 h-4 me-2" />
                  )}
                  {t('journal.form.save')}
                </Button>
              </DialogFooter>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
