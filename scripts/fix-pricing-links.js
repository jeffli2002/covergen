#!/usr/bin/env node

/**
 * Script to fix all pricing links to include locale
 */

const fs = require('fs');
const path = require('path');

const filesToFix = [
  'src/components/usage-indicator.tsx',
  'src/components/mode-selector.tsx',
  'src/components/mobile-header.tsx',
  'src/components/generation-form.tsx',
  'src/components/rate-limit-modal.tsx',
  'src/components/prompt-configurator.tsx',
  'src/components/output-gallery.tsx',
];

// For each file, we need to:
// 1. Import usePathname if not already imported
// 2. Get the locale from pathname
// 3. Update the pricing links

const fixes = {
  'src/components/usage-indicator.tsx': [
    {
      find: '<Link href="/pricing"',
      replace: '<Link href={`/${locale}/pricing`}'
    }
  ],
  'src/components/mode-selector.tsx': [
    {
      find: '<Link href="/pricing">',
      replace: '<Link href={`/${locale}/pricing`}>'
    }
  ],
  'src/components/mobile-header.tsx': [
    {
      find: "window.location.href = '/pricing'",
      replace: "window.location.href = `/${locale}/pricing`"
    }
  ],
  'src/components/generation-form.tsx': [
    {
      find: "window.location.href = '/pricing'",
      replace: "window.location.href = `/${locale}/pricing`"
    }
  ],
  'src/components/rate-limit-modal.tsx': [
    {
      find: '<Link href="/pricing"',
      replace: '<Link href={`/${locale}/pricing`}'
    }
  ],
  'src/components/prompt-configurator.tsx': [
    {
      find: 'href="/pricing"',
      replace: 'href={`/${locale}/pricing`}'
    }
  ],
  'src/components/output-gallery.tsx': [
    {
      find: '<Link href="/pricing">',
      replace: '<Link href={`/${locale}/pricing`}>'
    }
  ]
};

console.log('🔧 Fixing pricing links to include locale...\n');

filesToFix.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    // Check if usePathname is imported
    const hasUsePathname = content.includes('usePathname');
    const hasNextNavigation = content.includes('from \'next/navigation\'');
    
    if (!hasUsePathname && hasNextNavigation) {
      // Add usePathname to existing next/navigation import
      content = content.replace(
        /from ['"]next\/navigation['"]/,
        match => {
          const importMatch = content.match(/import\s*{([^}]+)}\s*from\s*['"]next\/navigation['"]/);
          if (importMatch) {
            const imports = importMatch[1];
            if (!imports.includes('usePathname')) {
              return match.replace('{', '{ usePathname, ').replace(/{\s*/, '{ ');
            }
          }
          return match;
        }
      );
    } else if (!hasUsePathname) {
      // Add new import
      const importIndex = content.indexOf("'use client'") !== -1 
        ? content.indexOf("'use client'") + "'use client'".length 
        : 0;
      content = content.slice(0, importIndex) + 
        "\nimport { usePathname } from 'next/navigation'" + 
        content.slice(importIndex);
    }
    
    // Add locale extraction if not present
    if (!content.includes('pathname.split(\'/\')[1]') && !content.includes('const locale =')) {
      // Find the component function
      const componentMatch = content.match(/(export\s+(?:default\s+)?function\s+\w+[^{]*{\s*)/);
      if (componentMatch) {
        const insertPos = componentMatch.index + componentMatch[0].length;
        const localeCode = `\n  const pathname = usePathname()\n  const locale = pathname.split('/')[1] || 'en'\n`;
        
        // Check if the function already has content
        const hasContent = content.slice(insertPos, insertPos + 50).trim().length > 0;
        if (hasContent) {
          content = content.slice(0, insertPos) + localeCode + content.slice(insertPos);
        }
      }
    }
    
    // Apply specific fixes for this file
    if (fixes[file]) {
      fixes[file].forEach(fix => {
        content = content.replace(new RegExp(fix.find.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), fix.replace);
      });
    }
    
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Fixed: ${file}`);
    } else {
      console.log(`⏭️  No changes needed: ${file}`);
    }
  } catch (error) {
    console.error(`❌ Error processing ${file}:`, error.message);
  }
});

console.log('\n✅ Pricing links fix completed!');