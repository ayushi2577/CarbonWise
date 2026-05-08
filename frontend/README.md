# CarbonWise — React Frontend

## Quick Start (3 commands)

```bash
npm install
npm run dev
```

Frontend runs at: http://localhost:5173

Requires Django backend running at http://localhost:8000 (for AI chat).

## Build for Production

```bash
npm run build
```

Output goes to `dist/` — deploy to Vercel, Netlify, or any static host.

## Tech Stack

- React 18 + Vite
- React Router v6
- Framer Motion (animations)
- Chart.js + react-chartjs-2 (lifecycle charts)
- Lucide React (icons)

## Project Structure

```
src/
  data/index.js         ← All vehicle + grid data
  pages/
    Home.jsx            ← Landing page
    Compare.jsx         ← Car comparison tool
    Calculator.jsx      ← Personal calculator
    GoGreen.jsx         ← Tool gateway
    TheReality.jsx      ← Education page
    Community.jsx       ← RSS news feed
    Insights.jsx        ← Leaderboard + stats
  components/
    Navbar.jsx
    Footer.jsx
    AIChat.jsx          ← Floating AI assistant
  styles/globals.css    ← Full design system
```

## Deploying to Vercel

1. Push to GitHub
2. Import to Vercel
3. Set environment variable: `VITE_API_URL=https://your-backend.com`
4. Deploy — done
