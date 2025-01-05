import { z } from 'zod';

// Configuration schema
const configSchema = z.object({
  documentation: z.object({
    updateTriggers: z.array(z.enum(['commit', 'build', 'error', 'test', 'deploy'])),
    templates: z.string(),
    output: z.string(),
    patterns: z.object({
      api: z.array(z.string()),
      components: z.array(z.string()),
      database: z.array(z.string()),
      errors: z.array(z.string())
    })
  }),
  scripts: z.object({
    generators: z.array(z.enum(['test', 'performance', 'utility', 'database', 'deployment'])),
    output: z.string(),
    naming: z.enum(['kebab-case', 'camelCase', 'PascalCase']),
    templates: z.string()
  }),
  monitoring: z.object({
    watchPaths: z.array(z.string()),
    ignorePaths: z.array(z.string()),
    debounceMs: z.number(),
    errorPatterns: z.array(z.string())
  }),
  generation: z.object({
    autoCommit: z.boolean(),
    createPR: z.boolean(),
    notifyOnSlack: z.boolean(),
    prTemplate: z.string()
  })
});

// Default configuration
export const config = {
  documentation: {
    updateTriggers: ['commit', 'build', 'error', 'test', 'deploy'],
    templates: './resources/templates',
    output: './resources',
    patterns: {
      api: [
        'src/app/api/**/*.ts',
        'src/app/api/**/*.tsx'
      ],
      components: [
        'src/components/**/*.tsx',
        'src/components/**/*.ts'
      ],
      database: [
        'src/lib/schemas.ts',
        'supabase/migrations/*.sql'
      ],
      errors: [
        'src/**/*.tsx',
        'src/**/*.ts',
        '.next/error.log',
        'npm-debug.log'
      ]
    }
  },
  scripts: {
    generators: ['test', 'performance', 'utility', 'database', 'deployment'],
    output: './scripts',
    naming: 'kebab-case',
    templates: './resources/templates/scripts'
  },
  monitoring: {
    watchPaths: [
      'src/**/*',
      'scripts/**/*',
      'resources/**/*',
      'package.json',
      'tsconfig.json',
      '.env*'
    ],
    ignorePaths: [
      'node_modules',
      '.git',
      '.next',
      'coverage'
    ],
    debounceMs: 1000,
    errorPatterns: [
      'error TS\\d+:',
      'Error:.*(?:\\n\\s+at.*)+',
      'warning.*deprecated',
      'FAIL.*test'
    ]
  },
  generation: {
    autoCommit: true,
    createPR: true,
    notifyOnSlack: true,
    prTemplate: './resources/templates/pr-template.md'
  }
} as const;

// Validate configuration
configSchema.parse(config);

// Export validated configuration
export type Config = typeof config;
export default config; 