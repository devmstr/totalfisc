import * as React from 'react'
import { Check, ChevronsUpDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
import { useAccounts } from '@/hooks/use-accounts'
import { useTranslation } from 'react-i18next'

interface AccountSelectorProps {
  value: string | number
  onChange: (value: string) => void
  placeholder?: string
}

export function AccountSelector({
  value,
  onChange,
  placeholder
}: AccountSelectorProps) {
  const { t } = useTranslation()
  const [open, setOpen] = React.useState(false)
  const { data: accounts, isLoading } = useAccounts()

  const selectedAccount = accounts?.find(
    (account) =>
      account.id === value?.toString() ||
      account.accountNumber === value?.toString()
  )

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-mono h-9 text-start"
          disabled={isLoading}
        >
          {selectedAccount
            ? `${selectedAccount.accountNumber} - ${selectedAccount.label}`
            : placeholder || t('journal.form.placeholders.account_placeholder')}
          <ChevronsUpDown className="ms-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <Command>
          <CommandInput
            placeholder={t('journal.form.placeholders.search_account')}
          />
          <CommandList>
            <CommandEmpty>
              {t('journal.form.placeholders.no_account')}
            </CommandEmpty>
            <CommandGroup>
              {accounts?.map((account) => (
                <CommandItem
                  key={account.id}
                  value={`${account.accountNumber} ${account.label}`}
                  onSelect={() => {
                    onChange(account.id)
                    setOpen(false)
                  }}
                >
                  <Check
                    className={cn(
                      'me-2 h-4 w-4',
                      value?.toString() === account.id
                        ? 'opacity-100'
                        : 'opacity-0'
                    )}
                  />
                  <span className="font-mono me-2">
                    {account.accountNumber}
                  </span>
                  <span className="truncate">{account.label}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
