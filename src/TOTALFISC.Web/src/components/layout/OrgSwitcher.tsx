import { useTranslation } from 'react-i18next'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../ui/select'
import { Icons } from '../Icons'

export const OrgSwitcher = () => {
  const { t } = useTranslation()

  return (
    <Select defaultValue="org1">
      <SelectTrigger className="w-full border-none shadow-none font-medium bg-white/10 text-white hover:bg-white/20 focus:ring-0">
        <div className="flex items-center gap-2 overflow-hidden">
          <div className="bg-white/20 p-1 rounded shrink-0">
            <Icons.Banknote className="w-4 h-4 text-white" />
          </div>
          <SelectValue
            placeholder={t('common.org_selector')}
            className="truncate"
          />
        </div>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="org1">TotalFisc Demo</SelectItem>
        <SelectItem value="org2">My Company SARL</SelectItem>
      </SelectContent>
    </Select>
  )
}
