# EventBus Documentation

This directory contains the documentation website for the EventBus project.

## 🚀 Quick Start

### Development
```bash
# Start development server
npm run dev:docs

# The site will be available at http://localhost:3000
```

### Build
```bash
# Build for production
npm run build:docs

# Preview production build
npm run preview:docs
```

## 📁 Structure

```
docs/
├── src/
│   ├── index.html          # Main documentation page
│   ├── styles.css          # Global styles
│   ├── script.js           # Interactive functionality
│   ├── examples.html       # Examples page (future)
│   ├── api.html           # API reference page (future)
│   └── guide.html         # Guide page (future)
├── dist/                   # Build output (auto-generated)
├── package.json           # Documentation dependencies
├── vite.config.js         # Vite configuration
└── README.md              # This file
```

## 🛠️ Features

- **Interactive Examples**: Live demos of EventBus functionality
- **TypeScript Support**: Syntax highlighting for TypeScript code
- **Responsive Design**: Works on desktop and mobile devices
- **Dark Mode**: Automatic dark mode support
- **Performance Optimized**: Fast loading with modern build tools

## 🎨 Customization

### Styling
The site uses CSS custom properties for easy theming. Key variables:

```css
:root {
  --primary-color: #3b82f6;
  --background-color: #ffffff;
  --text-color: #1f2937;
  /* ... more variables */
}
```

### Adding Examples
To add new interactive examples:

1. Add the HTML structure in `index.html`
2. Add the demo function in `script.js`
3. Add any additional styles in `styles.css`

### Building New Pages
To add new pages:

1. Create the HTML file in `src/`
2. Add it to the `vite.config.js` input configuration
3. Update navigation in `index.html`

## 🚀 Deployment

The documentation is automatically deployed to GitHub Pages when changes are pushed to the main branch.

### Manual Deployment
```bash
# Build the documentation
npm run build:docs

# The built files will be in docs/dist/
```

### GitHub Pages
The site is deployed to: `https://your-username.github.io/small-event-system/`

## 📝 Content Guidelines

### Code Examples
- Use TypeScript for all code examples
- Include both basic and advanced usage
- Show error handling patterns
- Demonstrate best practices

### Writing Style
- Clear and concise explanations
- Use emojis for visual appeal
- Include practical examples
- Link to relevant resources

### Accessibility
- Use semantic HTML
- Include proper ARIA labels
- Ensure keyboard navigation
- Test with screen readers

## 🔧 Development

### Adding Dependencies
```bash
cd docs
npm install package-name
```

### Local Development
```bash
# Start development server with hot reload
npm run dev:docs

# Build and preview
npm run build:docs && npm run preview:docs
```

### Testing
- Test all interactive examples
- Verify responsive design
- Check accessibility
- Test performance

## 📚 Resources

- [Vite Documentation](https://vitejs.dev/)
- [Prism.js](https://prismjs.com/) - Syntax highlighting
- [GitHub Pages](https://pages.github.com/) - Hosting
- [EventBus Project](../README.md) - Main project 