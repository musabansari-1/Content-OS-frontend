# Content Burst Frontend

A modern, responsive React application for content creation and repurposing. Transform YouTube transcripts into platform-specific content across LinkedIn, Twitter, TikTok, Instagram, and more.

## ✨ Features

- **Intelligent Content Generation** — Convert YouTube videos into tailored content for each platform
- **Voice Profile System** — Save and refine your creator voice for consistent content tone
- **Persistent Workspace** — Edit, organize, and manage all generated assets in one place
- **Real-time Generation** — Watch progress as your content is created with live status updates
- **Multi-Platform Publishing** — Connect integrations for direct publishing and scheduling
- **Dark Mode Support** — Beautiful UI optimized for creator workflows

## 🚀 Quick Start

### Prerequisites

- Node.js 16+ and npm/yarn
- Backend API running locally or accessible

### Installation

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will open at `http://localhost:3000`

### Configuration

Create a `.env.local` file in the `frontend` directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## 📁 Project Structure

```
src/
├── app/
│   ├── layout.jsx
│   ├── page.jsx
│   ├── workspace/page.jsx
│   └── integrations/page.jsx
├── App.jsx              # Main client app shell
├── IntegrationsPage.jsx # Integrations management
├── styles.css           # Global styles and animations
└── components/          # Route wrappers and shared UI
```

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 |
| Build Tool | Next.js |
| Styling | Tailwind CSS + custom theme styles |
| State Management | React Hooks |
| HTTP Client | Fetch API |

## 🎨 Design System

The frontend uses a carefully crafted dark-first design system with:

- **Color Palette**: Dark background (#0b1220) with vibrant accent (#f97316)
- **Typography**: Sora font family with responsive sizing
- **Components**: Reusable, modular React components
- **Animations**: Smooth transitions and micro-interactions
- **Responsiveness**: Mobile-first approach with breakpoints at 960px and 640px

## 📱 Core Pages

### Home / Generation Page
- Upload YouTube videos or paste transcripts
- Configure voice profiles (writing samples or YouTube sources)
- Select target asset types
- Real-time generation progress tracking

### Workspace
- View and organize all generated assets
- In-editor content refinement with autosave
- Asset management (copy, revert, delete)
- Export workspace data

### Integrations
- Connect external platforms (LinkedIn, Twitter, Medium, etc.)
- Manage connected accounts
- View integration status and sync information

## 🔑 Key Components

### IntegrationCard
Reusable component for displaying platform integrations with support for:
- Connected state with account info
- Available state with connect button
- Coming soon state (disabled)
- Beta state badge

### EditableBlock
Inline text editor for asset content with:
- Auto-save functionality
- Dirty state tracking
- Revert to original
- Copy to clipboard

### GenerationLoader
Real-time progress overlay showing:
- Stage-based progress tracking
- Asset completion status
- Elapsed time
- Detailed step indicators

## 🔄 State Management

The app uses React Hooks for state management:

- **Auth State**: JWT token and user info (localStorage)
- **Generation State**: Job progress and asset creation
- **Workspace State**: Asset library with auto-save
- **UI State**: Route navigation, loading states, error handling

## 🚀 Building for Production

```bash
# Build optimized bundle
npm run build

# Preview production build
npm run preview
```

The build output is in the `dist/` directory, ready for deployment.

## 🔐 Authentication

- JWT-based authentication
- Token stored in localStorage
- Automatic session persistence
- Login and registration flows included

## 📡 API Integration

The frontend communicates with the backend via REST API:

- `/auth/register` — User registration
- `/auth/login` — User authentication
- `/target-assets` — Available asset types
- `/generation-jobs` — Content generation
- `/me/voice-profile` — Creator voice management
- `/integrations` — Platform connections

## 🎯 Best Practices

- ✅ Component-based architecture
- ✅ Clean separation of concerns
- ✅ Responsive design patterns
- ✅ Accessibility considerations
- ✅ Error handling and user feedback
- ✅ Performance optimization

## 📊 Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## 🤝 Contributing

1. Create a feature branch (`git checkout -b feature/amazing-feature`)
2. Commit changes (`git commit -m 'Add amazing feature'`)
3. Push to branch (`git push origin feature/amazing-feature`)
4. Open a Pull Request

## 📝 Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
```

## 🐛 Troubleshooting

### API Connection Issues
- Verify backend is running on the configured `NEXT_PUBLIC_API_URL`
- Check browser console for CORS errors
- Ensure JWT token is valid in localStorage

### Content Not Generating
- Check Generation page for error messages
- Verify YouTube URL format or transcript
- Select at least one asset type
- Check backend logs

### Styling Issues
- Clear browser cache and rebuild
- Check that styles.css is imported in `src/app/layout.jsx`
- Verify CSS variable definitions in :root

## 🙋 Support

For questions or issues, please open an issue on the repository or contact the development team.

---

**Built with ❤️ for creators worldwide**
