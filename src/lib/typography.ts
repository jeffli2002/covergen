// Ultra-thin Typography System for CoverGen Pro
// Based on modern SaaS design principles (Linear, Vercel, Stripe)
// All classes use Tailwind CSS

export const typography = {
  // Display - For hero sections and landing pages
  display: {
    1: 'text-6xl md:text-7xl lg:text-8xl font-thin tracking-tight',
    2: 'text-5xl md:text-6xl lg:text-7xl font-thin tracking-tight',
  },
  
  // Headings - Primary content hierarchy
  heading: {
    h1: 'text-3xl md:text-4xl lg:text-5xl font-thin tracking-tight',
    h2: 'text-2xl md:text-3xl lg:text-4xl font-extralight',
    h3: 'text-xl md:text-2xl lg:text-3xl font-extralight',
    h4: 'text-lg md:text-xl lg:text-2xl font-light',
    h5: 'text-base md:text-lg font-light',
    h6: 'text-sm md:text-base font-normal',
  },
  
  // Platform pages specific
  platform: {
    hero: 'text-4xl md:text-5xl lg:text-6xl font-thin tracking-tight',
    subtitle: 'text-lg md:text-xl font-light leading-relaxed',
    sectionTitle: 'text-2xl md:text-3xl lg:text-4xl font-extralight',
    featureTitle: 'text-lg font-medium',
  },
  
  // Tool pages specific
  tool: {
    hero: 'text-4xl md:text-5xl lg:text-6xl font-thin',
    badge: 'text-sm font-light',
    stat: 'text-2xl md:text-3xl font-extralight',
    statLabel: 'text-sm font-light',
    featureTitle: 'text-base font-medium',
  },
  
  // Body text variations
  body: {
    large: 'text-lg md:text-xl font-light leading-relaxed',
    default: 'text-base font-normal leading-relaxed',
    small: 'text-sm font-normal leading-relaxed',
  },
  
  // Interactive elements
  button: {
    large: 'text-lg font-medium',
    default: 'text-base font-medium',
    small: 'text-sm font-medium',
  },
  
  // UI components
  ui: {
    nav: 'text-sm font-medium',
    menuItem: 'text-sm font-normal',
    breadcrumb: 'text-sm font-light',
    tooltip: 'text-xs font-normal',
    label: 'text-sm font-medium',
    helper: 'text-xs font-normal',
    caption: 'text-xs font-normal',
    overline: 'text-xs font-medium uppercase tracking-wider',
  },
  
  // Special text styles
  special: {
    gradient: 'bg-gradient-to-r bg-clip-text text-transparent',
    link: 'font-normal hover:underline',
    code: 'font-mono text-sm',
    quote: 'text-lg font-light italic',
    highlight: 'font-medium',
  },
  
  // Enhanced body text for long-form content
  article: {
    title: 'text-3xl md:text-4xl lg:text-5xl font-extralight tracking-tight',
    lead: 'text-xl md:text-2xl font-light leading-relaxed text-gray-700',
    body: 'text-base md:text-lg font-normal leading-relaxed',
    caption: 'text-sm font-light text-gray-600 leading-relaxed',
  },
  
  // Interactive content elements
  content: {
    sectionTitle: 'text-2xl md:text-3xl font-extralight tracking-tight',
    subsectionTitle: 'text-xl md:text-2xl font-light',
    tableOfContents: 'text-sm font-medium hover:text-primary transition-colors',
    caseStudy: 'text-base font-normal',
    keyPoint: 'text-base font-medium',
    emphasis: 'font-medium',
  },
  
  // FAQ and details
  faq: {
    question: 'text-lg md:text-xl font-light',
    answer: 'text-base font-normal leading-relaxed text-gray-800',
  },
}

// Helper function to combine typography classes
export const cn = (...classes: (string | undefined)[]) => {
  return classes.filter(Boolean).join(' ')
}

// Typography constants only - no React components to avoid import issues
// Use these classes directly in your components

// Usage examples in comments:
/*
// Platform page hero:
<h1 className={typography.platform.hero}>YouTube Thumbnail Maker</h1>
<p className={typography.platform.subtitle}>Create stunning thumbnails...</p>

// Tool page stats:
<div className={typography.tool.stat}>100+</div>
<div className={typography.tool.statLabel}>Templates Available</div>

// Using Text components:
<Text.H1>Main Heading</Text.H1>
<Text.Body size="large">Large body text with proper weight</Text.Body>

// Combining classes:
<h2 className={cn(typography.heading.h2, 'text-blue-600 mb-8')}>
  Colored Heading with Margin
</h2>
*/