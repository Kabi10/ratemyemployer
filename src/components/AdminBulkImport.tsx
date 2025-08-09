'use client';

/**
 * Admin Bulk Import Component
 * Allows administrators to bulk import companies from various sources
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, Database, Building2, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import { 
  populateFortune500Companies, 
  populateTechStartups, 
  bulkImportFromCSV 
} from '@/lib/companyDataSources';

interface ImportResult {
  success: number;
  skipped: number;
  errors: number;
}

interface ImportStatus {
  isRunning: boolean;
  progress: number;
  currentStep: string;
  result?: ImportResult;
  error?: string;
}

export function AdminBulkImport() {
  const [csvData, setCsvData] = useState('');
  const [importStatus, setImportStatus] = useState<ImportStatus>({
    isRunning: false,
    progress: 0,
    currentStep: '',
  });

  const resetStatus = () => {
    setImportStatus({
      isRunning: false,
      progress: 0,
      currentStep: '',
    });
  };

  const updateStatus = (progress: number, currentStep: string) => {
    setImportStatus(prev => ({
      ...prev,
      progress,
      currentStep,
    }));
  };

  const handleFortune500Import = async () => {
    setImportStatus({ isRunning: true, progress: 0, currentStep: 'Starting Fortune 500 import...' });
    
    try {
      updateStatus(25, 'Fetching Fortune 500 company data...');
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate delay
      
      updateStatus(50, 'Processing company information...');
      const result = await populateFortune500Companies();
      
      updateStatus(100, 'Fortune 500 import completed!');
      setImportStatus(prev => ({ ...prev, result, isRunning: false }));
    } catch (error) {
      setImportStatus(prev => ({
        ...prev,
        isRunning: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }));
    }
  };

  const handleTechStartupsImport = async () => {
    setImportStatus({ isRunning: true, progress: 0, currentStep: 'Starting tech startups import...' });
    
    try {
      updateStatus(25, 'Fetching tech startup data...');
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate delay
      
      updateStatus(50, 'Processing startup information...');
      const result = await populateTechStartups();
      
      updateStatus(100, 'Tech startups import completed!');
      setImportStatus(prev => ({ ...prev, result, isRunning: false }));
    } catch (error) {
      setImportStatus(prev => ({
        ...prev,
        isRunning: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }));
    }
  };

  const handleCSVImport = async () => {
    if (!csvData.trim()) {
      alert('Please enter CSV data before importing');
      return;
    }

    setImportStatus({ isRunning: true, progress: 0, currentStep: 'Starting CSV import...' });
    
    try {
      updateStatus(25, 'Parsing CSV data...');
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate delay
      
      updateStatus(50, 'Validating company data...');
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate delay
      
      updateStatus(75, 'Importing companies to database...');
      const result = await bulkImportFromCSV(csvData);
      
      updateStatus(100, 'CSV import completed!');
      setImportStatus(prev => ({ ...prev, result, isRunning: false }));
    } catch (error) {
      setImportStatus(prev => ({
        ...prev,
        isRunning: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }));
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'text/csv') {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setCsvData(content);
      };
      reader.readAsText(file);
    } else {
      alert('Please select a valid CSV file');
    }
  };

  const ResultDisplay = ({ result }: { result: ImportResult }) => (
    <Alert className="mt-4">
      <CheckCircle className="h-4 w-4" />
      <AlertDescription>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="text-green-600">
            <strong>Added:</strong> {result.success}
          </div>
          <div className="text-yellow-600">
            <strong>Skipped:</strong> {result.skipped}
          </div>
          <div className="text-red-600">
            <strong>Errors:</strong> {result.errors}
          </div>
        </div>
      </AlertDescription>
    </Alert>
  );

  const ErrorDisplay = ({ error }: { error: string }) => (
    <Alert variant="destructive" className="mt-4">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>{error}</AlertDescription>
    </Alert>
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Database className="h-5 w-5 mr-2" />
            Bulk Company Import
          </CardTitle>
          <CardDescription>
            Import companies from various data sources to populate the database quickly.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="presets" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="presets">Preset Data Sources</TabsTrigger>
              <TabsTrigger value="csv">CSV Import</TabsTrigger>
            </TabsList>
            
            <TabsContent value="presets" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center">
                      <Building2 className="h-4 w-4 mr-2" />
                      Fortune 500 Companies
                    </CardTitle>
                    <CardDescription>
                      Import a curated list of Fortune 500 companies with industry and location data.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button 
                      onClick={handleFortune500Import}
                      disabled={importStatus.isRunning}
                      className="w-full"
                    >
                      Import Fortune 500
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center">
                      <Building2 className="h-4 w-4 mr-2" />
                      Tech Startups
                    </CardTitle>
                    <CardDescription>
                      Import popular technology startups and scale-ups with current information.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button 
                      onClick={handleTechStartupsImport}
                      disabled={importStatus.isRunning}
                      className="w-full"
                    >
                      Import Tech Startups
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="csv" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <FileText className="h-4 w-4 mr-2" />
                    CSV Data Import
                  </CardTitle>
                  <CardDescription>
                    Upload a CSV file or paste CSV data directly. Expected columns: name, industry, location, website, description, size.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Upload CSV File</label>
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleFileUpload}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                  </div>
                  
                  <div className="text-center text-gray-500">or</div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Paste CSV Data</label>
                    <Textarea
                      value={csvData}
                      onChange={(e) => setCsvData(e.target.value)}
                      placeholder="name,industry,location,website,description,size
Apple Inc.,Technology,Cupertino CA,https://apple.com,Technology company,10000+
Microsoft Corporation,Technology,Redmond WA,https://microsoft.com,Software company,10000+"
                      rows={8}
                      className="font-mono text-sm"
                    />
                  </div>
                  
                  <Button 
                    onClick={handleCSVImport}
                    disabled={importStatus.isRunning || !csvData.trim()}
                    className="w-full"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Import CSV Data
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Progress Display */}
          {importStatus.isRunning && (
            <Card className="mt-4">
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{importStatus.currentStep}</span>
                    <span>{importStatus.progress}%</span>
                  </div>
                  <Progress value={importStatus.progress} className="w-full" />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Results Display */}
          {importStatus.result && <ResultDisplay result={importStatus.result} />}
          {importStatus.error && <ErrorDisplay error={importStatus.error} />}

          {/* Reset Button */}
          {(importStatus.result || importStatus.error) && (
            <Button variant="outline" onClick={resetStatus} className="mt-4">
              Reset
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Usage Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Import Guidelines</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-gray-600">
          <p><strong>Fortune 500:</strong> Imports well-known large corporations with verified information.</p>
          <p><strong>Tech Startups:</strong> Imports popular technology companies and startups.</p>
          <p><strong>CSV Format:</strong> Use columns: name (required), industry, location, website, description, size.</p>
          <p><strong>Duplicates:</strong> Companies with existing names will be skipped automatically.</p>
          <p><strong>Validation:</strong> All data is validated before insertion into the database.</p>
        </CardContent>
      </Card>
    </div>
  );
}
