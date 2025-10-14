# OverDue Dashboard

A clean, modern React dashboard foundation built for personal productivity tracking. This project serves as a neutral starting point for building custom dashboard features with React + Vite + Tailwind CSS, designed for eventual deployment on AWS Free Tier.

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd overdue-dashboard

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📁 Project Structure

```
overdue-dashboard/
├── public/
│   ├── favicon.ico
│   ├── index.html
│   └── manifest.json
├── src/
│   ├── assets/
│   │   └── theme/
│   ├── components/
│   ├── examples/
│   ├── layouts/
│   │   └── dashboard/
│   ├── App.js
│   ├── index.js
│   └── routes.js
├── package.json
├── README.md
└── CHANGELOG.md
```

## 🎯 Features

- ✅ Clean, template-free dashboard foundation
- ✅ React 18 with Material-UI components
- ✅ Responsive design with modern UI patterns
- ✅ Production-ready build configuration
- ✅ Neutral theme and styling
- 🚧 Task management (planned)
- 🚧 Grade tracking (planned)
- 🚧 Note-taking capabilities (planned)
- 🚧 AWS Cognito authentication (planned)

## 🛠 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally  
- `npm run test` - Run tests
- `npm run lint` - Lint source code

## 🎨 Customization

The dashboard uses a component-based architecture with Material-UI theming. Key customization points:

- **Theme**: `src/assets/theme/`
- **Components**: `src/components/`
- **Layouts**: `src/layouts/`
- **Routes**: `src/routes.js`

## 🏗 Roadmap

See [CHANGELOG.md](./CHANGELOG.md) for detailed progress and next steps.

### Phase 1: Foundation ✅
- [x] Template cleanup and neutralization
- [x] Basic dashboard structure
- [x] Build and development environment

### Phase 2: Authentication (Next)
- [ ] AWS Cognito integration
- [ ] Protected routes
- [ ] User profile management

### Phase 3: Core Features
- [ ] Task management system
- [ ] Grade tracking
- [ ] Note-taking interface
- [ ] Data persistence

### Phase 4: Deployment
- [ ] AWS Free Tier deployment
- [ ] CI/CD pipeline
- [ ] Environment configuration

## 📄 License

MIT License - see [LICENSE.md](./LICENSE.md) for details.

## 🤝 Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for contribution guidelines.

---

**Note**: This project was created by stripping and neutralizing a Creative Tim template to create a clean foundation for custom development.
