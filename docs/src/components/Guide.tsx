import React, { useEffect } from 'react';
// @ts-ignore
import Prism from 'prismjs';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-bash';

const steps = [
  {
    number: 1,
    title: 'Install EventBus',
    code: 'npm install small-event-system',
    lang: 'bash',
  },
  {
    number: 2,
    title: 'Define Event Types',
    code: `interface AppEventMap {
  'user:login': { userId: string; timestamp: number; };
  'user:logout': { userId: string; reason?: string; };
}`,
    lang: 'typescript',
  },
  {
    number: 3,
    title: 'Create EventBus Instance',
    code: 'const eventBus = new EventBus<AppEventMap>();',
    lang: 'typescript',
  },
  {
    number: 4,
    title: 'Register Listeners',
    code: `const listenerId = eventBus.on('user:login', (data) => {
  console.log('User logged in:', data.userId);
});`,
    lang: 'typescript',
  },
  {
    number: 5,
    title: 'Emit Events',
    code: `await eventBus.emit('user:login', {
  userId: 'user123',
  timestamp: Date.now()
});`,
    lang: 'typescript',
  },
];

const Guide: React.FC = () => {
  useEffect(() => {
    Prism.highlightAll();
  }, []);

  return (
    <section id="guide" className="guide">
      <div className="container">
        <h2 className="section-title">Getting Started Guide</h2>
        <div className="guide-steps">
          {steps.map(step => (
            <div className="step" key={step.number}>
              <div className="step-number">{step.number}</div>
              <div className="step-content">
                <h3>{step.title}</h3>
                <pre><code className={`language-${step.lang}`}>{step.code}</code></pre>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Guide; 