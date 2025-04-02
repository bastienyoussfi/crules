import * as path from "path";
import * as fs from "fs-extra";

/**
 * Get the correct source directory path whether running from source or compiled code
 * @returns The path to the rules directory
 */
function getRulesDir(): string {
  return __dirname;
}

/**
 * Get a rule by name
 * @param ruleName - The name of the rule to get
 * @returns The rule as a string
 */
export const getRule = (ruleName: string): string => {
  const rulePath = path.join(getRulesDir(), `${ruleName}.mdc`);
  return fs.readFileSync(rulePath, "utf-8");
};

/**
 * List all available rules
 * @returns An array of rule names
 */
export const listRules = (): string[] => {
  const rulesDir = getRulesDir();
  return fs
    .readdirSync(rulesDir)
    .filter((file: string) => file.endsWith(".mdc"));
};
