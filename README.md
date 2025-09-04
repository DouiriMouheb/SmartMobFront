# SmartMob Frontend - Docker Deployment

This is the frontend application for SmartMob built with React, Vite, and Tailwind CSS.

## 🚀 Quick Start with Docker

### Prerequisites
- Docker Desktop installed
- Git installed

### Local Development
```bash
# Clone the repository
git clone https://github.com/DouiriMouheb/SmartMobFront.git
cd SmartMobFront

# Copy environment file
cp .env.example .env

# Build and run with Docker Compose
docker-compose up --build
```

### Access the Application
- Frontend: http://localhost:3000
- Make sure your API is running on http://localhost:7052

## 🐳 Docker Commands

### Using Docker Compose (Recommended)
```bash
# Build and start services
docker-compose up --build

# Run in background
docker-compose up -d --build

# Stop services
docker-compose down

# View logs
docker-compose logs -f smartmob-frontend
```

### Using Docker directly
```bash
# Build the image
docker build -t smartmob-frontend .

# Run the container
docker run -p 3000:80 -e VITE_API_BASE_URL=http://localhost:7052 smartmob-frontend
```

## 🔧 Configuration

### Environment Variables
Create a `.env` file from `.env.example` and configure:
- `VITE_API_BASE_URL`: URL of your backend API

### API Configuration
Make sure your backend API:
- Is running on the configured URL (default: http://localhost:7052)
- Has CORS enabled for http://localhost:3000
- Has the following endpoints available:
  - `/api/DatabaseRecords` (for Settings page)
  - `/api/ControlloQualita` (for Quality Control page)

## 📋 Features

- **Settings Page**: CRUD operations for database records
- **Controllo Qualità**: Quality control management
- **Responsive Design**: Works on desktop and mobile
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
