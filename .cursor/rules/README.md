# Cursor Project Rules

This directory contains the project-specific rules for the RateMyEmployer project. These rules are automatically included when matching files are referenced in Cursor.

## Rule Files

- **projectrule.mdc**: General project rules for all files
- **pre-implementation.mdc**: Mandatory pre-implementation checklist
- **pattern-recognition.mdc**: Pattern recognition map for consistent implementation
- **database-safety.mdc**: Critical database safety protocols
- **implementation-lessons.mdc**: Implementation lessons and best practices
- **review-system.mdc**: Review system implementation patterns
- **company-management.mdc**: Company management implementation patterns
- **mcp-integration.mdc**: MCP integration implementation patterns
- **mvp-implementation.mdc**: MVP implementation plan
- **quick-reference.mdc**: Quick reference for common commands and key file locations

## How Rules Work

Each rule file includes:
- **description**: A brief description of the rule
- **globs**: File patterns that the rule applies to
- **alwaysApply**: Whether the rule should always be applied

Rules are automatically included when matching files are referenced in Cursor. For example, when editing a file in the `src/components/Review*.tsx` directory, the `review-system.mdc` rule will be automatically included.

## Adding New Rules

To add a new rule:
1. Create a new file in the `.cursor/rules` directory with the `.mdc` extension
2. Add the appropriate frontmatter (description, globs, alwaysApply)
3. Add the rule content in Markdown format

## Referencing Rules

You can reference other rule files using the `@file` syntax. For example:

```
@file pre-implementation.mdc
```

This will include the content of the referenced file when the rule is applied. 