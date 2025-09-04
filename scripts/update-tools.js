const fs = require('fs');
const path = require('path');

const toolsDir = path.join(__dirname, '../src/components/tools');
const toolFiles = [
  'BookCoverCreatorTool.tsx',
  'EventPosterTool.tsx',
  'GameCoverArtTool.tsx',
  'MusicAlbumCoverTool.tsx',
  'SocialMediaPosterTool.tsx',
  'WebinarPosterTool.tsx'
];

// Template for the updated handleGenerate function
const generateHandleGenerateFunction = (toolType) => {
  const prompts = {
    book: 'Book cover design',
    event: 'Event poster design',
    game: 'Game cover art',
    music: 'Music album cover',
    social: 'Social media poster',
    webinar: 'Webinar poster design'
  };
  
  return `  const [generatedImages, setGeneratedImages] = useState<string[]>([])
  const [downloadingId, setDownloadingId] = useState<string | null>(null)

  const handleGenerate = async () => {
    if (!title.trim()) return
    
    setIsGenerating(true)
    setGeneratedImages([]) // Clear previous results
    
    try {
      // Build the prompt based on the tool type
      const prompt = \`${prompts[toolType]} - Title: "\${title}". \${description ? \`Description: \${description}\` : ''} Professional high-quality design.\`
      
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt,
          mode: 'text',
          style: style || 'modern',
          platform: 'none', // No specific platform dimensions
        }),
      })

      if (!response.ok) {
        throw new Error('Generation failed')
      }

      const data = await response.json()
      
      // Set only the first image from the response
      if (data.images && data.images.length > 0) {
        setGeneratedImages([data.images[0]])
      }
    } catch (error) {
      console.error('Generation error:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDownload = async (imageUrl: string, index: number) => {
    setDownloadingId(\`image_\${index}\`)
    try {
      const response = await fetch(imageUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = \`${toolType}-\${Date.now()}.png\`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Download error:', error)
    } finally {
      setDownloadingId(null)
    }
  }

  const handleGenerateNew = () => {
    setGeneratedImages([])
  }`
};

// Process each file
toolFiles.forEach(file => {
  const filePath = path.join(toolsDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Determine tool type
  const toolType = file.toLowerCase().includes('book') ? 'book' :
                   file.toLowerCase().includes('event') ? 'event' :
                   file.toLowerCase().includes('game') ? 'game' :
                   file.toLowerCase().includes('music') ? 'music' :
                   file.toLowerCase().includes('social') ? 'social' :
                   file.toLowerCase().includes('webinar') ? 'webinar' : 'general';

  // Add OutputGallery import if not present
  if (!content.includes('OutputGallery')) {
    content = content.replace(
      "import { Sparkles",
      "import { Sparkles\nimport OutputGallery from '@/components/output-gallery'"
    );
    
    // If the above pattern doesn't match, try another common pattern
    if (!content.includes('OutputGallery')) {
      content = content.replace(
        /import \{ ([^}]+) \} from 'lucide-react'/,
        "import { $1 } from 'lucide-react'\nimport OutputGallery from '@/components/output-gallery'"
      );
    }
  }

  // Replace the handleGenerate function and related state
  const statePattern = /const \[generatedImages, setGeneratedImages\] = useState<string\[\]>\(\[\]\)/;
  const handleGeneratePattern = /const handleGenerate = async \(\) => \{[\s\S]*?\n  \}/;
  
  // Replace state and handleGenerate
  content = content.replace(statePattern, '// State will be replaced');
  content = content.replace(handleGeneratePattern, '// handleGenerate will be replaced');
  
  // Insert new functions after the last state declaration
  const lastStateMatch = content.lastIndexOf('useState');
  const lineEnd = content.indexOf('\n', lastStateMatch);
  
  if (lineEnd !== -1) {
    content = content.slice(0, lineEnd + 1) + 
              '\n' + generateHandleGenerateFunction(toolType) + '\n' +
              content.slice(lineEnd + 1);
  }

  // Save the updated file
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Updated ${file}`);
});

console.log('All tool files have been updated!');