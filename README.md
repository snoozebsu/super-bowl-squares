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
