import { Icons } from '../Icons'

export type TenantSwitcherData = {
  id: string | number
  name: string
  logo?: string
  icon?: keyof typeof Icons
  plan?: string
}
