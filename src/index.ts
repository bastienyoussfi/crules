import * as path from "path";
import * as fs from "fs-extra";

// Get the correct source directory path whether running from source or compiled code
function getRulesDir(): string {
  return __dirname; // This will be either 'src' or 'dist/src'
}

export const getRule = (ruleName: string): string => {
  const rulePath = path.join(getRulesDir(), `${ruleName}.mdc`);
  return fs.readFileSync(rulePath, "utf-8");
};

export const listRules = (): string[] => {
  const rulesDir = getRulesDir();
  return fs
    .readdirSync(rulesDir)
    .filter((file: string) => file.endsWith(".mdc"));
};
