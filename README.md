# Escape Room

An interactive web-based escape room application where users solve puzzles by progressing through chapters. Create your own escape rooms with AI assistance or manually design each challenge.

## Features

- **Interactive Escape Rooms**: Navigate through chapters, solve puzzles, and unlock new challenges
- **AI-Powered Generation**: Create escape rooms using the Gemini API with structured output
- **Theme Support**: Choose from multiple themes when generating escape rooms
- **Hint System**: Access progressive hints within each chapter to help solve puzzles
- **User Authentication**: Sign in with GitHub using Better Auth
- **Progress Tracking**: 
  - Registered users: Progress saved in database
  - Guest users: Progress saved in local storage
- **Room Management**: Create, edit, and manage your own escape rooms
- **Responsive Design**: Built with TailwindCSS and DaisyUI

## Tech Stack

- **Framework**: SvelteKit with Svelte 5 (runes syntax)
- **Language**: TypeScript
- **Styling**: TailwindCSS 4 with DaisyUI
- **Database**: Better-SQLite3 with Drizzle ORM
- **Authentication**: Better Auth (GitHub OAuth)
- **AI Integration**: Google Gemini API
- **Validation**: Zod

## Prerequisites

- Node.js (v18 or higher)
- npm or pnpm
- GitHub account (for OAuth authentication)
- Google Gemini API key (for AI-powered room generation)

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/BP---/escape-room.git
   cd escape-room
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   # Better Auth
   BETTER_AUTH_SECRET=your-secret-key-here
   GITHUB_CLIENT_ID=your-github-oauth-app-client-id
   GITHUB_CLIENT_SECRET=your-github-oauth-app-client-secret
   
   # Base URL for auth callbacks
   BETTER_AUTH_URL=http://localhost:5173
   
   # Google Gemini API
   GEMINI_API_KEY=your-gemini-api-key-here
   ```

4. **Set up GitHub OAuth**
   
   - Go to GitHub Settings > Developer settings > OAuth Apps
   - Create a new OAuth App
   - Set Authorization callback URL to: `http://localhost:5173/api/auth/callback/github`
   - Copy the Client ID and Client Secret to your `.env` file

5. **Set up the database**
   
   Generate and push the database schema:
   ```bash
   npm run db:generate
   npm run db:push
   ```

6. **Start the development server**
   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:5173`

## Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the application for production
- `npm run preview` - Preview the production build
- `npm run check` - Run TypeScript and Svelte checks
- `npm run check:watch` - Run checks in watch mode
- `npm run db:generate` - Generate database migrations
- `npm run db:push` - Push schema changes to database
- `npm run db:migrate` - Run database migrations
- `npm run db:studio` - Open Drizzle Studio for database management

## Project Structure

```
src/
├── lib/
│   ├── auth.ts              # Better Auth configuration
│   ├── auth-client.ts       # Client-side auth utilities
│   ├── components/          # Reusable Svelte components
│   ├── server/
│   │   └── db/
│   │       ├── index.ts     # Database connection
│   │       └── schema.ts    # Drizzle schema definitions
│   └── stores/
│       └── progress.ts      # Progress tracking store
├── routes/
│   ├── escape-room/
│   │   └── [roomID]/        # Escape room viewer
│   │       └── [chapter]/   # Individual chapter view
│   ├── create/              # Create new escape rooms
│   ├── edit/                # Edit existing escape rooms
│   ├── user/                # User profile and rooms
│   └── api/                 # API endpoints
└── hooks.server.ts          # Server hooks for auth
```

## Database Schema

- **users**: GitHub user data and authentication
- **escapeRooms**: Room metadata (title, theme, owner)
- **chapters**: Individual challenges within rooms
- **hints**: Progressive hints for each chapter

## Usage

### For Players

1. Browse available escape rooms on the home page
2. Click on a room to start playing
3. Complete chapters sequentially by solving puzzles
4. Enter answers to unlock the next chapter
5. Use hints if you get stuck

### For Creators

1. Sign in with GitHub
2. Navigate to `/create`
3. Choose to use AI generation (provide a prompt and theme) or create manually
4. Add chapters with questions, answers, and hints
5. Share your escape room with others

## Guest vs Registered Users

- **Guest Users**: Progress saved in browser's local storage (per room)
- **Registered Users**: Progress saved in database, accessible across devices

## License

Private project - see repository for details.

## Contributing

This is a private project. Contact the repository owner for contribution guidelines.