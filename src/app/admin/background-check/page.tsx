'use client'

import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/layouts/AdminLayout';
import { withAuth } from '@/lib/auth/withAuth';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  ClipboardList, 
  Plus, 
  Edit, 
  Trash2, 
  Save,
  MoveUp,
  MoveDown,
  Search
} from 'lucide-react';

interface AssessmentCategory {
  id: string;
  category: string;
  factors: string[];
  order: number;
}

function AdminBackgroundCheckPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // State for categories
  const [categories, setCategories] = useState<AssessmentCategory[]>([]);
  
  // State for the category being edited
  const [editingCategory, setEditingCategory] = useState<AssessmentCategory | null>(null);
  
  // State for new factor being added
  const [newFactor, setNewFactor] = useState('');
  
  // Dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Load categories
  useEffect(() => {
    // Simulate loading data from API
    setTimeout(() => {
      // This would be replaced with actual API call
      const mockCategories: AssessmentCategory[] = [
        {
          id: '1',
          category: "Skills and Competencies",
          factors: [
            "Support for training and development",
            "Leadership's communication and adaptability",
            "Up-to-date tools and systems",
            "Emphasis on learning opportunities"
          ],
          order: 1
        },
        {
          id: '2',
          category: "Experience and Qualifications",
          factors: [
            "Industry expertise and track record",
            "Qualified management",
            "Celebration of milestones and contributions"
          ],
          order: 2
        },
        {
          id: '3',
          category: "Work Ethic and Reliability",
          factors: [
            "Meeting commitments to employees (e.g., pay, benefits)",
            "Accountability for decisions",
            "Respectful and professional practices"
          ],
          order: 3
        },
        {
          id: '4',
          category: "Cultural Fit",
          factors: [
            "Alignment with personal values",
            "Encouragement of collaboration",
            "Commitment to diversity and inclusion"
          ],
          order: 4
        }
      ];
      
      setCategories(mockCategories);
      setIsLoading(false);
    }, 1000);
  }, []);

  // Filter categories based on search query
  const filteredCategories = categories.filter(category => 
    category.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.factors.some(factor => factor.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Handle adding a new category
  const handleAddCategory = () => {
    const newCategory: AssessmentCategory = {
      id: Date.now().toString(),
      category: '',
      factors: [],
      order: categories.length + 1
    };
    
    setEditingCategory(newCategory);
    setIsDialogOpen(true);
  };

  // Handle editing a category
  const handleEditCategory = (category: AssessmentCategory) => {
    setEditingCategory({...category});
    setIsDialogOpen(true);
  };

  // Handle saving a category
  const handleSaveCategory = async () => {
    if (!editingCategory) return;
    
    if (!editingCategory.category.trim()) {
      toast({
        title: "Error",
        description: "Category name cannot be empty",
        variant: "destructive",
      });
      return;
    }
    
    setIsSaving(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Update categories state
      const isNewCategory = !categories.find(c => c.id === editingCategory.id);
      
      if (isNewCategory) {
        setCategories([...categories, editingCategory]);
      } else {
        setCategories(categories.map(c => 
          c.id === editingCategory.id ? editingCategory : c
        ));
      }
      
      // Show success message
      toast({
        title: "Success",
        description: `Category ${isNewCategory ? 'added' : 'updated'} successfully`,
        variant: "default",
      });
      
      // Close dialog
      setIsDialogOpen(false);
      setEditingCategory(null);
    } catch (error) {
      console.error('Error saving category:', error);
      toast({
        title: "Error",
        description: "Failed to save category. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Handle deleting a category
  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
      return;
    }
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Update categories state
      setCategories(categories.filter(c => c.id !== categoryId));
      
      // Show success message
      toast({
        title: "Success",
        description: "Category deleted successfully",
        variant: "default",
      });
    } catch (error) {
      console.error('Error deleting category:', error);
      toast({
        title: "Error",
        description: "Failed to delete category. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle adding a factor to the editing category
  const handleAddFactor = () => {
    if (!editingCategory || !newFactor.trim()) return;
    
    setEditingCategory({
      ...editingCategory,
      factors: [...editingCategory.factors, newFactor.trim()]
    });
    
    setNewFactor('');
  };

  // Handle removing a factor from the editing category
  const handleRemoveFactor = (index: number) => {
    if (!editingCategory) return;
    
    const updatedFactors = [...editingCategory.factors];
    updatedFactors.splice(index, 1);
    
    setEditingCategory({
      ...editingCategory,
      factors: updatedFactors
    });
  };

  // Handle moving a category up in order
  const handleMoveUp = (categoryId: string) => {
    const categoryIndex = categories.findIndex(c => c.id === categoryId);
    if (categoryIndex <= 0) return;
    
    const updatedCategories = [...categories];
    const temp = updatedCategories[categoryIndex].order;
    updatedCategories[categoryIndex].order = updatedCategories[categoryIndex - 1].order;
    updatedCategories[categoryIndex - 1].order = temp;
    
    // Sort by order
    updatedCategories.sort((a, b) => a.order - b.order);
    
    setCategories(updatedCategories);
  };

  // Handle moving a category down in order
  const handleMoveDown = (categoryId: string) => {
    const categoryIndex = categories.findIndex(c => c.id === categoryId);
    if (categoryIndex >= categories.length - 1) return;
    
    const updatedCategories = [...categories];
    const temp = updatedCategories[categoryIndex].order;
    updatedCategories[categoryIndex].order = updatedCategories[categoryIndex + 1].order;
    updatedCategories[categoryIndex + 1].order = temp;
    
    // Sort by order
    updatedCategories.sort((a, b) => a.order - b.order);
    
    setCategories(updatedCategories);
  };

  // Render loading state
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
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Background Check Management</h1>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            <Button onClick={handleAddCategory}>
              <Plus className="h-4 w-4 mr-2" />
              Add Category
            </Button>
          </div>
        </div>
        
        <Tabs defaultValue="categories" className="space-y-6">
          <TabsList className="mb-4">
            <TabsTrigger value="categories" className="flex items-center">
              <ClipboardList className="mr-2 h-4 w-4" />
              Assessment Categories
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="categories">
            <div className="space-y-4">
              {filteredCategories.length > 0 ? (
                filteredCategories.map((category) => (
                  <Card key={category.id}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{category.category}</CardTitle>
                        <div className="flex space-x-1">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleMoveUp(category.id)}
                            disabled={category.order === 1}
                          >
                            <MoveUp className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleMoveDown(category.id)}
                            disabled={category.order === categories.length}
                          >
                            <MoveDown className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <CardDescription>
                        {category.factors.length} factors
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <ul className="list-disc pl-5 space-y-1">
                        {category.factors.map((factor, index) => (
                          <li key={index} className="text-gray-700 dark:text-gray-300">
                            {factor}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                    <CardFooter className="flex justify-end space-x-2 pt-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEditCategory(category)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => handleDeleteCategory(category.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </CardFooter>
                  </Card>
                ))
              ) : (
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-8 text-center">
                  <p className="text-gray-600 dark:text-gray-400">
                    {searchQuery ? 'No categories found matching your search.' : 'No categories found. Add your first category to get started.'}
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
        
        {/* Edit Category Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>
                {editingCategory && categories.find(c => c.id === editingCategory.id) 
                  ? 'Edit Category' 
                  : 'Add New Category'
                }
              </DialogTitle>
              <DialogDescription>
                Manage assessment categories and factors for background checks.
              </DialogDescription>
            </DialogHeader>
            
            {editingCategory && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="categoryName">Category Name</Label>
                  <Input 
                    id="categoryName" 
                    value={editingCategory.category} 
                    onChange={(e) => setEditingCategory({...editingCategory, category: e.target.value})}
                    placeholder="Enter category name"
                  />
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <Label>Factors</Label>
                  
                  <div className="space-y-2">
                    {editingCategory.factors.map((factor, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Input 
                          value={factor} 
                          onChange={(e) => {
                            const updatedFactors = [...editingCategory.factors];
                            updatedFactors[index] = e.target.value;
                            setEditingCategory({...editingCategory, factors: updatedFactors});
                          }}
                        />
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleRemoveFactor(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Input 
                      value={newFactor} 
                      onChange={(e) => setNewFactor(e.target.value)}
                      placeholder="Add a new factor"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && newFactor.trim()) {
                          e.preventDefault();
                          handleAddFactor();
                        }
                      }}
                    />
                    <Button 
                      onClick={handleAddFactor}
                      disabled={!newFactor.trim()}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add
                    </Button>
                  </div>
                </div>
              </div>
            )}
            
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setIsDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSaveCategory}
                disabled={isSaving}
              >
                {isSaving ? <LoadingSpinner className="mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}

export default withAuth(AdminBackgroundCheckPage, { requiredRole: 'admin' }); 