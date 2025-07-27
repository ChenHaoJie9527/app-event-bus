import { FC } from 'react';
import { SplittingText } from '@/components/animate-ui/text/splitting';
import { BubbleBackground } from '@/components/animate-ui/backgrounds/bubble';
import { CodeTypewriter } from '@/components/animate-ui/text/code-typewriter';

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

const Hero: FC = () => {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const copyCode = (codeId: string) => {
    const codeElement = document.getElementById(codeId);
    if (codeElement) {
      navigator.clipboard.writeText(codeElement.textContent || '');
    }
  };

  return (
    <section className="hero" id="home">
      <BubbleBackground
        className="absolute inset-0 flex items-center justify-center"
        interactive
      />
      <div className="hero-container">
        <div className="hero-content">
          <h1 className="hero-title">
            Type-Safe Event System
            <span className="highlight">for Modern Apps</span>
          </h1>
          <p className="hero-description">
            <SplittingText
              text="A lightweight, type-safe event bus system built with TypeScript. Designed around the Observer Pattern with separation of concerns."
              type="chars"
            />
          </p>
          <div className="hero-buttons">
            <button
              className="btn btn-primary"
              onClick={() => scrollToSection('examples')}
              type="button"
            >
              View Examples
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => scrollToSection('api')}
              type="button"
            >
              API Reference
            </button>
          </div>
        </div>
        <div className="hero-code">
          <div className="code-block h-[460px]">
            <div className="code-header">
              <span>Quick Start</span>
              <button
                className="copy-btn"
                onClick={() => copyCode('quick-start-code')}
                type="button"
              >
                Copy
              </button>
            </div>
            <pre className="min-h-full">
              <code className="language-typescript" id="quick-start-code">
                <CodeTypewriter
                  duration={4}
                  language="typescript"
                  text={codeString}
                />
              </code>
            </pre>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
