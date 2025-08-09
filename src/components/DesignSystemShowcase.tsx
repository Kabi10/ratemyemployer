'use client';

/**
 * Design System Showcase
 * Comprehensive showcase of the enhanced design system components
 */

import * as React from 'react';
import { motion } from 'framer-motion';
import { 
  Palette, 
  Type, 
  Layout, 
  Zap, 
  Eye, 
  Accessibility,
  Smartphone,
  Monitor,
  Tablet,
  Star,
  Heart,
  Download,
  Share,
  Settings,
  User,
  Mail,
  Lock,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  ChevronRight
} from 'lucide-react';
import { EnhancedButton, ButtonExamples } from './ui/enhanced-button';
import { EnhancedCard, EnhancedCardHeader, EnhancedCardContent, CardExamples } from './ui/enhanced-card';
import { EnhancedInput, InputExamples } from './ui/enhanced-input';
import { EnhancedNavbar, NavbarExample } from './ui/enhanced-navbar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';

interface DesignSystemShowcaseProps {
  className?: string;
}

export function DesignSystemShowcase({ className }: DesignSystemShowcaseProps) {
  const [activeSection, setActiveSection] = React.useState('overview');

  const sections = [
    { id: 'overview', label: 'Overview', icon: <Eye className="h-4 w-4" /> },
    { id: 'colors', label: 'Colors', icon: <Palette className="h-4 w-4" /> },
    { id: 'typography', label: 'Typography', icon: <Type className="h-4 w-4" /> },
    { id: 'components', label: 'Components', icon: <Layout className="h-4 w-4" /> },
    { id: 'patterns', label: 'Patterns', icon: <Zap className="h-4 w-4" /> },
    { id: 'accessibility', label: 'Accessibility', icon: <Accessibility className="h-4 w-4" /> },
  ];

  const colorPalette = [
    { name: 'Primary', colors: ['#3b82f6', '#1d4ed8', '#93c5fd'] },
    { name: 'Secondary', colors: ['#8b5cf6', '#7c3aed', '#c4b5fd'] },
    { name: 'Success', colors: ['#10b981', '#059669', '#6ee7b7'] },
    { name: 'Warning', colors: ['#f59e0b', '#d97706', '#fbbf24'] },
    { name: 'Error', colors: ['#ef4444', '#dc2626', '#fca5a5'] },
    { name: 'Gray', colors: ['#6b7280', '#374151', '#d1d5db'] },
  ];

  const typographyScale = [
    { name: 'Heading 1', class: 'text-6xl font-bold', sample: 'The quick brown fox' },
    { name: 'Heading 2', class: 'text-4xl font-bold', sample: 'The quick brown fox' },
    { name: 'Heading 3', class: 'text-2xl font-semibold', sample: 'The quick brown fox' },
    { name: 'Heading 4', class: 'text-xl font-semibold', sample: 'The quick brown fox' },
    { name: 'Body Large', class: 'text-lg', sample: 'The quick brown fox jumps over the lazy dog' },
    { name: 'Body', class: 'text-base', sample: 'The quick brown fox jumps over the lazy dog' },
    { name: 'Body Small', class: 'text-sm', sample: 'The quick brown fox jumps over the lazy dog' },
    { name: 'Caption', class: 'text-xs text-gray-600', sample: 'The quick brown fox jumps over the lazy dog' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            RateMyEmployer Design System
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            A comprehensive, modern design system built for scalability, accessibility, and exceptional user experiences.
          </p>
          <div className="flex justify-center space-x-4 mt-6">
            <Badge variant="secondary" className="px-3 py-1">
              <Zap className="h-3 w-3 mr-1" />
              Performance Optimized
            </Badge>
            <Badge variant="secondary" className="px-3 py-1">
              <Accessibility className="h-3 w-3 mr-1" />
              WCAG 2.1 AA
            </Badge>
            <Badge variant="secondary" className="px-3 py-1">
              <Smartphone className="h-3 w-3 mr-1" />
              Mobile First
            </Badge>
          </div>
        </motion.div>

        {/* Navigation */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {sections.map((section) => (
            <EnhancedButton
              key={section.id}
              variant={activeSection === section.id ? 'default' : 'ghost'}
              size="sm"
              leftIcon={section.icon}
              onClick={() => setActiveSection(section.id)}
            >
              {section.label}
            </EnhancedButton>
          ))}
        </div>

        {/* Content */}
        <motion.div
          key={activeSection}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeSection === 'overview' && (
            <div className="space-y-8">
              <EnhancedCard variant="gradient" size="lg">
                <EnhancedCardHeader 
                  title="Design System Overview"
                  subtitle="Modern, accessible, and performant components"
                />
                <EnhancedCardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Zap className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                      </div>
                      <h3 className="font-semibold mb-2">Performance First</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Optimized for speed with minimal bundle size and efficient rendering.
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Accessibility className="h-8 w-8 text-green-600 dark:text-green-400" />
                      </div>
                      <h3 className="font-semibold mb-2">Accessibility</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        WCAG 2.1 AA compliant with comprehensive keyboard and screen reader support.
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Layout className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                      </div>
                      <h3 className="font-semibold mb-2">Consistent</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Unified design language with systematic spacing, typography, and colors.
                      </p>
                    </div>
                  </div>
                </EnhancedCardContent>
              </EnhancedCard>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <EnhancedCard variant="elevated">
                  <EnhancedCardHeader title="Key Features" />
                  <EnhancedCardContent>
                    <ul className="space-y-2">
                      <li className="flex items-center space-x-2">
                        <ChevronRight className="h-4 w-4 text-blue-500" />
                        <span>Modern CSS-in-JS with Tailwind CSS</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <ChevronRight className="h-4 w-4 text-blue-500" />
                        <span>Framer Motion animations</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <ChevronRight className="h-4 w-4 text-blue-500" />
                        <span>Dark mode support</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <ChevronRight className="h-4 w-4 text-blue-500" />
                        <span>Responsive design</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <ChevronRight className="h-4 w-4 text-blue-500" />
                        <span>TypeScript support</span>
                      </li>
                    </ul>
                  </EnhancedCardContent>
                </EnhancedCard>

                <EnhancedCard variant="elevated">
                  <EnhancedCardHeader title="Browser Support" />
                  <EnhancedCardContent>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <Monitor className="h-8 w-8 mx-auto mb-2 text-gray-600" />
                        <p className="text-sm font-medium">Desktop</p>
                        <p className="text-xs text-gray-500">Chrome 90+, Firefox 88+, Safari 14+</p>
                      </div>
                      <div>
                        <Tablet className="h-8 w-8 mx-auto mb-2 text-gray-600" />
                        <p className="text-sm font-medium">Tablet</p>
                        <p className="text-xs text-gray-500">iOS 14+, Android 10+</p>
                      </div>
                      <div>
                        <Smartphone className="h-8 w-8 mx-auto mb-2 text-gray-600" />
                        <p className="text-sm font-medium">Mobile</p>
                        <p className="text-xs text-gray-500">iOS 14+, Android 10+</p>
                      </div>
                    </div>
                  </EnhancedCardContent>
                </EnhancedCard>
              </div>
            </div>
          )}

          {activeSection === 'colors' && (
            <div className="space-y-8">
              <EnhancedCard>
                <EnhancedCardHeader 
                  title="Color Palette"
                  subtitle="Carefully crafted colors for accessibility and brand consistency"
                />
                <EnhancedCardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {colorPalette.map((palette) => (
                      <div key={palette.name} className="space-y-3">
                        <h4 className="font-semibold">{palette.name}</h4>
                        <div className="space-y-2">
                          {palette.colors.map((color, index) => (
                            <div key={color} className="flex items-center space-x-3">
                              <div 
                                className="w-12 h-12 rounded-lg shadow-sm border border-gray-200"
                                style={{ backgroundColor: color }}
                              />
                              <div>
                                <p className="font-mono text-sm">{color}</p>
                                <p className="text-xs text-gray-500">
                                  {index === 0 ? 'Primary' : index === 1 ? 'Dark' : 'Light'}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </EnhancedCardContent>
              </EnhancedCard>
            </div>
          )}

          {activeSection === 'typography' && (
            <div className="space-y-8">
              <EnhancedCard>
                <EnhancedCardHeader 
                  title="Typography Scale"
                  subtitle="Harmonious type scale for clear information hierarchy"
                />
                <EnhancedCardContent>
                  <div className="space-y-6">
                    {typographyScale.map((type) => (
                      <div key={type.name} className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-b-0">
                        <div className="flex items-baseline justify-between mb-2">
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                            {type.name}
                          </span>
                          <span className="text-xs font-mono text-gray-500">
                            {type.class}
                          </span>
                        </div>
                        <p className={type.class}>{type.sample}</p>
                      </div>
                    ))}
                  </div>
                </EnhancedCardContent>
              </EnhancedCard>
            </div>
          )}

          {activeSection === 'components' && (
            <div className="space-y-8">
              <Tabs defaultValue="buttons" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="buttons">Buttons</TabsTrigger>
                  <TabsTrigger value="cards">Cards</TabsTrigger>
                  <TabsTrigger value="inputs">Inputs</TabsTrigger>
                  <TabsTrigger value="navigation">Navigation</TabsTrigger>
                </TabsList>
                
                <TabsContent value="buttons" className="space-y-6">
                  <EnhancedCard>
                    <EnhancedCardHeader title="Enhanced Buttons" />
                    <EnhancedCardContent>
                      <ButtonExamples />
                    </EnhancedCardContent>
                  </EnhancedCard>
                </TabsContent>
                
                <TabsContent value="cards" className="space-y-6">
                  <EnhancedCard>
                    <EnhancedCardHeader title="Enhanced Cards" />
                    <EnhancedCardContent>
                      <CardExamples />
                    </EnhancedCardContent>
                  </EnhancedCard>
                </TabsContent>
                
                <TabsContent value="inputs" className="space-y-6">
                  <EnhancedCard>
                    <EnhancedCardHeader title="Enhanced Inputs" />
                    <EnhancedCardContent>
                      <InputExamples />
                    </EnhancedCardContent>
                  </EnhancedCard>
                </TabsContent>
                
                <TabsContent value="navigation" className="space-y-6">
                  <EnhancedCard>
                    <EnhancedCardHeader title="Enhanced Navigation" />
                    <EnhancedCardContent>
                      <NavbarExample />
                    </EnhancedCardContent>
                  </EnhancedCard>
                </TabsContent>
              </Tabs>
            </div>
          )}

          {activeSection === 'patterns' && (
            <div className="space-y-8">
              <EnhancedCard>
                <EnhancedCardHeader 
                  title="Design Patterns"
                  subtitle="Common UI patterns and best practices"
                />
                <EnhancedCardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-semibold">Form Patterns</h4>
                      <div className="space-y-3">
                        <EnhancedInput label="Email" type="email" placeholder="john@example.com" />
                        <EnhancedInput label="Password" type="password" showPasswordToggle />
                        <EnhancedButton fullWidth>Sign In</EnhancedButton>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <h4 className="font-semibold">Action Patterns</h4>
                      <div className="flex flex-wrap gap-2">
                        <EnhancedButton leftIcon={<Plus className="h-4 w-4" />}>
                          Create
                        </EnhancedButton>
                        <EnhancedButton variant="outline" leftIcon={<Edit className="h-4 w-4" />}>
                          Edit
                        </EnhancedButton>
                        <EnhancedButton variant="destructive" leftIcon={<Trash2 className="h-4 w-4" />}>
                          Delete
                        </EnhancedButton>
                      </div>
                    </div>
                  </div>
                </EnhancedCardContent>
              </EnhancedCard>
            </div>
          )}

          {activeSection === 'accessibility' && (
            <div className="space-y-8">
              <EnhancedCard>
                <EnhancedCardHeader 
                  title="Accessibility Features"
                  subtitle="Built-in accessibility features for inclusive design"
                />
                <EnhancedCardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-3">Keyboard Navigation</h4>
                      <ul className="space-y-2 text-sm">
                        <li>• Tab navigation through interactive elements</li>
                        <li>• Enter/Space activation for buttons</li>
                        <li>• Arrow key navigation for menus</li>
                        <li>• Escape key to close modals/dropdowns</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-3">Screen Reader Support</h4>
                      <ul className="space-y-2 text-sm">
                        <li>• Semantic HTML elements</li>
                        <li>• ARIA labels and descriptions</li>
                        <li>• Live regions for dynamic content</li>
                        <li>• Proper heading hierarchy</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-3">Visual Accessibility</h4>
                      <ul className="space-y-2 text-sm">
                        <li>• High contrast color ratios (4.5:1+)</li>
                        <li>• Focus indicators on all interactive elements</li>
                        <li>• Reduced motion support</li>
                        <li>• Scalable text up to 200%</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-3">Touch Accessibility</h4>
                      <ul className="space-y-2 text-sm">
                        <li>• Minimum 44px touch targets</li>
                        <li>• Adequate spacing between elements</li>
                        <li>• Gesture alternatives</li>
                        <li>• Orientation support</li>
                      </ul>
                    </div>
                  </div>
                </EnhancedCardContent>
              </EnhancedCard>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

export default DesignSystemShowcase;
