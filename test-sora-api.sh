#!/bin/bash

# Test Sora API with the same params
curl -X POST "https://api.kie.ai/api/v1/jobs/createTask" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer 9ed11e892b19798118cbe9610c0bea7c" \
  -d '{
    "model": "sora-2-image-to-video",
    "input": {
      "aspect_ratio": "landscape",
      "image_urls": ["https://res.cloudinary.com/dvskpqqvv/image/upload/v1759546774/sbkv9j2tyrmo7veh9joa.jpg"],
      "prompt": "the boy flies a lego plane",
      "quality": "standard"
    }
  }' | jq .
