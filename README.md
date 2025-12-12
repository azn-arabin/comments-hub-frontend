# Comment System - Frontend

A modern, real-time comment system built with React, TypeScript, and Vite. Features authentication, real-time updates via WebSockets, and a beautiful UI powered by shadcn/ui.

## Features

- ✨ **User Authentication** - JWT-based login and registration
- 💬 **Comment Management** - Create, read, update, and delete comments
- 👍 **Reactions** - Like and dislike comments (one per user)
- 💡 **Nested Replies** - Reply to comments up to 3 levels deep
- 🔄 **Real-time Updates** - Live updates using Socket.io
- 📄 **Pagination** - Efficient comment loading with pagination
- 🔍 **Sorting** - Sort by newest, most liked, or most disliked
- 🎨 **Theme Support** - Light, dark, and system themes
- 📱 **Responsive Design** - Works seamlessly on all devices
- 🔒 **Authorization** - Users can only edit/delete their own comments

## Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Socket.io Client** - Real-time communication
- **shadcn/ui** - UI components
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **Sonner** - Toast notifications

## Project Structure

```
src/
├── components/
│   ├── comments/
│   │   ├── CommentSection.tsx  # Main comment container
│   │   ├── CommentList.tsx     # List of comments
│   │   ├── CommentItem.tsx     # Individual comment
│   │   └── CommentForm.tsx     # Comment input form
│   ├── context/
│   │   ├── AuthContext.tsx     # Authentication state
│   │   └── ThemeContext.tsx    # Theme state
│   ├── ui/                     # shadcn/ui components
│   ├── Header.tsx              # App header
│   ├── ModeToggle.tsx          # Theme switcher
│   └── ProtectedRoute.tsx      # Route protection
├── pages/
│   ├── Login.tsx               # Login page
│   ├── Register.tsx            # Registration page
│   └── CommentsPage.tsx        # Main comments page
├── lib/
│   ├── api/
│   │   ├── axios.ts            # Axios instance
│   │   ├── auth.ts             # Auth API calls
│   │   └── comments.ts         # Comments API calls
│   ├── utils/
│   │   ├── utils.ts            # Utility functions
│   │   └── date.ts             # Date formatting
│   └── socket.ts               # Socket.io service
├── App.tsx                     # Main app component
└── main.tsx                    # Entry point
```

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Backend API running (see backend documentation)

## Installation

1. **Clone the repository**

```bash
git clone <repository-url>
cd comments-frontend
```

2. **Install dependencies**

```bash
npm install
```

3. **Configure environment variables**

Copy `.env.example` to `.env` and update the values:

```bash
cp .env.example .env
```

Edit `.env`:

```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

4. **Start the development server**

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Usage

### Authentication

1. **Register a new account**

   - Navigate to `/register`
   - Enter username, email, and password
   - You'll be automatically logged in

2. **Login**
   - Navigate to `/login`
   - Enter email and password
   - You'll be redirected to the comments page

### Comments

1. **Viewing Comments**

   - Comments are displayed on the main page
   - Sort by newest, most liked, or most disliked
   - Navigate through pages using pagination controls

2. **Adding Comments**

   - Type your comment in the text area
   - Click "Post Comment"
   - Your comment appears instantly

3. **Editing Comments**

   - Click the menu icon (⋮) on your comment
   - Select "Edit"
   - Update the content and click "Save"

4. **Deleting Comments**

   - Click the menu icon (⋮) on your comment
   - Select "Delete"
   - Confirm the deletion

5. **Liking/Disliking**

   - Click the thumbs up or thumbs down icon
   - You can only like or dislike once per comment
   - Click again to remove your reaction

6. **Replying to Comments**
   - Click "Reply" on any comment
   - Write your reply and click "Post Reply"
   - Replies are nested up to 3 levels

### Real-time Updates

The application automatically updates when:

- New comments are posted
- Comments are edited or deleted
- Comments are liked or disliked

No page refresh required!

## API Integration

The frontend connects to the backend API with the following endpoints:

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Comments

- `GET /api/comments/:pageId` - Get comments with pagination
- `POST /api/comments` - Create comment
- `PUT /api/comments/:commentId` - Update comment
- `DELETE /api/comments/:commentId` - Delete comment
- `POST /api/comments/:commentId/like` - Like comment
- `POST /api/comments/:commentId/dislike` - Dislike comment
- `GET /api/comments/:commentId/replies` - Get comment replies

## Building for Production

1. **Build the application**

```bash
npm run build
```

2. **Preview the build**

```bash
npm run preview
```

3. **Deploy**

Deploy the `dist` folder to your hosting service:

- Vercel
- Netlify
- AWS S3 + CloudFront
- Any static hosting service

## Environment Variables

| Variable            | Description          | Default                     |
| ------------------- | -------------------- | --------------------------- |
| `VITE_API_BASE_URL` | Backend API base URL | `http://localhost:5000/api` |
| `VITE_SOCKET_URL`   | Socket.io server URL | `http://localhost:5000`     |

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Troubleshooting

### Common Issues

1. **CORS Errors**

   - Ensure backend CORS is configured to allow your frontend origin
   - Check `.env` variables are correct

2. **Socket Connection Failed**

   - Verify `VITE_SOCKET_URL` in `.env`
   - Ensure backend Socket.io server is running
   - Check browser console for connection errors

3. **Authentication Issues**
   - Clear localStorage and try again
   - Check JWT token expiration on backend
   - Verify API endpoints are correct

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes with clear messages
4. Push to your branch
5. Create a Pull Request

## License

This project is licensed under the MIT License.

## Support

For issues and questions:

- Create an issue on GitHub
- Check existing issues for solutions
- Review the backend API documentation
  import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
globalIgnores(['dist']),
{
files: ['**/*.{ts,tsx}'],
extends: [
// Other configs...
// Enable lint rules for React
reactX.configs['recommended-typescript'],
// Enable lint rules for React DOM
reactDom.configs.recommended,
],
languageOptions: {
parserOptions: {
project: ['./tsconfig.node.json', './tsconfig.app.json'],
tsconfigRootDir: import.meta.dirname,
},
// other options...
},
},
])

```

```
