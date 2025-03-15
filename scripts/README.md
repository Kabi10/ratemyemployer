# RateMyEmployer Scripts

This directory contains various utility scripts for the RateMyEmployer project.

## MCP Scripts

| Script | Description |
|--------|-------------|
| `setup-mcp.ts` | Sets up the MCP server configuration |
| `setup-stored-procedures.ts` | Sets up stored procedures for the MCP server |
| `run-mcp-server.js` | Interactive CLI for running the MCP server |
| `mcp-sample-queries.ts` | Contains sample queries for the MCP server |
| `mcp-stored-procedures.sql` | Contains SQL stored procedures for common queries |
| `mcp-database-fixes.ts` | Fixes database schema and stored procedures for MCP |
| `mcp-database-fixes.sql` | SQL script for fixing database schema (for direct execution in Supabase SQL Editor) |

## Form Verification Scripts

| Script | Description |
|--------|-------------|
| `verify-supabase-data.ts` | Verifies data integrity in Supabase |
| `test-form-validation.ts` | Tests form validation logic |
| `test-form-submissions.ts` | Tests form submission process |
| `monitor-form-submissions.ts` | Monitors form submissions in real-time |

## Utility Scripts

| Script | Description |
|--------|-------------|
| `docs-helper.js` | Interactive CLI for navigating project documentation |
| `cli.ts` | General-purpose CLI for the project |
| `fix-imports.ts` | Fixes import statements in the codebase |
| `fix-use-client.ts` | Fixes 'use client' directives in the codebase |
| `verify-build.ts` | Verifies the build output |

## Running Scripts

Most scripts can be run using npm:

```bash
# Run the MCP setup script
npm run mcp:setup

# Run the MCP database fixes script
npm run mcp:fix-database

# Run the documentation helper
npm run docs

# Run the form verification scripts
npm run verify:all
```

For more information on the MCP integration, see the [MCP Documentation](../MCP_DOCUMENTATION.md).

For more information on form verification, see the Form Verification Integration section in the [MCP Documentation](../MCP_DOCUMENTATION.md#form-verification-integration). 