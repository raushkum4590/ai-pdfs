# AI PDF Assistant

This is a Next.js application that allows users to upload PDF files and interact with them using AI-powered chat interfaces. The application uses advanced AI models to analyze PDF content and answer questions about documents.

## Features

- PDF upload and storage using Convex
- AI-powered document analysis and chat
- Three analysis modes: Smart Search, Full Analysis, and Summary
- Authentication using Clerk
- Responsive design with Tailwind CSS

## Environment Setup

Create a `.env.local` file with the following variables:

```
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=YOUR_CLERK_PUBLISHABLE_KEY
CLERK_SECRET_KEY=YOUR_CLERK_SECRET_KEY
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/

# Convex (Backend)
NEXT_PUBLIC_CONVEX_URL=YOUR_CONVEX_URL

# AI Services
NEXT_PUBLIC_OPEN_ROUTER_API_KEY=YOUR_OPENROUTER_API_KEY
GOOGLE_GENERATIVE_AI_API_KEY=YOUR_GOOGLE_AI_API_KEY
```

## Getting Started

First, install dependencies and run the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Deployment Instructions

### 1. Set up Convex Backend

First, deploy your Convex functions:

```bash
npx convex login    # Login to Convex (first time only)
npx convex dev      # Start development server
npx convex deploy   # Deploy functions to production
```

Make note of your Convex deployment URL to use in the environment variables.

### 2. Deploy to Vercel

The application is optimized for Vercel deployment. Follow these steps:

1. Fork or push your repository to GitHub
2. Connect your repository to Vercel
3. Set up all the environment variables in Vercel
4. Deploy using one of these methods:

   a. **Using the Vercel Dashboard:**
      - Set all environment variables
      - Click "Deploy"
   
   b. **Using Vercel CLI:**
      ```bash
      npm run deploy   # Uses our custom deploy script
      vercel --prod    # Deploy to production
      ```

### 3. Deployment Configuration

The application includes a `vercel.json` file with optimized build settings:

```json
{
  "framework": "nextjs",
  "buildCommand": "npm ci --legacy-peer-deps && npm install --save-dev postcss@latest autoprefixer@latest tailwindcss@latest tailwindcss-animate && npm run build",
  "installCommand": "npm ci --legacy-peer-deps",
  "ignoreCommand": "node -e \"process.exit(process.env.NEXT_BUILD_REASON?.includes('config') ? 1 : 0)\"",
  "devCommand": "npm run dev"
}
```

## Troubleshooting

### PDF Content Analysis Issues

If the AI isn't properly analyzing your PDFs:

1. Check your API keys in the environment variables
2. Try using different analysis modes (Smart/Full/Summary)
3. Make sure the PDF is text-based and not just images
4. Check Convex logs for any errors in content extraction

### Build Errors

If you encounter Tailwind CSS or PostCSS build errors:

1. Make sure `postcss.config.mjs` has the correct plugin configuration:
   ```js
   plugins: {
     tailwindcss: {},
     autoprefixer: {},
   }
   ```
2. Check that all dependencies are installed correctly
3. Run the deploy script which installs the necessary packages

## Deployment

### Prerequisites

Make sure you have the following environment variables set up in your Vercel project:

- `GOOGLE_GENERATIVE_AI_API_KEY`: API key for Google AI
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`: Clerk publishable key
- `CLERK_SECRET_KEY`: Clerk secret key
- `CONVEX_DEPLOYMENT`: Convex deployment ID
- `NEXT_PUBLIC_CONVEX_URL`: Convex URL

### Deployment Steps

1. Fork this repository
2. Connect your Vercel account
3. Configure the environment variables
4. Deploy with the following settings in your vercel.json:

```json
{
  "framework": "nextjs",
  "buildCommand": "npm ci --legacy-peer-deps && npm install --save-dev @tailwindcss/postcss postcss@latest autoprefixer@latest tailwindcss-animate && npm run build",
  "installCommand": "npm ci --legacy-peer-deps",
  "ignoreCommand": "node -e \"process.exit(process.env.NEXT_BUILD_REASON?.includes('config') ? 1 : 0)\"",
  "devCommand": "npm run dev"
}
```

### CSS Dependencies Issue Fix

If you encounter issues with Tailwind CSS or PostCSS during deployment, run:

```bash
npm install --save-dev @tailwindcss/postcss postcss@latest autoprefixer@latest tailwindcss-animate
```

And update your postcss.config.mjs to:

```javascript
const config = {
  plugins: {
    '@tailwindcss/postcss': {},
    autoprefixer: {},
  },
};

export default config;
```

## Features

- PDF upload and viewing
- AI-powered document analysis
- Summarization of PDF content
- Question answering based on document content
- Authentication with Clerk
- Premium features with subscription model

## Technology Stack

- Next.js 15
- Clerk Authentication
- Convex Database
- Google AI for document analysis
- Tailwind CSS for styling
