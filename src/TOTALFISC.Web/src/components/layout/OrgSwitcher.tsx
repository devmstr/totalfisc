import * as React from 'react'
import { ChevronsUpDown, Plus } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger
} from '../ui/dropdown-menu'
import { type TenantSwitcherData } from './types'
import { Icons } from '../Icons'
import { cn } from '@/lib/utils'
import { Button } from '../ui/button'

type OrgSwitcherProps = {
  teams: TenantSwitcherData[]
}

export function OrgSwitcher({ teams }: OrgSwitcherProps) {
  // ✅ safer init (handles empty array or async load)
  const [activeTeam, setActiveTeam] = React.useState<
    TenantSwitcherData | undefined
  >(() => teams?.[0])

  React.useEffect(() => {
    if (!activeTeam && teams?.length) setActiveTeam(teams[0])
  }, [teams, activeTeam])

  if (!activeTeam) return null

  const ActiveIcon = activeTeam.icon
    ? Icons[activeTeam.icon]
    : Icons['Building']

  // ✅ placeholders
  const activeName = activeTeam.name?.trim() || 'Workspace'
  const activePlan = activeTeam.plan?.trim() || 'Free'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          size="lg"
          variant={'ghost'}
          className="w-full justify-start gap-2 px-2 py-1 text-foreground hover:bg-foreground/10 hover:text-foreground"
        >
          <div
            className={cn(
              'flex aspect-square size-8.5 items-center justify-center overflow-hidden rounded-lg shrink-0',
              activeTeam.logo
                ? 'bg-transparent'
                : 'bg-primary text-primary-foreground'
            )}
          >
            {activeTeam.logo ? (
              <img
                src={activeTeam.logo}
                alt={activeName}
                width={32}
                height={32}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            ) : (
              <ActiveIcon className="relative size-5.5" />
            )}
          </div>

          <div className="grid flex-1 text-start text-sm leading-tight overflow-hidden">
            <span className="truncate font-semibold">{activeName}</span>
            <span className="truncate text-xs opacity-70">{activePlan}</span>
          </div>

          <ChevronsUpDown className="ms-auto size-4 opacity-50 shrink-0" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="w-56 rounded-lg"
        align="start"
        sideOffset={4}
      >
        <DropdownMenuLabel className="text-xs text-muted-foreground">
          Workspaces
        </DropdownMenuLabel>

        {teams.map((team, index) => {
          const TeamIcon = team.icon ? Icons[team.icon] : Icons['Building']
          const teamName = team.name?.trim() || 'Workspace'
          const teamPlan = team.plan?.trim() || 'Free'

          return (
            <DropdownMenuItem
              key={`${team.id ?? teamName}-${index}`}
              onClick={() => setActiveTeam(team)}
              className="gap-2 p-2"
            >
              {/* ✅ item logo/icon (NOT active team icon) */}
              <div
                className={cn(
                  'flex size-6 items-center justify-center overflow-hidden rounded-md border shrink-0',
                  team.logo ? 'bg-transparent' : 'bg-muted'
                )}
              >
                {team.logo ? (
                  <img
                    src={team.logo}
                    alt={teamName}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <TeamIcon className="size-4 shrink-0 text-muted-foreground" />
                )}
              </div>

              <div className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-sm font-medium">{teamName}</span>
                <span className="truncate text-xs text-muted-foreground">
                  {teamPlan}
                </span>
              </div>

              <DropdownMenuShortcut>⌘ {index + 1}</DropdownMenuShortcut>
            </DropdownMenuItem>
          )
        })}

        <DropdownMenuSeparator />

        <DropdownMenuItem className="gap-2 p-2 focus:bg-sidebar-accent">
          <div className="flex size-6 items-center justify-center rounded-md border bg-background shrink-0">
            <Plus className="size-4 text-muted-foreground" />
          </div>
          <div className="font-medium text-muted-foreground text-sm">
            Add workspace
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
