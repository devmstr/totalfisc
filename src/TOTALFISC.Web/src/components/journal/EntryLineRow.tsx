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
}

export const EntryLineRow = ({
  index,
  control,
  remove,
  onKeyDown
}: EntryLineRowProps) => {
  return (
    <div className="grid grid-cols-12 gap-2 items-start py-2 border-b border-border/50 last:border-0 hover:bg-muted/20 transition-colors">
      {/* Account Number */}
      <div className="col-span-2">
        <FormField
          control={control}
          name={`lines.${index}.accountNumber`}
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Acc #"
                  className="font-mono"
                  onKeyDown={(e) => onKeyDown(e, 'accountNumber', index)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Description */}
      <div className="col-span-4">
        <FormField
          control={control}
          name={`lines.${index}.description`}
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Description"
                  onKeyDown={(e) => onKeyDown(e, 'description', index)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Debit */}
      <div className="col-span-2">
        <FormField
          control={control}
          name={`lines.${index}.debit`}
          render={({ field }) => (
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
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Credit */}
      <div className="col-span-2">
        <FormField
          control={control}
          name={`lines.${index}.credit`}
          render={({ field }) => (
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
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Actions */}
      <div className="col-span-2 flex justify-center">
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
