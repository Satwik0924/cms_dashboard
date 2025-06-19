// src/components/settings/CompanyInfoCard.tsx
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { 
  Building2, 
  Copy, 
  Activity, 
  CreditCard, 
  Calendar 
} from 'lucide-react';

interface CompanyInfo {
  uuid: string;
  name: string;
  subdomain: string;
  contactName: string;
  contactEmail: string;
  status: string;
  subscriptionPlan: string;
  subscriptionStatus: string;
  trialEndsAt?: string;
  createdAt: string;
}

interface CompanyInfoCardProps {
  company: CompanyInfo;
}

export default function CompanyInfoCard({ company }: CompanyInfoCardProps) {
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  return (
    <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-900">
          <Building2 className="h-5 w-5" />
          Company Information
        </CardTitle>
        <CardDescription className="text-blue-700">
          Your organization details and subscription status
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-blue-900">Company Name</label>
            <div className="flex items-center gap-2">
              <p className="text-lg font-semibold text-blue-800">{company.name}</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(company.name, 'Company name')}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-blue-900">Contact Person</label>
            <p className="text-blue-800">{company.contactName}</p>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-blue-900">Contact Email</label>
            <div className="flex items-center gap-2">
              <p className="text-blue-800">{company.contactEmail}</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(company.contactEmail, 'Email')}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-blue-900">Subdomain</label>
            <div className="flex items-center gap-2">
              <p className="text-blue-800 font-mono">{company.subdomain}</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(company.subdomain, 'Subdomain')}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        
        <Separator className="bg-blue-200" />
        
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-blue-600" />
            <span className="text-sm text-blue-700">Status:</span>
            <Badge variant={company.status === 'active' ? 'default' : 'secondary'}>
              {company.status}
            </Badge>
          </div>
          
          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-blue-600" />
            <span className="text-sm text-blue-700">Plan:</span>
            <Badge variant="outline" className="border-blue-300 text-blue-800">
              {company.subscriptionPlan}
            </Badge>
          </div>
          
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-blue-600" />
            <span className="text-sm text-blue-700">Member since:</span>
            <span className="text-sm font-medium text-blue-800">
              {new Date(company.createdAt || Date.now()).toLocaleDateString()}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}