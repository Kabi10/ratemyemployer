# Pre-Implementation Documentation

This directory contains pre-implementation documentation for features in the RateMyEmployer project.

## Purpose

The pre-implementation documentation serves as evidence that the mandatory pre-implementation checklist has been followed before implementing new features or making significant changes to the codebase.

## Process

1. Before implementing a new feature or making significant changes, create a pre-implementation document in this directory.
2. Use the template from `templates/pre-implementation-checklist.md`.
3. Name the file according to the feature or component you're implementing, e.g., `user-authentication-pre-implementation.md`.
4. Fill out all sections of the template:
   - Search results from code exploration
   - Findings documentation
   - Implementation decision tree
   - Proposed approach
   - Implementation plan
5. Get approval from a project maintainer before proceeding with implementation.
6. Reference the pre-implementation document in your commit messages and pull requests.

## VS Code Integration

You can use VS Code tasks to help with pre-implementation documentation:

- **Check Pre-Implementation Documentation**: Runs a script to check if all new files have corresponding pre-implementation documentation.
- **Create Pre-Implementation Documentation**: Creates a new pre-implementation document from the template.

To access these tasks, press `Ctrl+Shift+P` and type "Tasks: Run Task", then select the desired task.

## Enforcement

The pre-implementation checklist is enforced through:

1. Git pre-commit hooks that check for evidence of pre-implementation documentation.
2. GitHub Actions workflows that verify new files have corresponding documentation.
3. Code review processes that require reference to pre-implementation documentation.

## Why This Matters

Following the pre-implementation checklist helps:

- Prevent duplicate code and functionality
- Ensure consistent implementation patterns
- Document decision-making processes
- Maintain code quality and organization
- Facilitate knowledge sharing among team members 