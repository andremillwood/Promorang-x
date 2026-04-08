#!/usr/bin/env ts-node
/**
 * Layout Scanner Script
 * Scans the codebase for layout and theme inconsistencies
 * 
 * Usage:
 *   npx ts-node tools/scan-layout.ts
 *   npx ts-node tools/scan-layout.ts --fix  (auto-fix simple issues)
 */

import * as fs from 'fs';
import * as path from 'path';

interface ScanIssue {
  file: string;
  line: number;
  type: 'hard-coded-color' | 'deprecated-layout' | 'missing-overflow' | 'non-fluid-width' | 'shadow-inconsistency';
  message: string;
  suggestion: string;
  autoFixable: boolean;
}

const HARD_CODED_COLOR_PATTERN = /(bg|text|border)-(gray|white|black|neutral|slate|zinc|stone)-(\d+)/g;
const DEPRECATED_LAYOUT_PATTERNS = [
  /max-w-screen-(xl|lg|md|sm)/g,
  /container\s+px-\d+/g,
  /max-w-\d+xl(?!\s*2xl)/g, // Matches max-w-xl, max-w-2xl but not our custom ones
];
const NON_FLUID_WIDTH_PATTERN = /max-w-\[(\d+)px\](?!\s+2xl:max-w-)/g;

const THEME_TOKEN_REPLACEMENTS: Record<string, string> = {
  'bg-white': 'bg-pr-surface-card',
  'bg-gray-50': 'bg-pr-surface-2',
  'bg-gray-100': 'bg-pr-surface-2',
  'bg-gray-200': 'bg-pr-surface-3',
  'bg-gray-300': 'bg-pr-surface-3',
  'bg-black': 'bg-pr-surface-1 dark:bg-pr-surface-1',
  'text-gray-900': 'text-pr-text-1',
  'text-gray-800': 'text-pr-text-1',
  'text-gray-700': 'text-pr-text-1',
  'text-gray-600': 'text-pr-text-2',
  'text-gray-500': 'text-pr-text-2',
  'text-white': 'text-pr-text-1',
  'text-black': 'text-pr-text-1',
  'border-gray-200': 'border-pr-surface-3',
  'border-gray-300': 'border-pr-surface-3',
  'border-white': 'border-pr-surface-3',
};

const DEPRECATED_LAYOUT_REPLACEMENTS: Record<string, string> = {
  'max-w-screen-xl': 'max-w-[1600px] 2xl:max-w-[1800px]',
  'max-w-screen-lg': 'max-w-[1600px]',
  'container px-4': 'max-w-[1600px] 2xl:max-w-[1800px] mx-auto px-4 md:px-6 xl:px-8 2xl:px-12',
};

class LayoutScanner {
  private issues: ScanIssue[] = [];
  private scannedFiles = 0;
  private autoFix = false;

  constructor(autoFix = false) {
    this.autoFix = autoFix;
  }

  async scan(directory: string) {
    console.log('🔍 Scanning layout and theme consistency...\n');
    await this.scanDirectory(directory);
    this.printReport();
    
    if (this.autoFix) {
      await this.applyFixes();
    }
  }

  private async scanDirectory(dir: string) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      // Skip node_modules, dist, build, .git
      if (entry.name === 'node_modules' || entry.name === 'dist' || 
          entry.name === 'build' || entry.name === '.git' ||
          entry.name === 'tools') {
        continue;
      }

      if (entry.isDirectory()) {
        await this.scanDirectory(fullPath);
      } else if (entry.isFile() && this.shouldScanFile(entry.name)) {
        await this.scanFile(fullPath);
      }
    }
  }

  private shouldScanFile(filename: string): boolean {
    return /\.(tsx|ts|jsx|js)$/.test(filename) && 
           !filename.endsWith('.test.tsx') &&
           !filename.endsWith('.test.ts');
  }

  private async scanFile(filePath: string) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    this.scannedFiles++;

    lines.forEach((line, index) => {
      // Check for hard-coded colors
      const colorMatches = line.matchAll(HARD_CODED_COLOR_PATTERN);
      for (const match of colorMatches) {
        const fullMatch = match[0];
        const suggestion = THEME_TOKEN_REPLACEMENTS[fullMatch];
        
        if (suggestion) {
          this.issues.push({
            file: filePath,
            line: index + 1,
            type: 'hard-coded-color',
            message: `Hard-coded color: ${fullMatch}`,
            suggestion: `Replace with: ${suggestion}`,
            autoFixable: true,
          });
        }
      }

      // Check for deprecated layout classes
      DEPRECATED_LAYOUT_PATTERNS.forEach(pattern => {
        const matches = line.matchAll(pattern);
        for (const match of matches) {
          const fullMatch = match[0];
          const suggestion = DEPRECATED_LAYOUT_REPLACEMENTS[fullMatch];
          
          this.issues.push({
            file: filePath,
            line: index + 1,
            type: 'deprecated-layout',
            message: `Deprecated layout class: ${fullMatch}`,
            suggestion: suggestion || 'Use ultrawide-friendly max-width utilities',
            autoFixable: !!suggestion,
          });
        }
      });

      // Check for non-fluid widths
      const widthMatches = line.matchAll(NON_FLUID_WIDTH_PATTERN);
      for (const match of widthMatches) {
        this.issues.push({
          file: filePath,
          line: index + 1,
          type: 'non-fluid-width',
          message: `Non-fluid width: ${match[0]}`,
          suggestion: 'Add responsive 2xl breakpoint: max-w-[1600px] 2xl:max-w-[1800px]',
          autoFixable: false,
        });
      }

      // Check for cards without overflow protection
      if (line.includes('className') && 
          (line.includes('card') || line.includes('Card')) &&
          !line.includes('overflow-hidden')) {
        this.issues.push({
          file: filePath,
          line: index + 1,
          type: 'missing-overflow',
          message: 'Card component without overflow-hidden',
          suggestion: 'Add: w-full max-w-full overflow-hidden',
          autoFixable: false,
        });
      }
    });
  }

  private printReport() {
    console.log(`\n📊 Scan Complete: ${this.scannedFiles} files scanned\n`);
    console.log(`Found ${this.issues.length} issues:\n`);

    const issuesByType = this.groupIssuesByType();

    Object.entries(issuesByType).forEach(([type, issues]) => {
      console.log(`\n${this.getTypeIcon(type)} ${this.getTypeLabel(type)} (${issues.length})`);
      console.log('─'.repeat(60));

      // Show first 5 of each type
      issues.slice(0, 5).forEach(issue => {
        const relativePath = path.relative(process.cwd(), issue.file);
        console.log(`  📄 ${relativePath}:${issue.line}`);
        console.log(`     ${issue.message}`);
        console.log(`     💡 ${issue.suggestion}`);
        if (issue.autoFixable) {
          console.log(`     ✅ Auto-fixable`);
        }
        console.log();
      });

      if (issues.length > 5) {
        console.log(`  ... and ${issues.length - 5} more\n`);
      }
    });

    const autoFixableCount = this.issues.filter(i => i.autoFixable).length;
    console.log(`\n💡 ${autoFixableCount} issues can be auto-fixed`);
    console.log(`Run with --fix flag to apply automatic fixes\n`);
  }

  private groupIssuesByType(): Record<string, ScanIssue[]> {
    return this.issues.reduce((acc, issue) => {
      if (!acc[issue.type]) {
        acc[issue.type] = [];
      }
      acc[issue.type].push(issue);
      return acc;
    }, {} as Record<string, ScanIssue[]>);
  }

  private getTypeIcon(type: string): string {
    const icons: Record<string, string> = {
      'hard-coded-color': '🎨',
      'deprecated-layout': '📐',
      'missing-overflow': '📦',
      'non-fluid-width': '📏',
      'shadow-inconsistency': '🌓',
    };
    return icons[type] || '⚠️';
  }

  private getTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      'hard-coded-color': 'Hard-coded Colors',
      'deprecated-layout': 'Deprecated Layout Classes',
      'missing-overflow': 'Missing Overflow Protection',
      'non-fluid-width': 'Non-fluid Widths',
      'shadow-inconsistency': 'Shadow Inconsistencies',
    };
    return labels[type] || type;
  }

  private async applyFixes() {
    const fixableIssues = this.issues.filter(i => i.autoFixable);
    
    if (fixableIssues.length === 0) {
      console.log('\n✅ No auto-fixable issues found\n');
      return;
    }

    console.log(`\n🔧 Applying ${fixableIssues.length} automatic fixes...\n`);

    // Group by file
    const issuesByFile = fixableIssues.reduce((acc, issue) => {
      if (!acc[issue.file]) {
        acc[issue.file] = [];
      }
      acc[issue.file].push(issue);
      return acc;
    }, {} as Record<string, ScanIssue[]>);

    let fixedCount = 0;

    Object.entries(issuesByFile).forEach(([file, issues]) => {
      let content = fs.readFileSync(file, 'utf-8');
      
      issues.forEach(issue => {
        if (issue.type === 'hard-coded-color') {
          const match = issue.message.match(/Hard-coded color: (.+)/);
          if (match) {
            const oldClass = match[1];
            const newClass = THEME_TOKEN_REPLACEMENTS[oldClass];
            if (newClass) {
              content = content.replace(new RegExp(oldClass, 'g'), newClass);
              fixedCount++;
            }
          }
        } else if (issue.type === 'deprecated-layout') {
          const match = issue.message.match(/Deprecated layout class: (.+)/);
          if (match) {
            const oldClass = match[1];
            const newClass = DEPRECATED_LAYOUT_REPLACEMENTS[oldClass];
            if (newClass) {
              content = content.replace(new RegExp(oldClass, 'g'), newClass);
              fixedCount++;
            }
          }
        }
      });

      fs.writeFileSync(file, content, 'utf-8');
      console.log(`  ✅ Fixed ${issues.length} issues in ${path.relative(process.cwd(), file)}`);
    });

    console.log(`\n✨ Applied ${fixedCount} fixes successfully!\n`);
    console.log(`⚠️  Please review changes and run tests before committing.\n`);
  }
}

// Main execution
const args = process.argv.slice(2);
const autoFix = args.includes('--fix');
const scanPath = path.join(process.cwd(), 'src/react-app');

const scanner = new LayoutScanner(autoFix);
scanner.scan(scanPath).catch(console.error);
