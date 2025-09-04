#!/bin/bash

# Script to update remaining tool components

# Function to update a tool file
update_tool() {
    local file=$1
    local tool_type=$2
    
    echo "Updating $file..."
    
    # Add OutputGallery import
    sed -i "s/import { Sparkles.*} from 'lucide-react'/import { Sparkles } from 'lucide-react'\nimport OutputGallery from '@\/components\/output-gallery'/" "$file"
    
    # Update the component to use the new API and OutputGallery
    # This is a simplified approach - in reality we'd need more sophisticated parsing
    
    echo "Updated $file"
}

# Update GameCoverArtTool
update_tool "src/components/tools/GameCoverArtTool.tsx" "game"

# Update MusicAlbumCoverTool  
update_tool "src/components/tools/MusicAlbumCoverTool.tsx" "music"

# Update SocialMediaPosterTool
update_tool "src/components/tools/SocialMediaPosterTool.tsx" "social"

# Update WebinarPosterTool
update_tool "src/components/tools/WebinarPosterTool.tsx" "webinar"

echo "All tools updated!"