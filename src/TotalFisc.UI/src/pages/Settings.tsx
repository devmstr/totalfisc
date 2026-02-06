import { useTranslation } from 'react-i18next'
import { Icons } from '../components/Icons'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'

export const Settings = () => {
  const { t } = useTranslation()

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          {t('settings.title')}
        </h1>
        <p className="text-muted-foreground mt-1">{t('settings.subtitle')}</p>
      </div>

      <Tabs defaultValue="company" className="w-full">
        <TabsList className="w-full justify-start h-auto p-1 bg-muted/50 rounded-lg mb-6 flex-wrap">
          <TabsTrigger
            value="company"
            className="flex items-center gap-2 px-4 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all"
          >
            <Icons.Building className="w-4 h-4" />
            {t('settings.company_profile')}
          </TabsTrigger>
          <TabsTrigger
            value="preferences"
            className="flex items-center gap-2 px-4 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all"
          >
            <Icons.Settings className="w-4 h-4" />
            {t('settings.preferences')}
          </TabsTrigger>
          <TabsTrigger
            value="backup"
            className="flex items-center gap-2 px-4 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all"
          >
            <Icons.Save className="w-4 h-4" />
            {t('settings.backup_restore')}
          </TabsTrigger>
        </TabsList>

        {/* Company Profile Tab */}
        <TabsContent value="company" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="border-border shadow-sm">
              <CardHeader>
                <CardTitle>{t('settings.general_info')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">
                    {t('settings.company_name')}
                  </Label>
                  <Input id="companyName" defaultValue="Mon Entreprise SARL" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">{t('settings.address')}</Label>
                  <Input
                    id="address"
                    defaultValue="123 Rue Didouche Mourad, Alger"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">{t('settings.phone')}</Label>
                  <Input id="phone" defaultValue="+213 21 00 00 00" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">{t('settings.email')}</Label>
                  <Input id="email" defaultValue="contact@monentreprise.dz" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-border shadow-sm">
              <CardHeader>
                <CardTitle>{t('settings.tax_info')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nif">{t('settings.nif')}</Label>
                  <Input id="nif" defaultValue="000116012345678" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nis">{t('settings.nis')}</Label>
                  <Input id="nis" defaultValue="000116012345678" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rc">{t('settings.rc')}</Label>
                  <Input id="rc" defaultValue="16/00-1234567B16" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ai">{t('settings.ai')}</Label>
                  <Input id="ai" defaultValue="16012345678" />
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="flex justify-end">
            <Button>{t('common.save')}</Button>
          </div>
        </TabsContent>

        {/* Preferences Tab */}
        <TabsContent value="preferences">
          <Card className="border-border shadow-sm">
            <CardHeader>
              <CardTitle>{t('settings.app_preferences')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                {t('settings.coming_soon')}
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Backup Tab */}
        <TabsContent value="backup">
          <Card className="border-border shadow-sm">
            <CardHeader>
              <CardTitle>{t('settings.backup_restore')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">
                      {t('settings.create_backup')}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {t('settings.backup_desc')}
                    </p>
                  </div>
                  <Button variant="outline">
                    <Icons.Save className="w-4 h-4 me-2" />
                    {t('settings.backup_now')}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
