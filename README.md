# Super Bowl Squares

A mobile-optimized web app for playing Super Bowl squares with friends.

## Features

- **Admin**: Create games with custom price per square and payout schedule (Q1, Halftime, Q3, Final)
- **Invite Link**: Share a unique link for players to join
- **Players**: Enter name, select quantity of squares to buy, then pick specific squares from the grid
- **Real-time**: Live updates when players select squares (Socket.io)
- **Start Game**: Admin assigns random 0-9 numbers to rows/columns and locks the grid

## Setup

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Scripts

- `npm run dev` - Start development server with Socket.io
- `npm run build` - Build for production
- `npm start` - Start production server

## Tech Stack

- Next.js 14+ (App Router)
- TypeScript
- Tailwind CSS
- SQLite (better-sqlite3)
- Socket.io

## Database

The SQLite database is stored in `/data/squares.db` and is created automatically on first run.

## Deployment (Railway)

To host so players can access from their phones:

1. **Create a GitHub repo** at github.com (e.g. `super-bowl-squares`)

2. **Push your code:**
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/super-bowl-squares.git
   git push -u origin main
   ```

3. **Deploy to Railway:**
   - Sign up at [railway.app](https://railway.app)
   - New Project → Deploy from GitHub repo → select your repo
   - Add a **Volume** and mount at `/data` (for SQLite persistence)
   - Set `NODE_ENV=production`
   - Deploy — Railway runs `npm run build` then `npm start`

4. **Share the URL** (e.g. `https://your-app.up.railway.app`) with players.
