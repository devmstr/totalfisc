import { Button } from '@/components/ui/button'
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Icons } from '../Icons'
import type { Control, UseFormRegister } from 'react-hook-form'
import type { KeyboardEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'

interface EntryLineRowProps {
  index: number
  control: Control<any>
  register: UseFormRegister<any>
  remove: (index: number) => void
  onKeyDown: (
    e: KeyboardEvent<HTMLInputElement>,
    fieldName: string,
    index: number
  ) => void
  className: {
    account: string
    desc: string
    debit: string
    credit: string
    action: string
  }
}

import { AccountSelector } from './AccountSelector'

export const EntryLineRow = ({
  index,
  control,
  register: _register,
  remove,
  onKeyDown,
  className
}: EntryLineRowProps) => {
  const { t } = useTranslation()

  return (
    <div className="flex gap-2 items-start py-2 border-b border-border/50 last:border-0 hover:bg-muted/20 transition-colors">
      {/* AccountSelector */}
      <div className={className.account}>
        <FormField
          control={control}
          name={`lines.${index}.accountId`}
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <AccountSelector
                  value={field.value}
                  onChange={field.onChange}
                  placeholder={t(
                    'journal.form.placeholders.account_placeholder'
                  )}
                />
              </FormControl>
              <FormMessage className="text-start" />
            </FormItem>
          )}
        />
      </div>

      {/* Description */}
      <div className={className.desc}>
        <FormField
          control={control}
          name={`lines.${index}.description`}
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  {...field}
                  placeholder={t('journal.form.fields.description')}
                  className="text-start"
                  onKeyDown={(e) => onKeyDown(e, 'description', index)}
                />
              </FormControl>
              <FormMessage className="text-start" />
            </FormItem>
          )}
        />
      </div>

      {/* Debit */}
      <div className={className.debit}>
        <FormField
          control={control}
          name={`lines.${index}.debit`}
          render={({ field, fieldState }) => (
            <FormItem>
              <FormControl>
                <Input
                  {...field}
                  type="number"
                  placeholder="0.00"
                  className="text-end font-mono"
                  onFocus={(e) => e.target.select()}
                  onChange={(e) =>
                    field.onChange(parseFloat(e.target.value) || 0)
                  }
                  onKeyDown={(e) => onKeyDown(e, 'debit', index)}
                  data-invalid={fieldState.invalid}
                />
              </FormControl>
              <FormMessage className="text-start" />
            </FormItem>
          )}
        />
      </div>

      {/* Credit */}
      <div className={className.credit}>
        <FormField
          control={control}
          name={`lines.${index}.credit`}
          render={({ field, fieldState }) => (
            <FormItem>
              <FormControl>
                <Input
                  {...field}
                  type="number"
                  placeholder="0.00"
                  className="text-end font-mono"
                  onFocus={(e) => e.target.select()}
                  onChange={(e) =>
                    field.onChange(parseFloat(e.target.value) || 0)
                  }
                  onKeyDown={(e) => onKeyDown(e, 'credit', index)}
                  data-invalid={fieldState.invalid}
                />
              </FormControl>
              <FormMessage className="text-start" />
            </FormItem>
          )}
        />
      </div>

      {/* Actions */}
      <div className={cn(className.action, 'flex justify-center')}>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => remove(index)}
          className="text-destructive hover:text-destructive hover:bg-destructive/10"
          tabIndex={-1}
        >
          <Icons.Trash className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
