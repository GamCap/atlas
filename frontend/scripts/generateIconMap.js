const fs = require('fs');
const path = require('path');
const glob = require('glob');

const subComponentsDirectory = path.resolve(__dirname, '../app/components/ui/Icon/subComponents');
const outputFile = path.resolve(__dirname, '../app/components/ui/Icon/iconMap.ts');

// Get all the icon files recursively in the subComponents directory
const iconFiles = glob.sync('**/*.jsx', { cwd: subComponentsDirectory });

// Generate the IconName type
const iconNames = iconFiles.map((file) => {
  const iconName = path.parse(file).name;
  return `'${iconName}'`;
});
const iconNameType = `export type IconName = ${iconNames.join(' | ')};`;

// Generate the IconMap
const iconMap = iconFiles.map((file) => {
  const iconName = path.parse(file).name;
  const iconPath = file.replace(/\\/g, '/');
  return `${iconName}: lazy(() => import('./subComponents/${iconPath}')),`;
});
const iconMapCode = `
import { lazy } from 'react';

export const IconMap: Record<IconName, React.LazyExoticComponent<React.FC<React.SVGProps<SVGSVGElement>>>> = {
  ${iconMap.join('\n')}
};
`;

// Generate the iconMap.ts file content
const fileContent = `
${iconMapCode}
${iconNameType}
`;

// Write the generated code to the output file
fs.writeFileSync(outputFile, fileContent.trim(), 'utf-8');

console.log('Icon map generated successfully!');