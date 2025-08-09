/**
 * Company Suggestion System
 * Allows users to suggest companies and admins to approve them
 */

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Check, X, Clock, Building2 } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { FreeLocationAutocomplete } from './FreeLocationAutocomplete';

interface CompanySuggestion {
  id: string;
  name: string;
  industry: string;
  location: string;
  website?: string;
  description?: string;
  size?: string;
  suggested_by: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  admin_notes?: string;
}

interface CompanySuggestionSystemProps {
  isAdmin?: boolean;
}

const INDUSTRIES = [
  'Technology', 'Healthcare', 'Education', 'Finance', 
  'Manufacturing', 'Retail', 'Other'
];

const COMPANY_SIZES = [
  '1-50', '50-200', '200-1000', '1000+'
];

export function CompanySuggestionSystem({ isAdmin = false }: CompanySuggestionSystemProps) {
  const [suggestions, setSuggestions] = useState<CompanySuggestion[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    industry: '',
    location: '',
    website: '',
    description: '',
    size: '',
  });

  useEffect(() => {
    if (isAdmin) {
      fetchSuggestions();
    }
  }, [isAdmin]);

  const fetchSuggestions = async () => {
    try {
      const { data, error } = await supabase
        .from('company_suggestions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSuggestions(data || []);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    }
  };

  const handleSubmitSuggestion = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        alert('Please log in to suggest a company');
        return;
      }

      const { error } = await supabase
        .from('company_suggestions')
        .insert({
          ...formData,
          suggested_by: session.user.id,
          status: 'pending',
        });

      if (error) throw error;

      alert('Company suggestion submitted successfully!');
      setFormData({
        name: '',
        industry: '',
        location: '',
        website: '',
        description: '',
        size: '',
      });
      setShowForm(false);
    } catch (error) {
      console.error('Error submitting suggestion:', error);
      alert('Failed to submit suggestion. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApproveSuggestion = async (suggestion: CompanySuggestion) => {
    try {
      // Create the company
      const { error: companyError } = await supabase
        .from('companies')
        .insert({
          name: suggestion.name,
          industry: suggestion.industry,
          location: suggestion.location,
          website: suggestion.website,
          description: suggestion.description,
          size: suggestion.size,
          verified: false,
        });

      if (companyError) throw companyError;

      // Update suggestion status
      const { error: updateError } = await supabase
        .from('company_suggestions')
        .update({ status: 'approved' })
        .eq('id', suggestion.id);

      if (updateError) throw updateError;

      fetchSuggestions();
      alert('Company suggestion approved and added to database!');
    } catch (error) {
      console.error('Error approving suggestion:', error);
      alert('Failed to approve suggestion. Please try again.');
    }
  };

  const handleRejectSuggestion = async (suggestionId: string, notes?: string) => {
    try {
      const { error } = await supabase
        .from('company_suggestions')
        .update({ 
          status: 'rejected',
          admin_notes: notes 
        })
        .eq('id', suggestionId);

      if (error) throw error;

      fetchSuggestions();
      alert('Company suggestion rejected.');
    } catch (error) {
      console.error('Error rejecting suggestion:', error);
      alert('Failed to reject suggestion. Please try again.');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-600"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'approved':
        return <Badge variant="outline" className="text-green-600 border-green-600"><Check className="h-3 w-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="text-red-600 border-red-600"><X className="h-3 w-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* User Suggestion Form */}
      {!isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building2 className="h-5 w-5 mr-2" />
              Suggest a Company
            </CardTitle>
            <CardDescription>
              Don't see your company listed? Suggest it and we'll review it for addition to our database.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!showForm ? (
              <Button onClick={() => setShowForm(true)} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Suggest a Company
              </Button>
            ) : (
              <form onSubmit={handleSubmitSuggestion} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Company Name *</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter company name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Industry *</label>
                  <Select value={formData.industry} onValueChange={(value) => setFormData({ ...formData, industry: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                    <SelectContent>
                      {INDUSTRIES.map((industry) => (
                        <SelectItem key={industry} value={industry}>
                          {industry}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Location *</label>
                  <FreeLocationAutocomplete
                    value={formData.location}
                    onChange={(value) => setFormData({ ...formData, location: value })}
                    placeholder="Enter company location"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Website</label>
                  <Input
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    placeholder="https://company.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Company Size</label>
                  <Select value={formData.size} onValueChange={(value) => setFormData({ ...formData, size: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select company size" />
                    </SelectTrigger>
                    <SelectContent>
                      {COMPANY_SIZES.map((size) => (
                        <SelectItem key={size} value={size}>
                          {size} employees
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief description of the company"
                    rows={3}
                  />
                </div>

                <div className="flex gap-2">
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Submitting...' : 'Submit Suggestion'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      )}

      {/* Admin Review Panel */}
      {isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle>Company Suggestions Review</CardTitle>
            <CardDescription>
              Review and approve user-submitted company suggestions.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {suggestions.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No company suggestions found.</p>
            ) : (
              <div className="space-y-4">
                {suggestions.map((suggestion) => (
                  <div key={suggestion.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-lg">{suggestion.name}</h3>
                      {getStatusBadge(suggestion.status)}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                      <div><strong>Industry:</strong> {suggestion.industry}</div>
                      <div><strong>Location:</strong> {suggestion.location}</div>
                      {suggestion.website && <div><strong>Website:</strong> {suggestion.website}</div>}
                      {suggestion.size && <div><strong>Size:</strong> {suggestion.size} employees</div>}
                    </div>

                    {suggestion.description && (
                      <p className="text-sm text-gray-700 mb-3">{suggestion.description}</p>
                    )}

                    <div className="text-xs text-gray-500 mb-3">
                      Suggested on {new Date(suggestion.created_at).toLocaleDateString()}
                    </div>

                    {suggestion.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleApproveSuggestion(suggestion)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRejectSuggestion(suggestion.id)}
                          className="text-red-600 border-red-600 hover:bg-red-50"
                        >
                          <X className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    )}

                    {suggestion.admin_notes && (
                      <div className="mt-3 p-2 bg-gray-50 rounded text-sm">
                        <strong>Admin Notes:</strong> {suggestion.admin_notes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
