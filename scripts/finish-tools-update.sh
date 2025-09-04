#!/bin/bash

# Update SocialMediaPosterTool.tsx
cat > /tmp/social_update.txt << 'EOF'
import { Sparkles } from 'lucide-react'
import OutputGallery from '@/components/output-gallery'
EOF

# Update WebinarPosterTool.tsx  
cat > /tmp/webinar_update.txt << 'EOF'
import { Sparkles } from 'lucide-react'
import OutputGallery from '@/components/output-gallery'
EOF

echo "Manual update required for SocialMediaPosterTool and WebinarPosterTool"
echo "Add OutputGallery import and replace gallery sections"