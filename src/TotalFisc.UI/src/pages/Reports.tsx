import { useTranslation } from 'react-i18next'
import { Icons, type IconType } from '../components/Icons'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../components/ui/select'

export const Reports = () => {
  const { t } = useTranslation()

  const reports = [
    {
      id: 1,
      title: t('reports.trial_balance'),
      description: t('mock_data.descriptions.trial_balance_desc'),
      icon: 'FileText' as IconType,
      color: 'text-blue-500',
      bgColor: 'bg-blue-100'
    },
    {
      id: 2,
      title: t('reports.general_ledger'),
      description: t('mock_data.descriptions.general_ledger_desc'),
      icon: 'Banknote' as IconType,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-100'
    },
    {
      id: 3,
      title: t('reports.income_statement'),
      description: t('mock_data.descriptions.income_statement_desc'),
      icon: 'ShoppingCart' as IconType,
      color: 'text-purple-500',
      bgColor: 'bg-purple-100'
    },
    {
      id: 4,
      title: t('reports.balance_sheet'),
      description: t('mock_data.descriptions.balance_sheet_desc'),
      icon: 'ListOrdered' as IconType,
      color: 'text-amber-500',
      bgColor: 'bg-amber-100'
    },
    {
      id: 5,
      title: t('reports.cash_flow'),
      description: t('mock_data.descriptions.cash_flow_desc'),
      icon: 'Banknote' as IconType,
      color: 'text-cyan-500',
      bgColor: 'bg-cyan-100'
    },
    {
      id: 6,
      title: t('reports.vat_report'),
      description: t('mock_data.descriptions.vat_report_desc'),
      icon: 'FileText' as IconType,
      color: 'text-red-500',
      bgColor: 'bg-red-100'
    }
  ]

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {t('reports.title')}
          </h1>
          <p className="text-muted-foreground mt-1">{t('reports.subtitle')}</p>
        </div>
      </div>

      {/* Report Generator Card */}
      <Card className="shadow-sm border-border">
        <CardHeader>
          <CardTitle className="text-lg">{t('reports.generate')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex-1 min-w-[150px]">
              <label className="text-sm font-medium text-muted-foreground mb-2 block">
                {t('reports.fiscal_year')}
              </label>
              <Select defaultValue="2026">
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2026">2026</SelectItem>
                  <SelectItem value="2025">2025</SelectItem>
                  <SelectItem value="2024">2024</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1 min-w-[200px]">
              <label className="text-sm font-medium text-muted-foreground mb-2 block">
                {t('reports.period')}
              </label>
              <Select defaultValue="all">
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('periods.all')}</SelectItem>
                  <SelectItem value="q1">{t('periods.q1')}</SelectItem>
                  <SelectItem value="q2">{t('periods.q2')}</SelectItem>
                  <SelectItem value="q3">{t('periods.q3')}</SelectItem>
                  <SelectItem value="q4">{t('periods.q4')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1 min-w-[200px]">
              <label className="text-sm font-medium text-muted-foreground mb-2 block">
                {t('reports.account')}
              </label>
              <Select defaultValue="all">
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {t('reports.all_accounts')}
                  </SelectItem>
                  <SelectItem value="class1">
                    {t('account_classes.class1')}
                  </SelectItem>
                  <SelectItem value="class2">
                    {t('account_classes.class2')}
                  </SelectItem>
                  <SelectItem value="class3">
                    {t('account_classes.class3')}
                  </SelectItem>
                  <SelectItem value="class4">
                    {t('account_classes.class4')}
                  </SelectItem>
                  <SelectItem value="class5">
                    {t('account_classes.class5')}
                  </SelectItem>
                  <SelectItem value="class6">
                    {t('account_classes.class6')}
                  </SelectItem>
                  <SelectItem value="class7">
                    {t('account_classes.class7')}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex-[2] min-w-[300px] flex gap-2">
              <Button variant="outline" className="flex-1">
                <Icons.FileText className="w-4 h-4 me-2" />
                {t('reports.export_pdf')}
              </Button>
              <Button variant="outline" className="flex-1">
                <Icons.FileText className="w-4 h-4 me-2" />
                {t('reports.export_excel')}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Available Reports Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {reports.map((report) => {
          const IconComponent = Icons[report.icon as IconType]
          return (
            <Card
              key={report.id}
              className="shadow-sm border-border hover:shadow-md transition-shadow cursor-pointer group"
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg ${report.bgColor}`}>
                    <IconComponent className={`h-6 w-6 ${report.color}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors truncate">
                      {report.title}
                    </h3>
                    <p
                      className="text-sm text-muted-foreground line-clamp-2"
                      title={report.description}
                    >
                      {report.description}
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-3 px-0 text-primary hover:text-primary/80"
                    >
                      {t('reports.generate')}
                      <Icons.ChevronDown className="w-4 h-4 ms-1 -rotate-90" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Info Card */}
      <Card className="shadow-sm bg-blue-50/50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Icons.FileText className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900 mb-1">
                {t('mock_data.descriptions.scf_compliance_title')}
              </h4>
              <p className="text-sm text-blue-700">
                {t('mock_data.descriptions.scf_compliance_text')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
