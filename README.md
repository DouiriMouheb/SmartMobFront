# SmartMob Frontend

React frontend application for SmartMob built with Vite and Tailwind CSS.

## 🚀 Quick Start

### Prerequisites
- Docker Desktop
- Git

### Setup Steps
```bash
# 1. Clone the repository
git clone https://github.com/DouiriMouheb/SmartMobFront.git
cd SmartMobFront

# 2. Create your environment file
cp .env.example .env

# 3. Edit .env file to set your API URL
# VITE_API_BASE_URL=https://your-api-url.com

# 4. Build and run with Docker
docker-compose up --build
```

The application will be available at: http://localhost:3000

## 🔧 Configuration

### Environment Variables

Edit your `.env` file:

```bash
# Required: Your API base URL
VITE_API_BASE_URL=http://localhost:5065/
```

**Important**: Environment variables are built into the application at build time. If you change your `.env` file, you must rebuild:

```bash
docker-compose up --build
```

## � Docker Commands

```bash
# Build and start
docker-compose up --build

# Run in background
docker-compose up -d --build

# Stop
docker-compose down

# View logs
docker-compose logs -f smartmob-frontend
```
- **Search & Filtering**: Advanced table functionality
- **Pagination**: Configurable records per page
- **Italian Localization**: All text in Italian

## 🛠️ Development

For local development without Docker:
```bash
npm install
npm run dev
```

## 📁 Project Structure
```
src/
├── components/        # Reusable components
├── pages/            # Page components
├── services/         # API services
├── hooks/           # Custom React hooks
└── layouts/         # Layout components
```

## 🔨 Built With
- React 18
- Vite
- Tailwind CSS
- Lucide React (icons)
- React Hot Toast (notifications)
- React Router (navigation)+ Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
