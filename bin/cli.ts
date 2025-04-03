#!/usr/bin/env node

import { program } from "commander";
import * as fs from "fs-extra";
import * as path from "path";
import * as os from "os";
import { listRules, getRuleGroups } from "../src";

// Path to the rules in the source code
const rulesDir = path.join(__dirname, "../src");
// Path to the rules in the compiled code (for when running from dist/)
const compiledRulesDir = path.join(__dirname, "../../src");
// Use the correct path based on whether we're running from source or compiled code
const effectiveRulesDir = fs.existsSync(rulesDir) ? rulesDir : compiledRulesDir;
const targetDir = path.join(process.cwd(), ".cursor/rules");

// User registry directory for storing custom rules
const userRegistryDir = path.join(os.homedir(), ".cursor-playbook");

/**
 * Get all available rule names (built-in and user rules)
 */
function getAllRuleNames(): string[] {
  const builtinRules = listRules().map(file => file.replace('.mdc', ''));
  
  // Get user rules if they exist
  const userRulesDir = path.join(userRegistryDir, "rules");
  let userRules: string[] = [];
  
  if (fs.existsSync(userRulesDir)) {
    userRules = fs.readdirSync(userRulesDir)
      .filter(file => file.endsWith('.mdc'))
      .map(file => file.replace('.mdc', ''));
  }
  
  return [...builtinRules, ...userRules];
}

/**
 * Get all profile names
 */
function getAllProfileNames(): string[] {
  const profilesDir = path.join(userRegistryDir, "profiles");
  
  if (!fs.existsSync(profilesDir)) {
    return [];
  }
  
  return fs.readdirSync(profilesDir)
    .filter(file => fs.statSync(path.join(profilesDir, file)).isDirectory());
}

// Setup tab completion support
program
  .enablePositionalOptions()
  .configureOutput({ writeOut: (str) => process.stdout.write(str) });

// Setup auto-completion
program
  .command("completion")
  .description("Generate shell completion script")
  .action(() => {
    // Output the completion script
    console.log(`
# cursor-playbook completion
# bash completion for cursor-playbook CLI

_cursor_playbook_complete() {
  local cur prev words
  COMPREPLY=()
  cur="\${COMP_WORDS[COMP_CWORD]}"
  prev="\${COMP_WORDS[COMP_CWORD-1]}"

  case "\${prev}" in
    add)
      # Complete with rule names
      COMPREPLY=( $(compgen -W "$(cursor-playbook list-for-completion rules)" -- "\${cur}") )
      return 0
      ;;
    add-group)
      # Complete with group names
      COMPREPLY=( $(compgen -W "$(cursor-playbook list-for-completion groups)" -- "\${cur}") )
      return 0
      ;;
    export|import)
      # Complete with rule names
      COMPREPLY=( $(compgen -W "$(cursor-playbook list-for-completion rules)" -- "\${cur}") )
      return 0
      ;;
    save-profile|apply-profile)
      # Complete with profile names for apply-profile
      if [ "\${prev}" = "apply-profile" ]; then
        COMPREPLY=( $(compgen -W "$(cursor-playbook list-for-completion profiles)" -- "\${cur}") )
      fi
      return 0
      ;;
    cursor-playbook)
      # Complete with commands
      COMPREPLY=( $(compgen -W "add add-group list create export import save-profile apply-profile list-profiles completion" -- "\${cur}") )
      return 0
      ;;
  esac

  # Default to file completion
  return 0
}

complete -F _cursor_playbook_complete cursor-playbook
`);
  });

// Add command to list completions (used by completion script)
program
  .command("list-for-completion <type>")
  .description("List items for shell completion (internal use)")
  .action((type: string) => {
    switch(type) {
      case "rules":
        console.log(getAllRuleNames().join(" "));
        break;
      case "groups":
        console.log(Object.keys(getRuleGroups()).join(" "));
        break;
      case "profiles":
        console.log(getAllProfileNames().join(" "));
        break;
    }
  });

program
  .command("add <rule>")
  .description("Add a specific Cursor rule to your project")
  .action(async (rule: string) => {
    const sourceFile = path.join(effectiveRulesDir, `${rule}.mdc`);
    const userSourceFile = path.join(userRegistryDir, "rules", `${rule}.mdc`);
    const targetPath = path.join(targetDir, `${rule}.mdc`);

    // Check if rule exists in built-in rules or user registry
    if (fs.existsSync(sourceFile)) {
      try {
        await fs.ensureDir(targetDir);
        await fs.copy(sourceFile, targetPath);
        console.log(`Added '${rule}' rule to .cursor/rules/`);
      } catch (err) {
        console.error("Error adding rule:", err);
        process.exit(1);
      }
    } else if (fs.existsSync(userSourceFile)) {
      try {
        await fs.ensureDir(targetDir);
        await fs.copy(userSourceFile, targetPath);
        console.log(`Added user rule '${rule}' to .cursor/rules/`);
      } catch (err) {
        console.error("Error adding user rule:", err);
        process.exit(1);
      }
    } else {
      const availableRules = listRules().map(file => file.replace('.mdc', ''));
      console.error(`Rule '${rule}' not found. Available rules: ${availableRules.join(', ')}`);
      process.exit(1);
    }
  });

program
  .command("add-group <group>")
  .description("Add a group of related rules to your project")
  .action(async (group: string) => {
    const ruleGroups = getRuleGroups();
    
    if (!ruleGroups[group]) {
      console.error(`Group '${group}' not found. Available groups: ${Object.keys(ruleGroups).join(', ')}`);
      process.exit(1);
    }
    
    try {
      await fs.ensureDir(targetDir);
      const rulesInGroup = ruleGroups[group];
      
      for (const rule of rulesInGroup as string[]) {
        const sourceFile = path.join(effectiveRulesDir, `${rule}.mdc`);
        const targetPath = path.join(targetDir, `${rule}.mdc`);
        
        if (fs.existsSync(sourceFile)) {
          await fs.copy(sourceFile, targetPath);
        }
      }
      
      console.log(`Added rules from group '${group}' to .cursor/rules/`);
    } catch (err) {
      console.error(`Error adding rule group:`, err);
      process.exit(1);
    }
  });

program
  .command("list")
  .description("List all available rules")
  .action(() => {
    const availableRules = listRules().map(file => file.replace('.mdc', ''));
    console.log("Available rules:");
    availableRules.forEach(rule => console.log(`- ${rule}`));
    
    // List user rules if they exist
    const userRulesDir = path.join(userRegistryDir, "rules");
    if (fs.existsSync(userRulesDir)) {
      const userRules = fs.readdirSync(userRulesDir)
        .filter(file => file.endsWith('.mdc'))
        .map(file => file.replace('.mdc', ''));
      
      if (userRules.length > 0) {
        console.log("\nUser rules:");
        userRules.forEach(rule => console.log(`- ${rule}`));
      }
    }
    
    // List available groups
    const groups = getRuleGroups();
    console.log("\nAvailable rule groups:");
    Object.entries(groups).forEach(([name, rules]) => {
      console.log(`- ${name} (${rules.length} rules)`);
    });
  });

program
  .command("create <name>")
  .description("Create a new rule template")
  .option("-g, --global", "Create rule in user registry instead of project")
  .action(async (name: string, options) => {
    let rulePath;
    
    if (options.global) {
      // Create in user registry
      const userRulesDir = path.join(userRegistryDir, "rules");
      await fs.ensureDir(userRulesDir);
      rulePath = path.join(userRulesDir, `${name}.mdc`);
    } else {
      // Create in project
      const srcPath = path.resolve(__dirname, '../../src');
      rulePath = path.join(srcPath, `${name}.mdc`);
    }
    
    if (fs.existsSync(rulePath)) {
      console.error(`Rule '${name}' already exists.`);
      process.exit(1);
    }
    
    const template = `---
description: 
globs: 
alwaysApply: false
---
# ${name.charAt(0).toUpperCase() + name.slice(1)} Guidelines
- Add your guidelines here
`;
    
    try {
      await fs.writeFile(rulePath, template);
      console.log(`Created new rule template: ${name}.mdc ${options.global ? '(in user registry)' : ''}`);
    } catch (err) {
      console.error("Error creating rule:", err);
      process.exit(1);
    }
  });

program
  .command("export <rule>")
  .description("Export a rule to the user registry")
  .action(async (rule: string) => {
    const sourceFile = path.join(targetDir, `${rule}.mdc`);
    
    if (!fs.existsSync(sourceFile)) {
      console.error(`Rule '${rule}' not found in current project.`);
      process.exit(1);
    }
    
    try {
      const userRulesDir = path.join(userRegistryDir, "rules");
      await fs.ensureDir(userRulesDir);
      const targetPath = path.join(userRulesDir, `${rule}.mdc`);
      
      await fs.copy(sourceFile, targetPath);
      console.log(`Exported rule '${rule}' to user registry`);
    } catch (err) {
      console.error("Error exporting rule:", err);
      process.exit(1);
    }
  });

program
  .command("import <rule>")
  .description("Import a rule from the user registry to the current project")
  .action(async (rule: string) => {
    const sourceFile = path.join(userRegistryDir, "rules", `${rule}.mdc`);
    
    if (!fs.existsSync(sourceFile)) {
      console.error(`Rule '${rule}' not found in user registry.`);
      process.exit(1);
    }
    
    try {
      await fs.ensureDir(targetDir);
      const targetPath = path.join(targetDir, `${rule}.mdc`);
      
      await fs.copy(sourceFile, targetPath);
      console.log(`Imported rule '${rule}' to current project`);
    } catch (err) {
      console.error("Error importing rule:", err);
      process.exit(1);
    }
  });

program
  .command("save-profile <name>")
  .description("Save current project rules as a named profile")
  .action(async (name: string) => {
    if (!fs.existsSync(targetDir)) {
      console.error("No rules found in current project.");
      process.exit(1);
    }
    
    try {
      const profilesDir = path.join(userRegistryDir, "profiles");
      await fs.ensureDir(profilesDir);
      const profileDir = path.join(profilesDir, name);
      
      // Clear existing profile if it exists
      if (fs.existsSync(profileDir)) {
        await fs.emptyDir(profileDir);
      } else {
        await fs.ensureDir(profileDir);
      }
      
      // Copy all rules from current project to profile
      const rules = fs.readdirSync(targetDir).filter(file => file.endsWith('.mdc'));
      
      for (const rule of rules) {
        const sourceFile = path.join(targetDir, rule);
        const targetPath = path.join(profileDir, rule);
        await fs.copy(sourceFile, targetPath);
      }
      
      console.log(`Saved ${rules.length} rules as profile '${name}'`);
    } catch (err) {
      console.error("Error saving profile:", err);
      process.exit(1);
    }
  });

program
  .command("apply-profile <name>")
  .description("Apply a saved profile to the current project")
  .action(async (name: string) => {
    const profileDir = path.join(userRegistryDir, "profiles", name);
    
    if (!fs.existsSync(profileDir)) {
      console.error(`Profile '${name}' not found.`);
      process.exit(1);
    }
    
    try {
      await fs.ensureDir(targetDir);
      
      // Copy all rules from profile to current project
      const rules = fs.readdirSync(profileDir).filter(file => file.endsWith('.mdc'));
      
      for (const rule of rules) {
        const sourceFile = path.join(profileDir, rule);
        const targetPath = path.join(targetDir, rule);
        await fs.copy(sourceFile, targetPath);
      }
      
      console.log(`Applied profile '${name}' with ${rules.length} rules to current project`);
    } catch (err) {
      console.error("Error applying profile:", err);
      process.exit(1);
    }
  });

program
  .command("list-profiles")
  .description("List all saved rule profiles")
  .action(() => {
    const profilesDir = path.join(userRegistryDir, "profiles");
    
    if (!fs.existsSync(profilesDir)) {
      console.log("No saved profiles found.");
      return;
    }
    
    const profiles = fs.readdirSync(profilesDir).filter(file => 
      fs.statSync(path.join(profilesDir, file)).isDirectory()
    );
    
    if (profiles.length === 0) {
      console.log("No saved profiles found.");
      return;
    }
    
    console.log("Available profiles:");
    profiles.forEach(profile => {
      const profileDir = path.join(profilesDir, profile);
      const ruleCount = fs.readdirSync(profileDir).filter(file => file.endsWith('.mdc')).length;
      console.log(`- ${profile} (${ruleCount} rules)`);
    });
  });

program.parse(process.argv);
