import { 
  Lightbulb, 
  Image, 
  Target, 
  Palette, 
  TrendingUp, 
  BookOpen,
  Play,
  Clock,
  Star,
  Users,
  Youtube,
  Eye,
  MousePointer,
  Zap,
  Rocket,
  Edit,
  CreditCard,
  Package,
  Download,
  AlertCircle,
  Layers,
  Settings,
  Upload,
  Grid
} from 'lucide-react'

export type Tutorial = {
  title: string
  description: string
  duration: string
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
  tags: string[]
  content: string
  steps?: {
    title: string
    description: string
  }[]
}

export type TutorialCategory = {
  id: string
  title: string
  icon: any
  description: string
  tutorials: Tutorial[]
}

export const tutorialCategories: TutorialCategory[] = [
  {
    id: 'getting-started',
    title: 'How to Get Started',
    icon: Rocket,
    description: 'Begin your journey with our AI cover generator',
    tutorials: [
      {
        title: 'How to Create Your First Cover',
        description: 'A complete walkthrough from sign up to your first AI-generated cover',
        duration: '10 min read',
        difficulty: 'Beginner',
        tags: ['Getting Started', 'First Steps', 'Quick Start'],
        content: `Welcome to our AI cover generation platform! This tutorial will guide you through creating your first cover image from start to finish.`,
        steps: [
          {
            title: 'Sign Up or Log In',
            description: 'Visit our homepage and click the "Get Started" button. You can sign up with your email or use Google OAuth for quick access.'
          },
          {
            title: 'Choose Your Platform',
            description: 'Select your target platform (YouTube, Twitch, Spotify, etc.). Each platform has optimized dimensions and style presets.'
          },
          {
            title: 'Enter Your Title',
            description: 'Type the title for your content. Keep it concise and engaging - this will help the AI understand your content theme.'
          },
          {
            title: 'Upload Your Logo/Avatar',
            description: 'Upload your channel logo or avatar image. This helps maintain brand consistency across all your covers.'
          },
          {
            title: 'Select a Style Template',
            description: 'Browse through our curated style templates or describe your own style preferences in the prompt field.'
          },
          {
            title: 'Generate Your Cover',
            description: 'Click "Generate" and wait 10-15 seconds. The AI will create 4 unique variations based on your inputs.'
          },
          {
            title: 'Choose and Download',
            description: 'Select your favorite design, make any final edits if needed, then download in your preferred format.'
          }
        ]
      },
      {
        title: 'How to Set Up Your Brand Profile',
        description: 'Configure your brand settings for consistent cover generation',
        duration: '8 min read',
        difficulty: 'Beginner',
        tags: ['Branding', 'Profile Setup', 'Consistency'],
        content: `Setting up your brand profile ensures all your generated covers maintain consistent styling and branding elements.`,
        steps: [
          {
            title: 'Navigate to Profile Settings',
            description: 'Click on your avatar in the top-right corner and select "Brand Settings" from the dropdown menu.'
          },
          {
            title: 'Upload Brand Assets',
            description: 'Upload your logo variations, watermarks, and any recurring visual elements you use in your content.'
          },
          {
            title: 'Define Brand Colors',
            description: 'Set your primary and secondary brand colors. The AI will prioritize these colors in all generated designs.'
          },
          {
            title: 'Set Default Style Preferences',
            description: 'Choose your preferred art styles, moods, and visual themes that align with your brand identity.'
          },
          {
            title: 'Create Style Presets',
            description: 'Save frequently used combinations of settings as presets for quick access in future projects.'
          }
        ]
      },
      {
        title: 'How to Navigate the Dashboard',
        description: 'Master the interface and discover all available features',
        duration: '5 min read',
        difficulty: 'Beginner',
        tags: ['Interface', 'Navigation', 'Features'],
        content: `Understanding the dashboard layout will help you work more efficiently and discover powerful features.`,
        steps: [
          {
            title: 'Explore the Main Dashboard',
            description: 'The dashboard shows your recent projects, quick actions, and usage statistics at a glance.'
          },
          {
            title: 'Use the Project Library',
            description: 'Access all your past covers in the library. Use filters to find specific projects by date, platform, or style.'
          },
          {
            title: 'Check Usage Analytics',
            description: 'Monitor your monthly usage, popular styles, and generation success rates in the analytics section.'
          },
          {
            title: 'Access Quick Actions',
            description: 'Use the quick action buttons for common tasks like duplicating projects or creating variations.'
          },
          {
            title: 'Customize Your Workspace',
            description: 'Arrange dashboard widgets and set your preferred view options for a personalized experience.'
          }
        ]
      }
    ]
  },
  {
    id: 'prompt-engineering',
    title: 'How to Write Effective Prompts',
    icon: Lightbulb,
    description: 'Master the art of AI prompt writing for better results',
    tutorials: [
      {
        title: 'How to Write Clear and Specific Prompts',
        description: 'Learn the fundamentals of crafting prompts that produce consistent, high-quality results',
        duration: '12 min read',
        difficulty: 'Beginner',
        tags: ['Basics', 'Prompts', 'AI Tips'],
        content: `Effective prompt writing is the key to getting exactly what you want from AI generation. This guide covers the essential principles.`,
        steps: [
          {
            title: 'Start with the Subject',
            description: 'Begin your prompt with a clear description of the main subject. For example: "A gamer celebrating victory" or "A cooking tutorial setup".'
          },
          {
            title: 'Add Style Descriptors',
            description: 'Include artistic style preferences like "vibrant anime style", "minimalist design", or "photorealistic render".'
          },
          {
            title: 'Specify Mood and Atmosphere',
            description: 'Use emotional descriptors: "energetic and exciting", "calm and professional", or "mysterious and dramatic".'
          },
          {
            title: 'Include Color Preferences',
            description: 'Mention specific colors or color schemes: "warm orange and purple gradient", "monochrome with red accents".'
          },
          {
            title: 'Add Composition Details',
            description: 'Describe the layout: "centered composition", "rule of thirds", "dynamic diagonal layout".'
          },
          {
            title: 'Use Negative Prompts',
            description: 'Specify what to avoid: "no text overlays", "no cluttered backgrounds", "no dark colors".'
          }
        ]
      },
      {
        title: 'How to Use Reference Images Effectively',
        description: 'Maximize the impact of reference images for consistent brand styling',
        duration: '10 min read',
        difficulty: 'Intermediate',
        tags: ['Reference Images', 'Branding', 'Consistency'],
        content: `Reference images are powerful tools for maintaining visual consistency across your content. Learn how to use them effectively.`,
        steps: [
          {
            title: 'Choose High-Quality References',
            description: 'Select clear, well-composed images that represent your desired style. Avoid blurry or low-resolution images.'
          },
          {
            title: 'Match Reference to Intent',
            description: 'Use references that align with your content type - gaming references for gaming content, lifestyle for vlogs.'
          },
          {
            title: 'Combine Multiple References',
            description: 'Use 2-3 reference images to blend different aspects: one for style, one for composition, one for color.'
          },
          {
            title: 'Adjust Reference Weight',
            description: 'Control how strongly the AI follows your reference using weight parameters (0.5 for subtle, 0.8 for strong).'
          },
          {
            title: 'Create Reference Libraries',
            description: 'Build collections of references for different content types to speed up your workflow.'
          }
        ]
      },
      {
        title: 'How to Create Platform-Specific Prompts',
        description: 'Optimize your prompts for different social media platforms',
        duration: '15 min read',
        difficulty: 'Advanced',
        tags: ['Platform Optimization', 'Advanced Prompts', 'CTR'],
        content: `Each platform has unique requirements and audience expectations. Tailor your prompts accordingly for maximum impact.`,
        steps: [
          {
            title: 'YouTube Thumbnail Prompts',
            description: 'Focus on high contrast, expressive faces, and clear focal points. Include "YouTube thumbnail" in your prompt for optimized results.'
          },
          {
            title: 'Instagram Post Prompts',
            description: 'Emphasize aesthetic appeal and cohesive color schemes. Add "Instagram worthy" or "aesthetic photography" to your prompts.'
          },
          {
            title: 'TikTok Cover Prompts',
            description: 'Request dynamic, eye-catching visuals with movement implied. Use terms like "viral", "trending", or "energetic".'
          },
          {
            title: 'Spotify Playlist Prompts',
            description: 'Focus on mood and atmosphere. Include music genre references and emotional descriptors.'
          },
          {
            title: 'Twitch Stream Prompts',
            description: 'Emphasize gaming elements, energy, and personality. Include "streaming overlay compatible" for better integration.'
          }
        ]
      }
    ]
  },
  {
    id: 'templates',
    title: 'How to Use Templates',
    icon: Layers,
    description: 'Work with pre-designed templates for faster creation',
    tutorials: [
      {
        title: 'How to Choose the Right Template',
        description: 'Select templates that match your content style and platform requirements',
        duration: '8 min read',
        difficulty: 'Beginner',
        tags: ['Templates', 'Selection', 'Quick Start'],
        content: `Templates provide a quick starting point for your covers. Learn how to choose and customize them effectively.`,
        steps: [
          {
            title: 'Browse Template Categories',
            description: 'Explore templates organized by platform, style, and content type in the template gallery.'
          },
          {
            title: 'Preview Template Variations',
            description: 'Click on any template to see multiple variations and example outputs before selecting.'
          },
          {
            title: 'Check Template Compatibility',
            description: 'Ensure the template supports your target platform dimensions and required features.'
          },
          {
            title: 'Consider Your Brand Fit',
            description: 'Choose templates that align with your existing brand colors and visual style.'
          },
          {
            title: 'Test with Sample Content',
            description: 'Use the preview feature to test how your content looks with different templates.'
          }
        ]
      },
      {
        title: 'How to Customize Templates',
        description: 'Modify templates to match your unique brand identity',
        duration: '12 min read',
        difficulty: 'Intermediate',
        tags: ['Customization', 'Branding', 'Design'],
        content: `Templates are starting points - customization makes them uniquely yours. Master these customization techniques.`,
        steps: [
          {
            title: 'Adjust Color Schemes',
            description: 'Click the color palette icon to modify primary, secondary, and accent colors to match your brand.'
          },
          {
            title: 'Replace Placeholder Elements',
            description: 'Swap out generic icons, shapes, and graphics with your own brand elements.'
          },
          {
            title: 'Modify Text Styling',
            description: 'Change fonts, sizes, and text effects while maintaining readability across devices.'
          },
          {
            title: 'Adjust Layout Composition',
            description: 'Reposition elements using the drag-and-drop interface to create your ideal composition.'
          },
          {
            title: 'Save Custom Variations',
            description: 'Save your customized templates as personal presets for future use.'
          }
        ]
      },
      {
        title: 'How to Create Template Collections',
        description: 'Build and organize your own template library for efficient workflow',
        duration: '10 min read',
        difficulty: 'Advanced',
        tags: ['Organization', 'Workflow', 'Collections'],
        content: `Creating template collections streamlines your content creation process and ensures consistency.`,
        steps: [
          {
            title: 'Create Collection Categories',
            description: 'Organize collections by content type, season, campaign, or any system that fits your workflow.'
          },
          {
            title: 'Import and Tag Templates',
            description: 'Add templates to collections and tag them with relevant keywords for easy searching.'
          },
          {
            title: 'Set Collection Permissions',
            description: 'Control who can view, use, or edit templates in team environments.'
          },
          {
            title: 'Create Template Variations',
            description: 'Generate multiple versions of successful templates for different use cases.'
          },
          {
            title: 'Share Collections',
            description: 'Export collections to share with team members or backup your custom templates.'
          }
        ]
      }
    ]
  },
  {
    id: 'editing',
    title: 'How to Edit Images',
    icon: Edit,
    description: 'Master the image editing tools for perfect covers',
    tutorials: [
      {
        title: 'How to Use Mask Selection',
        description: 'Learn to select and edit specific parts of your generated images',
        duration: '15 min read',
        difficulty: 'Intermediate',
        tags: ['Editing', 'Masks', 'Selection'],
        content: `Mask selection allows you to edit specific areas of your cover without affecting the rest. Master this powerful feature.`,
        steps: [
          {
            title: 'Access the Editor',
            description: 'Click the "Edit" button on any generated cover to enter the advanced editing interface.'
          },
          {
            title: 'Select the Mask Tool',
            description: 'Choose from rectangular, circular, or freehand selection tools based on your needs.'
          },
          {
            title: 'Create Your Selection',
            description: 'Draw around the area you want to edit. Use the add/subtract modes for complex selections.'
          },
          {
            title: 'Apply Targeted Edits',
            description: 'Once selected, apply filters, adjustments, or AI regeneration to just the masked area.'
          },
          {
            title: 'Refine Edge Details',
            description: 'Use the feather and smoothing options to blend edits naturally with the surrounding image.'
          },
          {
            title: 'Save Selection Presets',
            description: 'Save commonly used mask shapes as presets for consistent editing across multiple covers.'
          }
        ]
      },
      {
        title: 'How to Add Text and Graphics',
        description: 'Enhance your covers with typography and visual elements',
        duration: '12 min read',
        difficulty: 'Beginner',
        tags: ['Text', 'Graphics', 'Design Elements'],
        content: `Adding text and graphics can make your covers more informative and eye-catching. Learn the best practices.`,
        steps: [
          {
            title: 'Add Text Layers',
            description: 'Click the text tool and click anywhere on your cover to add a text layer.'
          },
          {
            title: 'Choose Appropriate Fonts',
            description: 'Select from our curated font library that includes options optimized for various platforms.'
          },
          {
            title: 'Apply Text Effects',
            description: 'Add shadows, outlines, or glows to ensure text remains readable on any background.'
          },
          {
            title: 'Import Custom Graphics',
            description: 'Upload SVG or PNG graphics like arrows, badges, or icons to enhance your design.'
          },
          {
            title: 'Layer Management',
            description: 'Organize elements using layers - reorder, group, and adjust opacity for perfect composition.'
          },
          {
            title: 'Maintain Platform Guidelines',
            description: 'Use the safe zone guides to ensure text and important elements arent cropped on different devices.'
          }
        ]
      },
      {
        title: 'How to Apply Filters and Effects',
        description: 'Use professional filters to enhance your cover aesthetics',
        duration: '10 min read',
        difficulty: 'Intermediate',
        tags: ['Filters', 'Effects', 'Enhancement'],
        content: `Filters and effects can transform a good cover into a great one. Learn when and how to use them effectively.`,
        steps: [
          {
            title: 'Access the Effects Panel',
            description: 'Open the effects panel from the editing toolbar to see all available options.'
          },
          {
            title: 'Preview Effects in Real-Time',
            description: 'Hover over any effect to see a live preview before applying it to your cover.'
          },
          {
            title: 'Adjust Effect Intensity',
            description: 'Use the intensity slider to control how strongly an effect is applied (0-100%).'
          },
          {
            title: 'Combine Multiple Effects',
            description: 'Layer different effects for unique looks - but avoid overprocessing that reduces clarity.'
          },
          {
            title: 'Create Effect Presets',
            description: 'Save your favorite effect combinations as presets for consistent styling.'
          },
          {
            title: 'Use Platform-Specific Optimization',
            description: 'Apply sharpening for YouTube, softening for Instagram, or high contrast for mobile viewing.'
          }
        ]
      }
    ]
  },
  {
    id: 'youtube-optimization',
    title: 'How to Create YouTube Thumbnails',
    icon: Youtube,
    description: 'Proven strategies for high-CTR YouTube thumbnails',
    tutorials: [
      {
        title: 'How to Design Gaming Thumbnails',
        description: 'Create epic gaming thumbnails that capture exciting moments and drive clicks',
        duration: '15 min read',
        difficulty: 'Intermediate',
        tags: ['Gaming', 'YouTube', 'CTR Optimization'],
        content: `Gaming thumbnails require dynamic visuals and emotional impact. Learn the techniques top gaming creators use.`,
        steps: [
          {
            title: 'Capture Peak Action Moments',
            description: 'Use screenshots or descriptions of the most exciting gameplay moments - explosions, victories, or dramatic fails.'
          },
          {
            title: 'Add Explosive Visual Effects',
            description: 'Include particle effects, light rays, or motion blur to suggest action and energy. Use our effects library.'
          },
          {
            title: 'Feature Expressive Reactions',
            description: 'If you include your face, use exaggerated expressions - shock, excitement, or intense focus work best.'
          },
          {
            title: 'Use Bold Contrast Colors',
            description: 'Combine bright colors with dark backgrounds. Red/black, blue/orange combinations typically achieve 12-15% CTR.'
          },
          {
            title: 'Include Game-Specific Elements',
            description: 'Add game logos, character art, or iconic items that fans will instantly recognize.'
          },
          {
            title: 'Test Different Variations',
            description: 'Create 3-4 variations focusing on different moments or emotions, then A/B test performance.'
          }
        ]
      },
      {
        title: 'How to Make Educational Thumbnails',
        description: 'Design clear, informative thumbnails for tutorials and educational content',
        duration: '12 min read',
        difficulty: 'Beginner',
        tags: ['Education', 'Tutorials', 'Clear Design'],
        content: `Educational thumbnails need to communicate value quickly while remaining visually appealing. Master these techniques.`,
        steps: [
          {
            title: 'Show the End Result',
            description: 'Feature the final outcome prominently - what viewers will achieve by watching your tutorial.'
          },
          {
            title: 'Use Numbered Lists',
            description: 'Include numbers like "5 Steps" or "3 Tips" - numbered thumbnails typically get 11-13% CTR.'
          },
          {
            title: 'Create Before/After Splits',
            description: 'Show transformation visually with a clear divider between the problem and solution states.'
          },
          {
            title: 'Add Clear, Readable Text',
            description: 'Use large, bold fonts with high contrast. Limit to 3-5 words for mobile readability.'
          },
          {
            title: 'Include Relevant Icons',
            description: 'Add tool icons, subject symbols, or platform logos to quickly communicate the topic.'
          },
          {
            title: 'Maintain Clean Composition',
            description: 'Avoid clutter - use the rule of thirds and leave breathing room around elements.'
          }
        ]
      },
      {
        title: 'How to Create Viral Vlog Thumbnails',
        description: 'Design lifestyle and vlog thumbnails that connect with viewers emotionally',
        duration: '14 min read',
        difficulty: 'Intermediate',
        tags: ['Vlog', 'Lifestyle', 'Emotions'],
        content: `Vlog thumbnails rely on personal connection and aspirational visuals. Learn to create thumbnails that resonate.`,
        steps: [
          {
            title: 'Focus on Facial Expressions',
            description: 'Use close-up shots with genuine, exaggerated emotions that match your video mood.'
          },
          {
            title: 'Showcase Lifestyle Elements',
            description: 'Include aspirational backgrounds - beautiful locations, cozy setups, or exciting activities.'
          },
          {
            title: 'Use Natural Lighting Effects',
            description: 'Apply warm, golden hour filters or bright, airy presets depending on your vlog style.'
          },
          {
            title: 'Create Story Teasers',
            description: 'Hint at the videos narrative without spoilers - use intriguing props or situations.'
          },
          {
            title: 'Maintain Personal Branding',
            description: 'Keep consistent color grading and style across all thumbnails for brand recognition.'
          },
          {
            title: 'Add Contextual Elements',
            description: 'Include small details that hint at the videos content - travel landmarks, food, or activities.'
          }
        ]
      }
    ]
  },
  {
    id: 'subscription',
    title: 'How to Manage Your Subscription',
    icon: CreditCard,
    description: 'Understand plans, billing, and account management',
    tutorials: [
      {
        title: 'How to Choose the Right Plan',
        description: 'Compare plans and select the best option for your needs',
        duration: '10 min read',
        difficulty: 'Beginner',
        tags: ['Pricing', 'Plans', 'Subscription'],
        content: `Understanding our pricing tiers helps you get the best value. Heres how to choose the perfect plan.`,
        steps: [
          {
            title: 'Assess Your Usage Needs',
            description: 'Calculate how many covers you typically create per month across all your platforms.'
          },
          {
            title: 'Compare Plan Features',
            description: 'Free: 10 covers/month, Pro: 100 covers/month + advanced features, Pro+: Unlimited + priority processing.'
          },
          {
            title: 'Consider Advanced Features',
            description: 'Pro plans include batch generation, custom templates, and API access for automation.'
          },
          {
            title: 'Calculate Cost Per Cover',
            description: 'Divide plan cost by your average monthly usage to find your per-cover cost.'
          },
          {
            title: 'Start with a Trial',
            description: 'Try Pro features free for 7 days to ensure they meet your needs before committing.'
          },
          {
            title: 'Upgrade or Downgrade Anytime',
            description: 'Plans can be changed at any time - upgrades are immediate, downgrades apply next billing cycle.'
          }
        ]
      },
      {
        title: 'How to Manage Billing and Payments',
        description: 'Update payment methods and understand billing cycles',
        duration: '8 min read',
        difficulty: 'Beginner',
        tags: ['Billing', 'Payments', 'Account'],
        content: `Keep your account running smoothly with proper billing management. Heres everything you need to know.`,
        steps: [
          {
            title: 'Access Billing Settings',
            description: 'Navigate to Account > Billing to view your current plan and payment information.'
          },
          {
            title: 'Update Payment Method',
            description: 'Add or change credit cards, PayPal, or other payment methods supported in your region.'
          },
          {
            title: 'View Billing History',
            description: 'Download invoices and receipts for tax purposes or expense reporting.'
          },
          {
            title: 'Set Billing Alerts',
            description: 'Enable notifications for upcoming charges, usage limits, or payment issues.'
          },
          {
            title: 'Manage Auto-Renewal',
            description: 'Toggle auto-renewal on/off and set renewal reminders if you prefer manual payments.'
          },
          {
            title: 'Apply Promotional Codes',
            description: 'Enter discount codes in the billing section - they apply to your next billing cycle.'
          }
        ]
      },
      {
        title: 'How to Track Usage and Credits',
        description: 'Monitor your generation credits and optimize usage',
        duration: '7 min read',
        difficulty: 'Intermediate',
        tags: ['Usage', 'Credits', 'Analytics'],
        content: `Tracking your usage helps you optimize your plan and avoid surprises. Learn to use our analytics tools.`,
        steps: [
          {
            title: 'Check Current Usage',
            description: 'View your dashboard for real-time credit balance and monthly usage statistics.'
          },
          {
            title: 'Set Usage Alerts',
            description: 'Configure alerts at 50%, 80%, and 90% usage to avoid running out of credits.'
          },
          {
            title: 'View Usage Patterns',
            description: 'Analyze which days and times you generate most covers to plan bulk creation sessions.'
          },
          {
            title: 'Optimize Credit Usage',
            description: 'Use draft mode for testing, and only generate final quality for approved concepts.'
          },
          {
            title: 'Understand Rollover Policy',
            description: 'Unused credits dont roll over, so plan your creation schedule throughout the month.'
          },
          {
            title: 'Purchase Additional Credits',
            description: 'Buy one-time credit packs if you need extra covers without upgrading your plan.'
          }
        ]
      }
    ]
  },
  {
    id: 'batch-generation',
    title: 'How to Batch Generate',
    icon: Grid,
    description: 'Create multiple covers efficiently',
    tutorials: [
      {
        title: 'How to Set Up Batch Generation',
        description: 'Configure and run bulk cover creation for multiple projects',
        duration: '12 min read',
        difficulty: 'Advanced',
        tags: ['Batch', 'Automation', 'Efficiency'],
        content: `Batch generation saves hours when creating covers for multiple videos or posts. Master this power feature.`,
        steps: [
          {
            title: 'Prepare Your Input Data',
            description: 'Create a CSV file with titles, descriptions, and any variable content for each cover.'
          },
          {
            title: 'Select Base Template',
            description: 'Choose a template or style that will be applied to all covers in the batch.'
          },
          {
            title: 'Map Data Fields',
            description: 'Connect CSV columns to template elements - title field to title text, etc.'
          },
          {
            title: 'Configure Variations',
            description: 'Set how many variations to generate per item (1-4 recommended for large batches).'
          },
          {
            title: 'Set Processing Priority',
            description: 'Choose standard or priority processing based on your deadline requirements.'
          },
          {
            title: 'Review and Launch',
            description: 'Preview a few examples, then launch the batch. Youll receive email notification when complete.'
          }
        ]
      },
      {
        title: 'How to Use Templates for Series',
        description: 'Create consistent covers for content series or campaigns',
        duration: '10 min read',
        difficulty: 'Intermediate',
        tags: ['Series', 'Consistency', 'Campaigns'],
        content: `Content series require visual consistency while maintaining uniqueness. Learn the best approach.`,
        steps: [
          {
            title: 'Design Series Template',
            description: 'Create a master template with consistent layout, leaving variable areas for episode-specific content.'
          },
          {
            title: 'Define Variable Elements',
            description: 'Mark which elements change per episode - episode numbers, guest photos, topic icons.'
          },
          {
            title: 'Create Style Guide',
            description: 'Document color variations, acceptable fonts, and element positioning rules.'
          },
          {
            title: 'Set Up Episode Prefixes',
            description: 'Use automatic numbering and naming conventions for easy organization.'
          },
          {
            title: 'Generate Test Batch',
            description: 'Create 3-5 test covers to ensure the series style works across different content.'
          },
          {
            title: 'Save as Series Preset',
            description: 'Lock the template as a series preset that team members can use but not modify.'
          }
        ]
      }
    ]
  },
  {
    id: 'export-download',
    title: 'How to Export & Download',
    icon: Download,
    description: 'Get your covers in the right format for any platform',
    tutorials: [
      {
        title: 'How to Choose Export Formats',
        description: 'Select the optimal file format and quality for your needs',
        duration: '8 min read',
        difficulty: 'Beginner',
        tags: ['Export', 'File Formats', 'Quality'],
        content: `Different platforms and use cases require different file formats. Learn which to choose and why.`,
        steps: [
          {
            title: 'Understand Format Options',
            description: 'JPG: Best for photos, smaller files. PNG: Best for graphics, supports transparency. WebP: Modern format, smallest size.'
          },
          {
            title: 'Consider Platform Requirements',
            description: 'YouTube: JPG recommended. Instagram: JPG for posts, PNG for stories. Design work: Always PNG.'
          },
          {
            title: 'Choose Quality Settings',
            description: 'High (95%): For professional use. Medium (85%): Balance of quality and size. Low (70%): For previews only.'
          },
          {
            title: 'Enable Smart Compression',
            description: 'Our AI optimizer reduces file size while maintaining visual quality for web use.'
          },
          {
            title: 'Set Naming Conventions',
            description: 'Configure automatic file naming with date, platform, and title for easy organization.'
          },
          {
            title: 'Batch Export Options',
            description: 'Export multiple covers at once with consistent settings and organized folder structure.'
          }
        ]
      },
      {
        title: 'How to Download for Multiple Platforms',
        description: 'Get platform-optimized versions of your cover in one click',
        duration: '6 min read',
        difficulty: 'Intermediate',
        tags: ['Multi-Platform', 'Optimization', 'Workflow'],
        content: `Save time by downloading pre-optimized versions for all your platforms at once.`,
        steps: [
          {
            title: 'Enable Multi-Platform Export',
            description: 'Toggle on "Export for all platforms" in the download dialog.'
          },
          {
            title: 'Select Target Platforms',
            description: 'Check which platforms you need - each will be optimized for that platforms specifications.'
          },
          {
            title: 'Review Dimension Presets',
            description: 'YouTube: 1280x720, Instagram Post: 1080x1080, Twitter: 1200x675, TikTok: 9:16 ratio.'
          },
          {
            title: 'Apply Platform-Specific Edits',
            description: 'Make minor adjustments for each platform version if needed before exporting.'
          },
          {
            title: 'Download as Package',
            description: 'Get all versions in an organized ZIP file with folders for each platform.'
          },
          {
            title: 'Use Direct Upload',
            description: 'Pro users can directly upload to connected social media accounts.'
          }
        ]
      }
    ]
  },
  {
    id: 'troubleshooting',
    title: 'How to Troubleshoot Issues',
    icon: AlertCircle,
    description: 'Solve common problems and get help when needed',
    tutorials: [
      {
        title: 'How to Fix Generation Errors',
        description: 'Resolve common issues when covers fail to generate',
        duration: '10 min read',
        difficulty: 'Intermediate',
        tags: ['Errors', 'Troubleshooting', 'Solutions'],
        content: `Generation errors can be frustrating. Heres how to identify and fix the most common issues.`,
        steps: [
          {
            title: 'Check Input Requirements',
            description: 'Ensure title is 1-200 characters, images are under 10MB, and all required fields are filled.'
          },
          {
            title: 'Verify Image Formats',
            description: 'Uploaded images must be JPG, PNG, or WebP. Convert other formats before uploading.'
          },
          {
            title: 'Review Content Guidelines',
            description: 'AI may reject inappropriate content. Rephrase prompts to avoid flagged terms.'
          },
          {
            title: 'Check Server Status',
            description: 'Visit our status page to see if there are any ongoing service issues.'
          },
          {
            title: 'Clear Cache and Retry',
            description: 'Clear browser cache and cookies, then try generating again.'
          },
          {
            title: 'Contact Support',
            description: 'If issues persist, use the in-app chat with your error code for quick assistance.'
          }
        ]
      },
      {
        title: 'How to Report Bugs',
        description: 'Help us improve by reporting issues effectively',
        duration: '5 min read',
        difficulty: 'Beginner',
        tags: ['Bugs', 'Feedback', 'Support'],
        content: `Your bug reports help us improve the platform. Learn how to report issues effectively.`,
        steps: [
          {
            title: 'Document the Issue',
            description: 'Take screenshots or screen recordings showing the problem as it occurs.'
          },
          {
            title: 'Note Error Messages',
            description: 'Copy any error codes or messages exactly as they appear.'
          },
          {
            title: 'Describe Steps to Reproduce',
            description: 'List the exact steps you took before encountering the issue.'
          },
          {
            title: 'Include System Information',
            description: 'Mention your browser, operating system, and browser extensions in use.'
          },
          {
            title: 'Submit Through Proper Channel',
            description: 'Use the bug report form in Settings > Help > Report Bug for fastest response.'
          },
          {
            title: 'Follow Up',
            description: 'Check your email for updates - we typically respond within 24-48 hours.'
          }
        ]
      },
      {
        title: 'How to Get Help and Support',
        description: 'Access our support resources and get assistance when you need it',
        duration: '7 min read',
        difficulty: 'Beginner',
        tags: ['Support', 'Help', 'Resources'],
        content: `We offer multiple support channels to help you succeed. Heres how to get the help you need.`,
        steps: [
          {
            title: 'Search Knowledge Base',
            description: 'Visit our help center and search for your issue - 80% of questions are answered there.'
          },
          {
            title: 'Use In-App Chat',
            description: 'Click the chat bubble for real-time support during business hours (9 AM - 6 PM EST).'
          },
          {
            title: 'Join Community Forum',
            description: 'Connect with other users, share tips, and get community support 24/7.'
          },
          {
            title: 'Watch Video Tutorials',
            description: 'Access our YouTube channel for visual walkthroughs of common tasks.'
          },
          {
            title: 'Schedule Pro Support Call',
            description: 'Pro+ users can book 1-on-1 support calls for complex issues or training.'
          },
          {
            title: 'Email Support',
            description: 'Send detailed inquiries to support@covergen.pro for non-urgent issues.'
          }
        ]
      }
    ]
  }
]