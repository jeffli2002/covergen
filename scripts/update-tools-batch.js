const fs = require('fs');
const path = require('path');

// Helper function to process a tool file
function processToolFile(filePath, toolName, description) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // 1. Update imports - add OutputGallery and remove unnecessary icons
  content = content.replace(
    /import \{ Sparkles[^}]+\} from 'lucide-react'/,
    `import { Sparkles } from 'lucide-react'
import OutputGallery from '@/components/output-gallery'`
  );
  
  // 2. Add downloadingId state after generatedImages state
  const generatedImagesRegex = /const \[generatedImages, setGeneratedImages\] = useState<string\[\]>\(\[\]\)/;
  content = content.replace(
    generatedImagesRegex,
    `const [generatedImages, setGeneratedImages] = useState<string[]>([])
  const [downloadingId, setDownloadingId] = useState<string | null>(null)`
  );
  
  // 3. Replace handleGenerate function
  const handleGenerateStart = content.indexOf('const handleGenerate = async () => {');
  if (handleGenerateStart !== -1) {
    const handleGenerateEnd = content.indexOf('\n  }', handleGenerateStart) + 4;
    const newHandleGenerate = `const handleGenerate = async () => {
    if (!title.trim() && !eventName?.trim() && !businessName?.trim()) return
    
    setIsGenerating(true)
    setGeneratedImages([])
    
    try {
      const prompt = \`${description} professional high-quality design.\`
      
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt,
          mode: 'text',
          style: style || 'modern',
          platform: 'none',
        }),
      })

      if (!response.ok) {
        throw new Error('Generation failed')
      }

      const data = await response.json()
      
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
      a.download = \`${toolName}-\${Date.now()}.png\`
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
  }`;
    
    content = content.substring(0, handleGenerateStart) + newHandleGenerate + content.substring(handleGenerateEnd);
  }
  
  return content;
}

// Process MusicAlbumCoverTool
const musicPath = path.join(__dirname, '../src/components/tools/MusicAlbumCoverTool.tsx');
let musicContent = processToolFile(musicPath, 'music-album', 'Music album cover design');
fs.writeFileSync(musicPath, musicContent);
console.log('Updated MusicAlbumCoverTool.tsx');

// Process SocialMediaPosterTool
const socialPath = path.join(__dirname, '../src/components/tools/SocialMediaPosterTool.tsx');
let socialContent = processToolFile(socialPath, 'social-media', 'Social media poster design');
fs.writeFileSync(socialPath, socialContent);
console.log('Updated SocialMediaPosterTool.tsx');

// Process WebinarPosterTool
const webinarPath = path.join(__dirname, '../src/components/tools/WebinarPosterTool.tsx');
let webinarContent = processToolFile(webinarPath, 'webinar', 'Webinar poster design');
fs.writeFileSync(webinarPath, webinarContent);
console.log('Updated WebinarPosterTool.tsx');

console.log('All tools updated!');