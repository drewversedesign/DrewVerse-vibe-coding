# Personal AI Software Builder

A sophisticated web-based application that generates full-stack web projects from natural language prompts using Gemini 2.0 Flash (with 1.5 Pro capability).

## Features

- **Prompt-to-App**: Create landing pages, tools, and websites with simple text.
- **Human-Quality Code**: Generates modular, professional React/Tailwind code.
- **Iterative Updates**: Refine your project with follow-up prompts and AI Design Audits.
- **Brand Tuning**: Customize primary colors, fonts, and rounding globally.
- **Live Preview & Code Viewer**: Real-time iframe preview and syntax-highlighted code inspection.
- **Persistence & Auth**: Integrated Neon Database and Neon Auth provisioning.
- **Actual Deployment**: Connect your GitHub repo and deploy directly to Render via API.
- **Mobile Responsive**: Full-featured mobile layout with bottom navigation.
- **Version Control**: Time-travel history snapshots of your project.
- **Export ZIP**: Download the complete project structure for local development.

## Environment Variables

To use the full features, create a `.env.local` file with:

```env
GEMINI_API_KEY=your_gemini_key
RENDER_API_KEY=your_render_key
NEON_API_KEY=your_neon_key
```

## Getting Started

1. Install dependencies: `npm install`
2. Run development server: `npm run dev`
3. Open [http://localhost:3000](http://localhost:3000)

## Architecture

- **Frontend**: Next.js 15, Tailwind CSS, Lucide React, Framer Motion.
- **Backend**: Next.js API Routes (Route Handlers).
- **AI**: Google Generative AI (Gemini SDK).
