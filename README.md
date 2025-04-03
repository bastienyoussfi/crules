# Cursor Playbook

A package for managing reusable [Cursor](https://cursor.sh/) rules across projects. Cursor Playbook allows you to define, share, and reuse AI coding guidelines in different projects.

## Installation

```bash
npm install -g @bastienyoussfi/cursor-playbook
```

## Features

- Add predefined rules to your project
- Create rule groups for easy application
- Export/import rules between projects
- Save and apply rule profiles
- Store user-specific rule configurations
- Tab completion for all commands and arguments

## Usage

### Tab Completion

Enable tab completion in your shell to easily navigate commands, rules, and profiles:

```bash
# Add this to your ~/.bashrc or ~/.zshrc
source <(cursor-playbook completion)
```

After sourcing the completion script, you can use tab completion for commands and arguments:

```bash
cursor-playbook add <TAB>       # Shows available rules
cursor-playbook add-group <TAB> # Shows available rule groups
cursor-playbook apply-profile <TAB> # Shows available profiles
```

### Basic Commands

Add a rule to your project:

```bash
cursor-playbook add typescript
```

List available rules:

```bash
cursor-playbook list
```

Create a new rule template:

```bash
cursor-playbook create my-rule
```

### Rule Groups

Add a group of related rules at once:

```bash
cursor-playbook add-group typescript
```

### User Registry

Create a rule in your user registry (accessible across all projects):

```bash
cursor-playbook create my-custom-rule --global
```

Export a project rule to your user registry:

```bash
cursor-playbook export my-rule
```

Import a rule from your user registry to your current project:

```bash
cursor-playbook import my-custom-rule
```

### Profiles

Save all your current project rules as a profile:

```bash
cursor-playbook save-profile my-typescript-project
```

Apply a saved profile to a new project:

```bash
cursor-playbook apply-profile my-typescript-project
```

List all saved profiles:

```bash
cursor-playbook list-profiles
```

## Adding Your Own Rule Groups

To define custom rule groups, modify the `getRuleGroups` function in the `src/index.ts` file.

## License

MIT 