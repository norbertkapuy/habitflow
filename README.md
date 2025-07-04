# 🚀 HabitFlow - AI-Powered Habit Tracker

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Groq AI](https://img.shields.io/badge/Groq_AI-Powered-orange?style=for-the-badge)](https://groq.com/)

> **Transform your daily routines into lasting change with AI-powered insights and beautiful design.**

HabitFlow is a modern, comprehensive habit tracking application that combines the power of AI with an intuitive user experience. Built with Next.js 15 and enhanced with Groq's ultra-fast AI inference, it helps you build better habits through intelligent suggestions, pattern recognition, and predictive insights.

## ✨ Features

### 🎯 **Core Habit Management**
- **Complete CRUD Operations**: Create, edit, delete, and track habits effortlessly
- **Smart Categories**: Organize habits by Health, Fitness, Mindfulness, Productivity, Finance, and more
- **Color-Coded System**: Visual organization with customizable color schemes
- **Streak Tracking**: Monitor your consistency with intelligent streak calculations
- **Daily Progress**: Quick check-off system with completion percentages

### 🤖 **AI-Powered Intelligence**
- **Habit Suggestions**: Personalized recommendations based on your existing patterns
- **Pattern Recognition**: AI discovers correlations between your habits
- **Performance Predictions**: Forecast your success likelihood for new habits
- **Behavioral Insights**: Deep analysis of your habit completion patterns
- **Ultra-Fast Processing**: Powered by Groq's LPU technology (300+ tokens/second)

### 📊 **Advanced Analytics**
- **Interactive Charts**: Beautiful visualizations powered by Recharts
- **Completion Statistics**: Detailed breakdowns of your progress
- **Trend Analysis**: Week, month, and quarterly insights
- **Category Performance**: Track which areas you excel in
- **AI-Enhanced Metrics**: Machine learning insights into your habit data

### 🎨 **Modern Design System**
- **Glassmorphism UI**: Beautiful frosted glass effects and modern aesthetics
- **Dark/Light Themes**: Seamless theme switching with system preference detection
- **4 Color Schemes**: Default, Colorful, Minimal, and High Contrast modes
- **Responsive Design**: Perfect experience on desktop, tablet, and mobile
- **Accessibility First**: WCAG compliant with high contrast options

### 🔔 **Smart Notifications**
- **Browser Notifications**: Native system notifications with fallback UI
- **Custom Reminders**: Set personalized reminder times for each habit
- **Daily Motivation**: AI-generated motivational quotes and encouragement
- **Smart Scheduling**: Intelligent reminder frequency based on your patterns

### 📱 **User Experience**
- **Offline First**: Local storage ensures your data is always available
- **Export/Import**: Full data backup and restore functionality
- **Search & Filter**: Quickly find habits by name, category, or description
- **Calendar View**: Visual history with month-by-month habit completion
- **Smooth Animations**: Framer Motion powered micro-interactions

## 🛠️ Technology Stack

### **Frontend Framework**
- **Next.js 15** - Latest App Router with React Server Components
- **TypeScript** - Full type safety and developer experience
- **React 18** - Modern React with hooks and concurrent features

### **Backend & Infrastructure**
- **Node.js + Express** - RESTful API server with comprehensive endpoints
- **PostgreSQL 15** - Robust relational database with optimized schema
- **Nginx** - High-performance web server with SSL support and API proxy
- **Redis** - Optional caching layer for enhanced performance
- **Docker Compose** - Multi-service containerized deployment

### **Styling & UI**
- **Tailwind CSS v4** - CSS-first utility framework
- **shadcn/ui** - High-quality, accessible component library
- **Framer Motion** - Production-ready motion library
- **Lucide React** - Beautiful, customizable icons

### **AI Integration**
- **Groq API** - Ultra-fast AI inference with generous free tier
- **Multiple Models**: Llama 3.3 70B, Llama 3 8B, Mixtral 8x7B, Gemma2 9B
- **OpenAI Compatible** - Easy migration to other AI providers

### **Data & Analytics**
- **Recharts** - Composable charting library built on D3
- **date-fns** - Modern JavaScript date utility library
- **Database Persistence** - PostgreSQL with localStorage migration support

### **Development Tools**
- **ESLint** - Code linting and quality assurance
- **PostCSS** - CSS processing and optimization
- **Docker** - Containerized development and deployment

## 🚀 Quick Start

### 🐳 **Docker Deployment (Recommended for Production)**

**Prerequisites**: Docker and Docker Compose

1. **Clone the repository**
   ```bash
   git clone https://github.com/norbertkapuy/habitflow.git
   cd habitflow
   ```

2. **Start with Docker**
   ```bash
   # Start all services (database, backend, nginx, frontend)
   ./docker-manage.sh start
   
   # Or manually with docker-compose
   docker-compose up -d
   ```

3. **Access the application**
   - **Web App**: [http://localhost](http://localhost)
   - **API**: [http://localhost:3001/api](http://localhost:3001/api)

4. **Manage services**
   ```bash
   ./docker-manage.sh status   # Check health
   ./docker-manage.sh logs     # View logs
   ./docker-manage.sh stop     # Stop services
   ```

### 💻 **Development Setup**

**Prerequisites**: Node.js 18+, npm/yarn

1. **Clone the repository**
   ```bash
   git clone https://github.com/norbertkapuy/habitflow.git
   cd habitflow
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables** (optional)
   ```bash
   cp .env.example .env.local
   # Add your Groq API key for AI features
   ```

4. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### 🤖 AI Setup (Optional but Recommended)

1. **Get a free Groq API key**
   - Visit [console.groq.com/keys](https://console.groq.com/keys)
   - Create a free account
   - Generate your API key (starts with `gsk_`)

2. **Configure AI features**
   - Go to Settings → AI Features in the app
   - Enable AI Features toggle
   - Enter your API key
   - Test the connection
   - Enjoy AI-powered habit suggestions and insights!

## 📸 Screenshots

### Modern Dashboard
![HabitFlow Dashboard](https://via.placeholder.com/800x500/6366f1/ffffff?text=HabitFlow+Dashboard)

### AI-Powered Insights
![AI Insights](https://via.placeholder.com/800x500/8b5cf6/ffffff?text=AI+Insights+%26+Analytics)

### Beautiful Analytics
![Analytics View](https://via.placeholder.com/800x500/06b6d4/ffffff?text=Analytics+%26+Charts)

## 🎯 Usage Guide

### **Creating Your First Habit**
1. Click the "Add Habit" button in the main interface
2. Enter a descriptive name (e.g., "Drink 8 glasses of water")
3. Choose a category and color
4. Add an optional description
5. Start tracking immediately!

### **Enabling AI Features**
1. Navigate to Settings → AI Features
2. Toggle "Enable AI Features" on
3. Enter your free Groq API key
4. Test the connection
5. Return to the main view to see AI suggestions

### **Viewing Analytics**
1. Click the "Analytics" tab
2. Explore interactive charts and statistics
3. Use AI insights for deeper pattern analysis
4. Filter by timeframe (week, month, quarter)

### **Managing Your Data**
1. Go to Settings → Data Management
2. Export your data as JSON backup
3. Import data from previous backups
4. Use auto-backup feature for peace of mind

### **Migrating to Database Backend**
1. Start the Docker services (`./docker-manage.sh start`)
2. Open the app at [http://localhost](http://localhost)
3. If you have existing localStorage data, you'll see a migration prompt
4. Click "Migrate to Database" for persistent storage
5. Your data will be safely transferred with automatic backup

## 🌟 AI Features Deep Dive

### **Intelligent Habit Suggestions**
HabitFlow's AI analyzes your existing habits to suggest complementary routines:
- **Pattern-Based**: Identifies gaps in your current routine
- **Category Balancing**: Suggests habits to balance different life areas
- **Difficulty Matching**: Recommends habits at your current capability level
- **Time-Aware**: Considers your completion patterns and timing

### **Behavioral Insights**
Get deep insights into your habit formation:
- **Correlation Discovery**: Find which habits influence each other
- **Streak Predictions**: AI forecasts your likelihood of maintaining streaks
- **Optimal Timing**: Discover when you're most likely to complete habits
- **Motivation Patterns**: Understand what drives your consistency

### **Performance Analytics**
Advanced AI-driven analytics:
- **Trend Analysis**: Multi-timeframe pattern recognition
- **Success Forecasting**: Predict future performance based on current data
- **Habit Difficulty Scoring**: AI assessment of habit complexity
- **Personalized Coaching**: Context-aware motivational messages

## 🔧 Configuration

### **Theme Customization**
HabitFlow supports extensive theming:
- **Light/Dark/System**: Automatic theme switching
- **Color Schemes**: Choose from 4 carefully crafted palettes
- **Compact Mode**: Reduce spacing for information density
- **High Contrast**: Accessibility-focused color scheme

### **Notification Settings**
Customize your reminder experience:
- **Daily Reminders**: Set specific times for habit notifications
- **Weekly Summaries**: Get progress reports via notifications
- **Sound Preferences**: Enable or disable notification sounds
- **Browser Integration**: Native OS notification support

### **AI Model Selection**
Choose the perfect AI model for your needs:
- **Llama 3.3 70B**: Best quality, comprehensive insights
- **Llama 3 8B**: Fastest responses, great for quick suggestions
- **Mixtral 8x7B**: Balanced performance and creativity
- **Gemma2 9B**: Lightweight yet effective analysis

## 🚢 Deployment

### **🐳 Docker (Production Ready)**

**Complete multi-service deployment with database, API, and web server:**

```bash
# Quick deployment
./docker-manage.sh start

# Access your app at http://localhost
# API available at http://localhost:3001/api
```

**What's included:**
- **PostgreSQL 15** - Database with optimized schema and sample data
- **Express API** - Full RESTful backend with health monitoring
- **Nginx** - Production web server with SSL support and API proxy
- **Redis** - Caching layer for performance optimization
- **Auto Migration** - Seamless transition from localStorage to database

**Management commands:**
```bash
./docker-manage.sh build      # Build all containers
./docker-manage.sh health     # Check service health
./docker-manage.sh backup     # Database backup
./docker-manage.sh logs       # View service logs
./docker-manage.sh clean      # Clean up containers
```

### **☁️ Cloud Deployment**

### **Vercel (Frontend Only)**
```bash
# Deploy to Vercel
npx vercel --prod

# Or connect your GitHub repository to Vercel for automatic deployments
```

### **Netlify (Frontend Only)**
```bash
# Build the project
npm run build

# Deploy to Netlify
npm run export
# Upload the 'out' directory to Netlify
```

### **VPS/Server Deployment**
```bash
# For production server deployment
git clone https://github.com/norbertkapuy/habitflow.git
cd habitflow

# Configure environment
cp env.example .env
# Edit .env with your production settings

# Deploy with SSL
./docker-manage.sh start
# Configure SSL certificates in nginx/ssl/
```

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Make your changes** with proper TypeScript types
4. **Add tests** if applicable
5. **Commit your changes** (`git commit -m 'Add amazing feature'`)
6. **Push to the branch** (`git push origin feature/amazing-feature`)
7. **Open a Pull Request**

### **Development Guidelines**
- Use TypeScript for all new code
- Follow the existing code style and patterns
- Ensure accessibility compliance
- Test AI features with multiple models
- Update documentation for new features

## 🆕 Recent Updates

### **v1.1.0 - Production Docker Backend** 🐳
- **Complete Docker Infrastructure**: Multi-service deployment with PostgreSQL, Express API, Nginx, Redis
- **Database Persistence**: Full migration from localStorage to PostgreSQL with automatic data transfer
- **Production Web Server**: Nginx with SSL support, API proxy, and static file serving
- **RESTful API**: Comprehensive backend with full CRUD operations, validation, and health monitoring
- **Zero-Downtime Migration**: Seamless transition for existing users with data backup and restore
- **Management Tools**: Complete Docker management script with backup, monitoring, and maintenance commands

### **v1.0.3 - UI & Category Improvements**
- **Enhanced Categories**: Updated to industry-standard categories (Health, Fitness, Mindfulness, Productivity, Finance, Home, Social, Creative)
- **Improved Visual Hierarchy**: Larger icons, better typography, and enhanced spacing
- **Better Day Indicators**: Increased size and improved visual feedback for habit completion
- **Research-Based Design**: Categories aligned with popular habit tracking apps

### **v1.0.2 - Modern Design Overhaul**
- **Horizontal Habit Cards**: Complete redesign with better information density
- **AI Component Optimization**: Improved positioning and scrollable content
- **Enhanced Animations**: Spring-based physics and micro-interactions
- **Motivational Quotes**: Auto-rotating inspirational quotes strip

## 📋 Roadmap

### **Near Term (v1.1)**
- [ ] **Voice Interactions**: Voice commands for habit check-ins
- [ ] **Habit Templates**: Pre-built habit collections
- [ ] **Social Features**: Share progress with friends
- [ ] **Mobile PWA**: Enhanced mobile experience

### **Medium Term (v1.2)**
- [ ] **Cloud Sync**: Optional cloud backup and sync
- [ ] **Wearable Integration**: Apple Watch and Fitbit support
- [ ] **Advanced AI**: Multi-model ensemble predictions
- [ ] **Gamification**: Achievement system and rewards

### **Long Term (v2.0)**
- [ ] **Multi-Platform**: React Native mobile apps
- [ ] **Team Habits**: Collaborative habit tracking
- [ ] **Professional Features**: Coaching and enterprise tools
- [ ] **API Platform**: Third-party integrations

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Groq** for providing ultra-fast, free AI inference
- **shadcn** for the beautiful component library
- **Vercel** for the amazing Next.js framework
- **The open source community** for inspiration and tools

## 🔗 Links

- **Live Demo**: [habitflow.vercel.app](https://habitflow.vercel.app) *(coming soon)*
- **Documentation**: [docs.habitflow.app](https://docs.habitflow.app) *(coming soon)*
- **Issues**: [GitHub Issues](https://github.com/norbertkapuy/habitflow/issues)
- **Discussions**: [GitHub Discussions](https://github.com/norbertkapuy/habitflow/discussions)

---

<div align="center">

**Made with ❤️ and AI-powered insights**

[⭐ Star this repository](https://github.com/norbertkapuy/habitflow) if you found it helpful!

</div>