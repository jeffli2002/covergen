# CoverGen Pro - AI-Powered Cover & Poster Generator

An advanced AI-powered platform for generating professional covers and posters for content creators across multiple social media platforms.

## Features

- 🎨 **AI-Powered Generation**: Create stunning covers using Gemini 2.5 Flash AI
- 🖼️ **Multi-Platform Support**: Optimized for YouTube, TikTok, Twitter, Spotify, Bilibili, Xiaohongshu, WeChat, and Twitch
- 🔄 **Dual Generation Modes**: Image-to-image and text-to-image generation
- ✂️ **Smart Image Processing**: Real-time preprocessing with intelligent cropping
- 🔐 **Authentication**: Secure login with email/password and Google OAuth
- 🎁 **Free Tier**: Generate up to 3 images per day for free
- 📱 **Responsive Design**: Optimized for both mobile and desktop

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Authentication**: Supabase Auth
- **AI Integration**: OpenRouter API with Gemini 2.5 Flash
- **State Management**: Zustand
- **UI Components**: Radix UI/Shadcn

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account
- OpenRouter API key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/jeffli2002/covergen.git
cd covergen
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file with:
```env
OPENROUTER_API_KEY=your_openrouter_api_key
NEXT_PUBLIC_SITE_URL=http://localhost:3001
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3001](http://localhost:3001) to see the application.

## Usage

1. **Select Generation Mode**: Choose between "Image to Image" or "Text to Image"
2. **Choose Platform**: Select your target social media platform for optimized dimensions
3. **Enter Title & Description**: Provide a title and description for your cover
4. **Generate**: Click generate to create multiple AI-powered cover options
5. **Download**: Select and download your favorite generated covers

## Project Structure

```
covergen/
├── src/
│   ├── app/           # Next.js app router pages
│   ├── components/    # React components
│   ├── contexts/      # React contexts (Auth)
│   ├── hooks/         # Custom React hooks
│   ├── lib/           # Utility functions and configurations
│   └── services/      # API services
├── backend/           # Backend microservices (planned)
└── public/           # Static assets
```

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript type checking

### Google OAuth Setup

See [GOOGLE_OAUTH_FIX.md](./GOOGLE_OAUTH_FIX.md) for detailed instructions on setting up Google OAuth.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- AI powered by [OpenRouter](https://openrouter.ai/) and Google's Gemini
- Authentication by [Supabase](https://supabase.com/)

---

🤖 Generated with [Claude Code](https://claude.ai/code)