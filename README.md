# SmartMob Frontend - Docker Deployment

This is the frontend application for SmartMob built with React, Vite, and Tailwind CSS.

## 🚀 Quick Start with Docker

### Prerequisites
- Docker Desktop installed
- Git installed

### Deployment Steps
```bash
# 1. Clone the frontend repository
git clone https://github.com/DouiriMouheb/SmartMobFront.git
cd SmartMobFront

# 2. Copy environment file and configure
cp .env.example .env

# 3. Build and run frontend
docker-compose up --build -d
```

### Access the Application
- Frontend: http://localhost:3000
- Make sure your API is running on: http://localhost:5000

## 🐳 Docker Commands

### Frontend Deployment
```bash
# Build and start frontend
docker-compose up --build

# Run in background
docker-compose up -d --build

# Stop frontend
docker-compose down

# View logs
docker-compose logs -f smartmob-frontend
```

### Alternative: Direct Docker
```bash
# Build frontend image
docker build -t smartmob-frontend .

# Run frontend container
docker run -p 3000:80 -e VITE_API_BASE_URL=http://localhost:5000 smartmob-frontend
```

## 🔧 Configuration

### Environment Variables
Create a `.env` file from `.env.example` and configure:
- `VITE_API_BASE_URL`: URL of your backend API (default: http://localhost:5000)

### API Requirements
Your backend API should:
- Be running separately on port 5000 (using its own Docker setup)
- Have CORS enabled for http://localhost:3000
- Have the following endpoints:
  - `/api/DatabaseRecords` (for Settings page)
  - `/api/ControlloQualita` (for Quality Control page)

## 📋 Complete Deployment Workflow

### On New Desktop:

1. **Deploy API First**:
   ```bash
   # In SmartMob API folder
   cd SmartMob
   docker-compose up --build -d
   # API will be available on http://localhost:5000
   ```

2. **Deploy Frontend**:
   ```bash
   # In SmartMobFront folder
   cd SmartMobFront
   cp .env.example .env
   docker-compose up --build -d
   # Frontend will be available on http://localhost:3000
   ```

3. **Access Application**:
   - Frontend: http://localhost:3000
   - API: http://localhost:5000

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
