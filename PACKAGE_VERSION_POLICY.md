# Package Version Policy

## React Types Version Lock

We strictly control React type definitions to ensure consistency across the project and prevent dependency conflicts. The following versions are locked:

- `@types/react`: 18.2.0
- `@types/react-dom`: 18.2.0

### Why?

1. **Consistency**: Ensures all dependencies use the same React types
2. **Prevents Conflicts**: Many testing libraries and components have specific React type requirements
3. **Stability**: Prevents accidental type definition updates that could break the build

### Implementation

We enforce this through both `resolutions` and `overrides` in package.json:

```json
{
  "resolutions": {
    "@types/react": "18.2.0",
    "@types/react-dom": "18.2.0"
  },
  "overrides": {
    "@types/react": "18.2.0",
    "@types/react-dom": "18.2.0"
  }
}
```

### ⚠️ Important

Do not change these versions without team discussion and thorough testing. Changes can affect:
- Testing libraries compatibility
- Component type checking
- Build process
- Third-party component integration 