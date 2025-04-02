#!/usr/bin/env node

import { program } from "commander";
import * as fs from "fs-extra";
import * as path from "path";
import { listRules } from "../src";

// Path to the rules in the source code
const rulesDir = path.join(__dirname, "../src");
// Path to the rules in the compiled code (for when running from dist/)
const compiledRulesDir = path.join(__dirname, "../../src");
// Use the correct path based on whether we're running from source or compiled code
const effectiveRulesDir = fs.existsSync(rulesDir) ? rulesDir : compiledRulesDir;
const targetDir = path.join(process.cwd(), ".cursor/rules");

program
  .command("add <rule>")
  .description("Add a specific Cursor rule to your project")
  .action(async (rule: string) => {
    const sourceFile = path.join(effectiveRulesDir, `${rule}.mdc`);
    const targetPath = path.join(targetDir, `${rule}.mdc`);

    if (!fs.existsSync(sourceFile)) {
      const availableRules = listRules().map(file => file.replace('.mdc', ''));
      console.error(`Rule '${rule}' not found. Available rules: ${availableRules.join(', ')}`);
      process.exit(1);
    }

    try {
      await fs.ensureDir(targetDir);
      await fs.copy(sourceFile, targetPath);
      console.log(`Added '${rule}' rule to .cursor/rules/`);
    } catch (err) {
      console.error("Error adding rule:", err);
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
  });

program
  .command("create <name>")
  .description("Create a new rule template")
  .action(async (name: string) => {
    // Get the absolute path to the src directory (where rules should be stored)
    // We need to make sure that we're writing to the source directory, not the compiled directory
    const srcPath = path.resolve(__dirname, '../../src');
    const rulePath = path.join(srcPath, `${name}.mdc`);
    
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
      console.log(`Created new rule template: ${name}.mdc`);
    } catch (err) {
      console.error("Error creating rule:", err);
      process.exit(1);
    }
  });

program.parse(process.argv);
