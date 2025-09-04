"use client";

import { useState } from 'react';
import { AdminLayout } from '@/components/layouts/AdminLayout';
import { withAuth } from '@/lib/auth/withAuth';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useToast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { 
  Settings as SettingsIcon, 
  Palette, 
  Bell, 
  Globe, 
  Shield, 
  Mail, 
  Save,
  RefreshCw
} from 'lucide-react';

interface SiteSettings {
  siteName: string;
  siteDescription: string;
  contactEmail: string;
  maxReviewsPerPage: number;
  requireEmailVerification: boolean;
  moderateReviews: boolean;
  allowCompanyRegistration: boolean;
}

interface AppearanceSettings {
  theme: 'light' | 'dark' | 'system';
  primaryColor: string;
  accentColor: string;
  logoUrl: string;
  faviconUrl: string;
  customCss: string;
}

interface NotificationSettings {
  adminEmail: string;
  notifyOnNewReview: boolean;
  notifyOnNewCompany: boolean;
  notifyOnUserRegistration: boolean;
  dailyDigest: boolean;
  weeklyReport: boolean;
}

function AdminSettingsPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Site settings state
  const [siteSettings, setSiteSettings] = useState<SiteSettings>({
    siteName: 'RateMyEmployer',
    siteDescription: 'Find and share reviews about employers',
    contactEmail: 'admin@ratemyemployer.com',
    maxReviewsPerPage: 10,
    requireEmailVerification: true,
    moderateReviews: true,
    allowCompanyRegistration: true
  });

  // Appearance settings state
  const [appearanceSettings, setAppearanceSettings] = useState<AppearanceSettings>({
    theme: 'system',
    primaryColor: '#3B82F6',
    accentColor: '#10B981',
    logoUrl: '/logo.png',
    faviconUrl: '/favicon.ico',
    customCss: ''
  });

  // Notification settings state
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    adminEmail: 'admin@ratemyemployer.com',
    notifyOnNewReview: true,
    notifyOnNewCompany: true,
    notifyOnUserRegistration: false,
    dailyDigest: false,
    weeklyReport: true
  });

  // Handle site settings changes
  const handleSiteSettingChange = (key: keyof SiteSettings, value: any) => {
    setSiteSettings({
      ...siteSettings,
      [key]: value
    });
  };

  // Handle appearance settings changes
  const handleAppearanceSettingChange = (key: keyof AppearanceSettings, value: any) => {
    setAppearanceSettings({
      ...appearanceSettings,
      [key]: value
    });
  };

  // Handle notification settings changes
  const handleNotificationSettingChange = (key: keyof NotificationSettings, value: any) => {
    setNotificationSettings({
      ...notificationSettings,
      [key]: value
    });
  };

  // Save settings
  const saveSettings = async (settingType: 'site' | 'appearance' | 'notification') => {
    setIsSaving(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Show success message
      toast({
        title: "Settings saved",
        description: `${settingType.charAt(0).toUpperCase() + settingType.slice(1)} settings have been updated successfully.`,
        variant: "default",
      });
    } catch (error) {
      console.error(`Error saving ${settingType} settings:`, error);
      toast({
        title: "Error",
        description: `Failed to save ${settingType} settings. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Reset settings to defaults
  const resetSettings = (settingType: 'site' | 'appearance' | 'notification') => {
    if (!confirm(`Are you sure you want to reset ${settingType} settings to defaults? This cannot be undone.`)) {
      return;
    }
    
    if (settingType === 'site') {
      setSiteSettings({
        siteName: 'RateMyEmployer',
        siteDescription: 'Find and share reviews about employers',
        contactEmail: 'admin@ratemyemployer.com',
        maxReviewsPerPage: 10,
        requireEmailVerification: true,
        moderateReviews: true,
        allowCompanyRegistration: true
      });
    } else if (settingType === 'appearance') {
      setAppearanceSettings({
        theme: 'system',
        primaryColor: '#3B82F6',
        accentColor: '#10B981',
        logoUrl: '/logo.png',
        faviconUrl: '/favicon.ico',
        customCss: ''
      });
    } else if (settingType === 'notification') {
      setNotificationSettings({
        adminEmail: 'admin@ratemyemployer.com',
        notifyOnNewReview: true,
        notifyOnNewCompany: true,
        notifyOnUserRegistration: false,
        dailyDigest: false,
        weeklyReport: true
      });
    }
    
    toast({
      title: "Settings reset",
      description: `${settingType.charAt(0).toUpperCase() + settingType.slice(1)} settings have been reset to defaults.`,
      variant: "default",
    });
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Settings</h1>
        
        <Tabs defaultValue="site" className="space-y-6">
          <TabsList className="mb-4">
            <TabsTrigger value="site" className="flex items-center">
              <SettingsIcon className="mr-2 h-4 w-4" />
              Site Settings
            </TabsTrigger>
            <TabsTrigger value="appearance" className="flex items-center">
              <Palette className="mr-2 h-4 w-4" />
              Appearance
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center">
              <Bell className="mr-2 h-4 w-4" />
              Notifications
            </TabsTrigger>
          </TabsList>
          
          {/* Site Settings */}
          <TabsContent value="site">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Globe className="mr-2 h-5 w-5" />
                  Site Configuration
                </CardTitle>
                <CardDescription>
                  Configure general settings for your RateMyEmployer site
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="siteName">Site Name</Label>
                    <Input 
                      id="siteName" 
                      value={siteSettings.siteName} 
                      onChange={(e) => handleSiteSettingChange('siteName', e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="contactEmail">Contact Email</Label>
                    <Input 
                      id="contactEmail" 
                      type="email"
                      value={siteSettings.contactEmail} 
                      onChange={(e) => handleSiteSettingChange('contactEmail', e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="siteDescription">Site Description</Label>
                  <Textarea 
                    id="siteDescription" 
                    value={siteSettings.siteDescription} 
                    onChange={(e) => handleSiteSettingChange('siteDescription', e.target.value)}
                    rows={3}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="maxReviewsPerPage">Max Reviews Per Page</Label>
                  <Input 
                    id="maxReviewsPerPage" 
                    type="number"
                    min="5"
                    max="50"
                    value={siteSettings.maxReviewsPerPage.toString()} 
                    onChange={(e) => handleSiteSettingChange('maxReviewsPerPage', parseInt(e.target.value))}
                  />
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium flex items-center">
                    <Shield className="mr-2 h-5 w-5" />
                    Security & Moderation
                  </h3>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="requireEmailVerification" className="font-medium">Require Email Verification</Label>
                      <p className="text-sm text-gray-500">Users must verify their email before posting reviews</p>
                    </div>
                    <Switch 
                      id="requireEmailVerification" 
                      checked={siteSettings.requireEmailVerification}
                      onCheckedChange={(checked) => handleSiteSettingChange('requireEmailVerification', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="moderateReviews" className="font-medium">Moderate Reviews</Label>
                      <p className="text-sm text-gray-500">All reviews require admin approval before publishing</p>
                    </div>
                    <Switch 
                      id="moderateReviews" 
                      checked={siteSettings.moderateReviews}
                      onCheckedChange={(checked) => handleSiteSettingChange('moderateReviews', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="allowCompanyRegistration" className="font-medium">Allow Company Registration</Label>
                      <p className="text-sm text-gray-500">Companies can register and claim their profiles</p>
                    </div>
                    <Switch 
                      id="allowCompanyRegistration" 
                      checked={siteSettings.allowCompanyRegistration}
                      onCheckedChange={(checked) => handleSiteSettingChange('allowCompanyRegistration', checked)}
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button 
                  variant="outline" 
                  onClick={() => resetSettings('site')}
                  className="flex items-center"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Reset to Defaults
                </Button>
                <Button 
                  onClick={() => saveSettings('site')}
                  disabled={isSaving}
                  className="flex items-center"
                >
                  {isSaving ? <LoadingSpinner className="mr-2" /> : <Save className="mr-2 h-4 w-4" />}
                  Save Changes
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          {/* Appearance Settings */}
          <TabsContent value="appearance">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Palette className="mr-2 h-5 w-5" />
                  Appearance Settings
                </CardTitle>
                <CardDescription>
                  Customize the look and feel of your RateMyEmployer site
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="theme">Theme</Label>
                  <Select 
                    value={appearanceSettings.theme} 
                    onValueChange={(value) => handleAppearanceSettingChange('theme', value)}
                  >
                    <SelectTrigger id="theme">
                      <SelectValue placeholder="Select theme" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="system">System (follows user preference)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="primaryColor">Primary Color</Label>
                    <div className="flex items-center space-x-2">
                      <Input 
                        id="primaryColor" 
                        value={appearanceSettings.primaryColor} 
                        onChange={(e) => handleAppearanceSettingChange('primaryColor', e.target.value)}
                      />
                      <div 
                        className="w-10 h-10 rounded-md border"
                        style={{ backgroundColor: appearanceSettings.primaryColor }}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="accentColor">Accent Color</Label>
                    <div className="flex items-center space-x-2">
                      <Input 
                        id="accentColor" 
                        value={appearanceSettings.accentColor} 
                        onChange={(e) => handleAppearanceSettingChange('accentColor', e.target.value)}
                      />
                      <div 
                        className="w-10 h-10 rounded-md border"
                        style={{ backgroundColor: appearanceSettings.accentColor }}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="logoUrl">Logo URL</Label>
                    <Input 
                      id="logoUrl" 
                      value={appearanceSettings.logoUrl} 
                      onChange={(e) => handleAppearanceSettingChange('logoUrl', e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="faviconUrl">Favicon URL</Label>
                    <Input 
                      id="faviconUrl" 
                      value={appearanceSettings.faviconUrl} 
                      onChange={(e) => handleAppearanceSettingChange('faviconUrl', e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="customCss">Custom CSS</Label>
                  <Textarea 
                    id="customCss" 
                    value={appearanceSettings.customCss} 
                    onChange={(e) => handleAppearanceSettingChange('customCss', e.target.value)}
                    rows={5}
                    placeholder="/* Add your custom CSS here */"
                    className="font-mono text-sm"
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button 
                  variant="outline" 
                  onClick={() => resetSettings('appearance')}
                  className="flex items-center"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Reset to Defaults
                </Button>
                <Button 
                  onClick={() => saveSettings('appearance')}
                  disabled={isSaving}
                  className="flex items-center"
                >
                  {isSaving ? <LoadingSpinner className="mr-2" /> : <Save className="mr-2 h-4 w-4" />}
                  Save Changes
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          {/* Notification Settings */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bell className="mr-2 h-5 w-5" />
                  Notification Settings
                </CardTitle>
                <CardDescription>
                  Configure when and how you receive notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="adminEmail" className="flex items-center">
                    <Mail className="mr-2 h-4 w-4" />
                    Admin Email for Notifications
                  </Label>
                  <Input 
                    id="adminEmail" 
                    type="email"
                    value={notificationSettings.adminEmail} 
                    onChange={(e) => handleNotificationSettingChange('adminEmail', e.target.value)}
                  />
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Email Notifications</h3>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="notifyOnNewReview" className="font-medium">New Review Notifications</Label>
                      <p className="text-sm text-gray-500">Receive an email when a new review is submitted</p>
                    </div>
                    <Switch 
                      id="notifyOnNewReview" 
                      checked={notificationSettings.notifyOnNewReview}
                      onCheckedChange={(checked) => handleNotificationSettingChange('notifyOnNewReview', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="notifyOnNewCompany" className="font-medium">New Company Notifications</Label>
                      <p className="text-sm text-gray-500">Receive an email when a new company is added</p>
                    </div>
                    <Switch 
                      id="notifyOnNewCompany" 
                      checked={notificationSettings.notifyOnNewCompany}
                      onCheckedChange={(checked) => handleNotificationSettingChange('notifyOnNewCompany', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="notifyOnUserRegistration" className="font-medium">User Registration Notifications</Label>
                      <p className="text-sm text-gray-500">Receive an email when a new user registers</p>
                    </div>
                    <Switch 
                      id="notifyOnUserRegistration" 
                      checked={notificationSettings.notifyOnUserRegistration}
                      onCheckedChange={(checked) => handleNotificationSettingChange('notifyOnUserRegistration', checked)}
                    />
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Summary Reports</h3>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="dailyDigest" className="font-medium">Daily Digest</Label>
                      <p className="text-sm text-gray-500">Receive a daily summary of all activity</p>
                    </div>
                    <Switch 
                      id="dailyDigest" 
                      checked={notificationSettings.dailyDigest}
                      onCheckedChange={(checked) => handleNotificationSettingChange('dailyDigest', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="weeklyReport" className="font-medium">Weekly Report</Label>
                      <p className="text-sm text-gray-500">Receive a weekly summary with analytics</p>
                    </div>
                    <Switch 
                      id="weeklyReport" 
                      checked={notificationSettings.weeklyReport}
                      onCheckedChange={(checked) => handleNotificationSettingChange('weeklyReport', checked)}
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button 
                  variant="outline" 
                  onClick={() => resetSettings('notification')}
                  className="flex items-center"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Reset to Defaults
                </Button>
                <Button 
                  onClick={() => saveSettings('notification')}
                  disabled={isSaving}
                  className="flex items-center"
                >
                  {isSaving ? <LoadingSpinner className="mr-2" /> : <Save className="mr-2 h-4 w-4" />}
                  Save Changes
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}

export default withAuth(AdminSettingsPage, { requiredRole: 'admin' }); 