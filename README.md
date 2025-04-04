# Cursor Playbook

A package for managing reusable [Cursor](https://cursor.sh/) rules across projects. Cursor Playbook allows you to define, share, and reuse AI coding guidelines in different projects.

## Installation

```bash
npm install -g @bastienyoussfi/crules
```

## Features

- Add predefined rules to your project
- Create rule groups for easy application
- Export/import rules between projects
- Save and apply rule profiles
- Store user-specific rule configurations
- Tab completion for all commands and arguments
- JSON export/import for community sharing

## Usage

### Tab Completion

Enable tab completion in your shell to easily navigate commands, rules, and profiles:

```bash
# Add this to your ~/.bashrc or ~/.zshrc
source <(crules completion)
```

After sourcing the completion script, you can use tab completion for commands and arguments:

```bash
crules add <TAB>       # Shows available rules
crules add-group <TAB> # Shows available rule groups
crules apply-profile <TAB> # Shows available profiles
```

### Basic Commands

Add a rule to your project:

```bash
crules add typescript
```

List available rules:

```bash
crules list
```

Create a new rule template:

```bash
crules create my-rule
```

### Rule Groups

Add a group of related rules at once:

```bash
crules add-group typescript
```

### User Registry

Create a rule in your user registry (accessible across all projects):

```bash
crules create my-custom-rule --global
```

Export a project rule to your user registry:

```bash
crules export my-rule
```

Import a rule from your user registry to your current project:

```bash
crules import my-custom-rule
```

### Profiles

Save all your current project rules as a profile:

```bash
crules save-profile my-typescript-project
```

Apply a saved profile to a new project:

```bash
crules apply-profile my-typescript-project
```

List all saved profiles:

```bash
crules list-profiles
```

### Community Sharing

Export your rules to a JSON file for sharing with the community:

```bash
crules export-json my-awesome-rules.json
```

Import rules from a shared JSON file:

```bash
crules import-json my-awesome-rules.json
```

Use the `--overwrite` flag to replace existing rules when importing:

```bash
crules import-json my-awesome-rules.json --overwrite
```

The exported JSON file includes metadata (project name, description, export date) and all rule contents, making it easy to share on GitHub, in blog posts, or other community platforms.

### Repository Structure

To contribute rules to the community, you can structure your repository like this:

```
my-cursor-rules/
├── README.md                 # Description and usage instructions
├── rules/                    # Directory containing individual rule files
│   ├── typescript.mdc        # Individual rule file
│   └── react.mdc             # Individual rule file
└── packages/                 # Pre-configured rule packages for easy import 
    ├── typescript-basic.json # Package with basic TypeScript rules
    └── react-best-practices.json # Package with React best practices
```

## Adding Your Own Rule Groups

To define custom rule groups, modify the `getRuleGroups` function in the `src/index.ts` file.

## License

MIT 