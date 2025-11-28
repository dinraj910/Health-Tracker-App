# Contributing to MediTrack

Thank you for your interest in contributing to MediTrack! 🎉

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- MongoDB (local or Atlas)
- Git

### Setup

1. **Fork the repository**

2. **Clone your fork**
   ```bash
   git clone https://github.com/YOUR_USERNAME/meditrack.git
   cd meditrack
   ```

3. **Install dependencies**
   ```bash
   # Frontend
   cd frontend && npm install

   # Backend
   cd ../backend && npm install
   ```

4. **Set up environment variables**
   ```bash
   cp .env.example backend/.env
   # Edit backend/.env with your values
   ```

5. **Start development servers**
   ```bash
   # Terminal 1 - Backend
   cd backend && npm run dev

   # Terminal 2 - Frontend
   cd frontend && npm run dev
   ```

## Development Workflow

### Branch Naming Convention
- `feature/` - New features (e.g., `feature/medicine-reminders`)
- `fix/` - Bug fixes (e.g., `fix/login-validation`)
- `docs/` - Documentation (e.g., `docs/api-readme`)
- `refactor/` - Code refactoring
- `test/` - Adding tests

### Commit Messages
Follow conventional commits:
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation
- `style:` Formatting, no code change
- `refactor:` Code restructuring
- `test:` Adding tests
- `chore:` Maintenance

Example: `feat: add medicine reminder notifications`

### Pull Request Process

1. Create a feature branch from `develop`
2. Make your changes
3. Test thoroughly
4. Push to your fork
5. Open a PR against `develop`
6. Fill out the PR template
7. Wait for review

## Code Style

- Use ESLint and Prettier configurations provided
- Write meaningful comments
- Keep functions small and focused
- Use descriptive variable names

## Need Help?

Open an issue or start a discussion. We're happy to help!
