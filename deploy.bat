@echo off
echo Running deployment preparation script...
npm ci --legacy-peer-deps
npm install --save-dev postcss@latest autoprefixer@latest tailwindcss@latest tailwindcss-animate
npx convex deploy
npm run build
echo Deployment preparation complete!
echo You can now deploy to Vercel with: vercel --prod
