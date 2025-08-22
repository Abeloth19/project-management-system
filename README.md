# Project Management System

A modern, multi-tenant project management application built with Django, GraphQL, React, and TypeScript. Features organization-based data isolation, real-time task management, and a responsive user interface.

## 🚀 Features

- **Multi-tenant Architecture** - Complete organization-based data isolation
- **Project Management** - Create, organize, and track projects
- **Task Board** - Kanban-style task management with status tracking
- **Real-time Search** - Debounced search across projects and tasks
- **Comment System** - Collaborative task discussions
- **Responsive Design** - Mobile-first, works on all devices
- **Modern UI** - Professional interface with animations and loading states
- **Type Safety** - Full TypeScript implementation

## 🛠 Technology Stack

### Backend
- **Django 4.2** - Python web framework
- **GraphQL** - API layer with Graphene-Django
- **PostgreSQL** - Primary database
- **Multi-tenancy** - Organization-based data isolation

### Frontend
- **React 18** - Modern UI library
- **TypeScript** - Type-safe JavaScript
- **Apollo Client** - GraphQL client with caching
- **Tailwind CSS** - Utility-first styling
- **Vite** - Fast development build tool

### Infrastructure
- **Docker** - Containerized PostgreSQL development
- **Git** - Version control with clean commit history

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **Python** (v3.9 or higher)
- **Docker** & Docker Compose
- **Git**

### System Requirements
- **RAM**: 4GB minimum, 8GB recommended
- **Storage**: 2GB free space
- **OS**: Windows 10+, macOS 10.15+, or Linux

## ⚡ Quick Start

### 1. Clone the Repository
```bash
git clone <repository-url>
cd project-management
```

### 2. Start Database
```bash
# Start PostgreSQL container
docker-compose up -d

# Verify database is running
docker-compose ps
```

### 3. Setup Backend
```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Create sample data (optional)
python manage.py create_sample_data

# Create superuser (optional)
python manage.py createsuperuser

# Start Django server
python manage.py runserver
```

### 4. Setup Frontend
```bash
# Open new terminal and navigate to frontend
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

### 5. Access Application
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000/graphql/
- **Django Admin**: http://localhost:8000/admin/

## 🚀 Detailed Setup

### Environment Configuration

Create `.env` files with the following variables:

#### Backend (.env)
```env
SECRET_KEY=your-secret-key-here
DEBUG=True
DB_NAME=project_management_db
DB_USER=postgres
DB_PASSWORD=postgres_dev_password
DB_HOST=localhost
DB_PORT=5432
ALLOWED_HOSTS=localhost,127.0.0.1
```

#### Frontend (.env)
```env
VITE_GRAPHQL_URL=http://localhost:8000/graphql/
VITE_API_URL=http://localhost:8000
```

### Database Setup

The application uses PostgreSQL with Docker for development:

```bash
# Start database
docker-compose up -d

# Check logs
docker-compose logs postgres

# Stop database
docker-compose down

# Reset database (WARNING: deletes all data)
docker-compose down -v
docker-compose up -d
```

### Sample Data

Create realistic sample data for testing:

```bash
cd backend
python manage.py create_sample_data
```

This creates:
- 2 sample organizations (Acme Corporation, TechStart Inc)
- Multiple projects with different statuses
- Tasks across all status columns
- Sample comments and user interactions

## 🔧 Development

### Backend Development

```bash
cd backend

# Run tests
python manage.py test

# Create new migration
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Django shell
python manage.py shell

# Collect static files (production)
python manage.py collectstatic
```

### Frontend Development

```bash
cd frontend

# Development server with hot reload
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type checking
npm run type-check

# Linting
npm run lint
```

### GraphQL Development

Access GraphiQL interface for API exploration:
- URL: http://localhost:8000/graphql/
- Interactive query builder
- Schema documentation
- Real-time query testing

## 📱 Usage

### Getting Started

1. **Organization Selection**: Choose or create an organization
2. **Project Management**: Create projects and track progress
3. **Task Management**: Use the Kanban board to manage tasks
4. **Collaboration**: Add comments to tasks for team communication

### Key Workflows

#### Creating a Project
1. Click "Create Project" button
2. Fill in project details
3. Set status and due date
4. Save and start adding tasks

#### Managing Tasks
1. Navigate to project detail or task board
2. Click "Add Task" to create new tasks
3. Drag tasks between columns or use status menu
4. Add comments for collaboration

#### Organization Switching
1. Click organization dropdown in header
2. Select different organization
3. View switches to selected organization's data

## 🧪 Testing

### Backend Tests
```bash
cd backend
python manage.py test

# Specific test modules
python manage.py test tests.test_models
python manage.py test tests.test_graphql

# With coverage
pip install coverage
coverage run manage.py test
coverage report
```

### Test Coverage
- Model tests: 33 tests covering validation and business logic
- GraphQL tests: 20 tests covering queries and mutations
- Multi-tenancy isolation verification
- Error handling and edge cases

## 🚀 Production Deployment

### Environment Variables
Set production environment variables:
```env
DEBUG=False
SECRET_KEY=production-secret-key
ALLOWED_HOSTS=yourdomain.com
DB_PASSWORD=secure-production-password
```

### Database Migration
```bash
python manage.py migrate
python manage.py collectstatic --noinput
```

### Build Frontend
```bash
cd frontend
npm run build
# Deploy dist/ folder to CDN or static server
```

## 🔧 Troubleshooting

### Common Issues

#### Database Connection Error
```bash
# Check if PostgreSQL is running
docker-compose ps

# Restart database
docker-compose restart postgres

# Check logs
docker-compose logs postgres
```

#### Frontend Build Issues
```bash
# Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
npm run dev -- --force
```

#### Django Migration Issues
```bash
# Reset migrations (development only)
python manage.py migrate --fake-initial

# Or create fresh migrations
rm -rf apps/*/migrations/00*.py
python manage.py makemigrations
python manage.py migrate
```

### Performance Issues

#### Slow GraphQL Queries
- Check Django Debug Toolbar
- Optimize database queries
- Add database indexes

#### Frontend Performance
- Check browser dev tools
- Optimize bundle size with `npm run build`
- Enable lazy loading for routes

## 📞 Support

### Getting Help
- Check [API Documentation](./API_DOCUMENTATION.md)
- Review [Technical Summary](./TECHNICAL_SUMMARY.md)
- Check Django logs: `python manage.py runserver`
- Check browser console for frontend issues

### Common Commands Reference
```bash
# Backend
python manage.py runserver          # Start Django
python manage.py test               # Run tests
python manage.py migrate            # Apply migrations
python manage.py create_sample_data # Create sample data

# Frontend  
npm run dev                         # Start development
npm run build                       # Build for production
npm run preview                     # Preview build

# Database
docker-compose up -d                # Start database
docker-compose logs postgres        # Check logs
docker-compose down                 # Stop database
```

## 📄 License

This project is part of a technical assessment and is for demonstration purposes.

## 🤝 Contributing

This is a technical assessment project. See [TECHNICAL_SUMMARY.md](./TECHNICAL_SUMMARY.md) for architecture decisions and future improvements.