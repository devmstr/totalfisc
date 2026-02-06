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
import { journalEntrySchema } from '@/schemas/journal-entry'
import type { JournalEntry } from '@/schemas/journal-entry'
import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import type { KeyboardEvent } from 'react'
import { useFieldArray, useForm, useWatch } from 'react-hook-form'
import { EntryLineRow } from './EntryLineRow'

interface JournalEntryFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (entry: JournalEntry) => void
}

export const JournalEntryForm = ({
  open,
  onOpenChange,
  onSave
}: JournalEntryFormProps) => {
  const form = useForm<JournalEntry>({
    resolver: zodResolver(journalEntrySchema) as any,
    defaultValues: {
      date: new Date(),
      reference: '',
      journalCode: 'OD', // Default to Opérations Diverses
      description: '',
      lines: [
        { accountId: 0, description: '', debit: 0, credit: 0 },
        { accountId: 0, description: '', debit: 0, credit: 0 }
      ]
    }
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'lines'
  })

  // Watch lines to calculate totals
  const lines = useWatch({
    control: form.control,
    name: 'lines'
  })

  const totalDebit = lines.reduce((sum, line) => sum + (line.debit || 0), 0)
  const totalCredit = lines.reduce((sum, line) => sum + (line.credit || 0), 0)
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01

  // Keyboard navigation handler
  const handleKeyDown = (
    e: KeyboardEvent<HTMLInputElement>,
    fieldName: string,
    index: number
  ) => {
    if (e.key === 'Enter') {
      e.preventDefault()

      // If we are in the last field (credit) of the last row
      if (fieldName === 'credit' && index === fields.length - 1) {
        // Append new row
        append({ accountId: 0, description: '', debit: 0, credit: 0 })
        // Focus logic could be added here (complex with React state, skipping for MVP)
      }
    }
  }

  const onSubmit = (data: JournalEntry) => {
    onSave(data)
    form.reset()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle>New Journal Entry</DialogTitle>
          <DialogDescription>
            Create a new balanced journal entry.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col flex-1 overflow-hidden"
          >
            {/* Header Section */}
            <div className="grid grid-cols-12 gap-4 p-6 bg-muted/20 border-b">
              {/* Journal Code */}
              <div className="col-span-2">
                <FormField
                  control={form.control}
                  name="journalCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Journal</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="OD">OD (Divers)</SelectItem>
                          <SelectItem value="AN">AN (A-Nouveaux)</SelectItem>
                          <SelectItem value="VR">VR (Ventes)</SelectItem>
                          <SelectItem value="AC">AC (Achats)</SelectItem>
                          <SelectItem value="BQ">BQ (Banque)</SelectItem>
                          <SelectItem value="CA">CA (Caisse)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Date */}
              <div className="col-span-3">
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={'outline'}
                              className={cn(
                                'w-full pl-3 text-left font-normal',
                                !field.value && 'text-muted-foreground'
                              )}
                            >
                              {field.value ? (
                                format(field.value, 'PPP')
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <Icons.Calendar className="ml-auto h-4 w-4 opacity-50" />
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
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Reference */}
              <div className="col-span-3">
                <FormField
                  control={form.control}
                  name="reference"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reference</FormLabel>
                      <FormControl>
                        <Input placeholder="Ref-001" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Description */}
              <div className="col-span-4">
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Global entry description..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Lines Header */}
            <div className="grid grid-cols-12 gap-2 px-6 py-2 bg-muted border-b text-sm font-medium text-muted-foreground">
              <div className="col-span-2">Account</div>
              <div className="col-span-4">Description</div>
              <div className="col-span-2 text-end">Debit</div>
              <div className="col-span-2 text-end">Credit</div>
              <div className="col-span-2 text-center">Actions</div>
            </div>

            {/* Lines List */}
            <div className="flex-1 overflow-y-auto px-6 py-2">
              {fields.map((field, index) => (
                <EntryLineRow
                  key={field.id}
                  index={index}
                  control={form.control}
                  register={form.register}
                  remove={remove}
                  onKeyDown={handleKeyDown}
                />
              ))}

              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-4 border-dashed w-full"
                onClick={() =>
                  append({ accountId: 0, description: '', debit: 0, credit: 0 })
                }
              >
                <Icons.Plus className="w-4 h-4 mr-2" />
                Add Line
              </Button>

              {form.formState.errors.lines && (
                <p className="text-sm font-medium text-destructive mt-2">
                  {form.formState.errors.lines.message}
                </p>
              )}
            </div>

            {/* Footer Totals */}
            <div className="border-t bg-muted/20 p-6 flex flex-col gap-4">
              <div className="grid grid-cols-12 gap-2 text-sm font-bold">
                <div className="col-span-6 text-end">Totals</div>
                <div className="col-span-2 text-end text-emerald-600">
                  {totalDebit.toFixed(2)}
                </div>
                <div className="col-span-2 text-end text-emerald-600">
                  {totalCredit.toFixed(2)}
                </div>
                <div className="col-span-2"></div>
              </div>

              {!isBalanced && (
                <div className="text-center text-destructive font-medium text-sm">
                  Entry is unbalanced by{' '}
                  {Math.abs(totalDebit - totalCredit).toFixed(2)}
                </div>
              )}

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={!isBalanced}>
                  <Icons.Save className="w-4 h-4 mr-2" />
                  Save Entry
                </Button>
              </DialogFooter>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
