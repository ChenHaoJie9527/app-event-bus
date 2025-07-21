import React from 'react'

const codeString = `import { EventBus } from 'small-event-system';

const eventBus = new EventBus();

// Register listener
const listenerId = eventBus.on('user:login', (data) => {
  console.log('User logged in:', data);
});

// Emit event
await eventBus.emit('user:login', { 
  userId: '123', 
  timestamp: Date.now() 
});`;

const Hero: React.FC = () => {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const copyCode = (codeId: string) => {
    const codeElement = document.getElementById(codeId)
    if (codeElement) {
      navigator.clipboard.writeText(codeElement.textContent || '')
    }
  }

  return (
    <section id="home" className="hero">
      <div className="hero-container">
        <div className="hero-content">
          <h1 className="hero-title">
            Type-Safe Event System
            <span className="highlight">for Modern Apps</span>
          </h1>
          <p className="hero-description">
            A lightweight, type-safe event bus system built with TypeScript. Designed around the Observer Pattern with
            separation of concerns.
          </p>
          <div className="hero-buttons">
            <button className="btn btn-primary" onClick={() => scrollToSection('examples')}>View Examples</button>
            <button className="btn btn-secondary" onClick={() => scrollToSection('api')}>API Reference</button>
          </div>
        </div>
        <div className="hero-code">
          <div className="code-block">
            <div className="code-header">
              <span>Quick Start</span>
              <button className="copy-btn" onClick={() => copyCode('quick-start-code')}>Copy</button>
            </div>
            <pre><code id="quick-start-code" className="language-typescript">{codeString}</code></pre>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero 