# Everything Copilot Code

A comprehensive collection of GitHub Copilot CLI configurations including custom agents, skills, hooks, and MCP server setups.

## Dev Environment

- Use `node scripts/setup-package-manager.js --detect` to detect or set package manager
- Supported: npm, pnpm, yarn, bun (auto-detected from lock files)
- Cross-platform support: Linux, macOS, Windows (WSL/PowerShell)

## Project Structure

```
.github/
├── copilot-instructions.md    # Repository-wide instructions
├── agents/                    # Custom agents (.agent.md files)
├── skills/                    # Agent skills (SKILL.md files)
├── instructions/              # Path-specific instructions
└── hooks/                     # Hook configurations
```

## Available Custom Agents

| Agent | Purpose | Invoke With |
|-------|---------|-------------|
| planner | Implementation planning | `/agent planner` |
| architect | System design decisions | `/agent architect` |
| tdd-guide | Test-driven development | `/agent tdd-guide` |
| code-reviewer | Code quality review | `/agent code-reviewer` |
| security-reviewer | Security analysis | `/agent security-reviewer` |
| build-error-resolver | Fix build/type errors | `/agent build-error-resolver` |
| e2e-runner | Playwright E2E testing | `/agent e2e-runner` |
| refactor-cleaner | Dead code cleanup | `/agent refactor-cleaner` |
| doc-updater | Documentation sync | `/agent doc-updater` |

## Testing Instructions

```bash
# Run all tests
node tests/run-all.js

# Run specific test
node tests/lib/utils.test.js
```

## Build & Validation

```bash
# Type check (if TypeScript)
npx tsc --noEmit

# Lint
npm run lint

# Format
npx prettier --write .
```

## Key Guidelines

1. **TDD First**: Write tests before implementation
2. **Security**: Never hardcode secrets, validate all inputs
3. **Immutability**: Use spread operators, never mutate
4. **Small Files**: 200-400 lines typical, 800 max
5. **Error Handling**: Always handle errors comprehensively

## MCP Server Configuration

MCP servers are configured in `~/.copilot/mcp-config.json`. Use `/mcp add` to add new servers.

## Skills

Skills are stored in `.github/skills/` with `SKILL.md` files. Copilot automatically loads relevant skills based on context.

## Hooks

Hooks in `.github/hooks/*.json` execute at key points:
- `sessionStart` / `sessionEnd`
- `preToolUse` / `postToolUse`
- `userPromptSubmitted`
- `errorOccurred`
