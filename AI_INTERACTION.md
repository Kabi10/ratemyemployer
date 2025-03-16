# AI Interaction Guidelines

This document provides guidelines for effectively interacting with AI assistants in the RateMyEmployer project.

## Ensuring Rule Compliance

All AI assistants must follow the implementation rules defined in `.cursorrules`. To ensure compliance:

### 1. Initialize Each Session

Start each AI session with:

```bash
npm run ai:init
```

This will generate an initialization message that you can copy and paste to the AI. The message reminds the AI to follow all implementation rules.

### 2. Verify Compliance

If you suspect the AI is not following the rules, run:

```bash
npm run ai:verify
```

This will generate verification questions you can ask the AI to check if it's following the rules.

### 3. Use Pre-Commit Hooks

Set up the rule compliance pre-commit hook:

```bash
npm run ai:setup-hooks
```

This will install a pre-commit hook that checks for evidence of rule compliance in commit messages.

## Key Commands for AI Interaction

| Command | Description |
|---------|-------------|
| `/init-session` | Tell the AI to read and follow the `.cursorrules` file |
| `/verify-rules` | Ask the AI to verify it's following the rules |
| `/show-patterns` | Ask the AI to list relevant patterns for the current task |
| `/search-first` | Remind the AI to search for existing code before implementing |

## Best Practices

1. **Always initialize the session** before asking the AI to implement anything
2. **Verify rule compliance** if the AI suggests creating new files without searching first
3. **Ask for options** before accepting an implementation
4. **Check commit messages** for evidence of rule compliance

## Troubleshooting

If the AI is not following the rules:

1. Run `npm run ai:verify` and ask the verification questions
2. Explicitly ask the AI to read the `.cursorrules` file
3. Remind the AI of specific rules it's violating
4. Start a new session and initialize properly

## Example Workflow

1. Start a new session
2. Run `npm run ai:init`
3. Paste the initialization message to the AI
4. Ask the AI to implement a feature
5. Verify the AI searches first and follows patterns
6. Approve the implementation only after confirming rule compliance 