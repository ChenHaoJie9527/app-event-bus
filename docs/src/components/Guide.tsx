import React, { useEffect } from 'react';
import { usePrism } from '@/providers/PrismProvider';

const steps = [
  {
    number: 1,
    title: 'Install EventBus',
    code: 'npm install small-event-system',
    lang: 'bash',
  },
  {
    number: 2,
    title: 'Define Event Registrations',
    code: `const eventRegistrations = [
  {
    event: 'user:login',
    listener: (data: { userId: string; timestamp: number }) => {
      console.log('User logged in:', data);
    },
    description: 'Handle user login events',
  },
  {
    event: 'form:submit',
    listener: (data: { formId: string; values: Record<string, unknown> }) => {
      console.log('Form submitted:', data);
    },
    description: 'Handle form submission events',
    debounce: 300,
  },
] as const;`,
    lang: 'typescript',
  },
  {
    number: 3,
    title: 'Create EventBus with Configuration',
    code: `const eventBus = createEventBus(eventRegistrations, {
  dom: true, // Automatically enable DOM integration
  defaultDebounce: {
    'user:action': 500,
    'api:request': 1000,
  },
});`,
    lang: 'typescript',
  },
  {
    number: 4,
    title: 'Emit Events with Type Safety',
    code: `await eventBus.emit('user:login', {
  userId: 'user123',
  timestamp: Date.now()
});

await eventBus.emit('form:submit', {
  formId: 'login-form',
  values: { email: 'user@example.com' }
});`,
    lang: 'typescript',
  },
  {
    number: 5,
    title: 'Use DOM Integration (Optional)',
    code: `<!-- DOM integration automatically enabled -->
<button data-event="user:action" data-action="logout">
  Logout
</button>`,
    lang: 'html',
  },
];

const Guide: React.FC = () => {
  const { highlight } = usePrism();
  useEffect(() => {
    highlight();
  }, []);

  return (
    <section className="guide" id="guide">
      <div className="container">
        <h2 className="section-title">Getting Started Guide</h2>
        <div className="guide-steps">
          {steps.map((step) => (
            <div className="step" key={step.number}>
              <div className="step-number">{step.number}</div>
              <div className="step-content">
                <h3>{step.title}</h3>
                <pre>
                  <code className={`language-${step.lang}`}>{step.code}</code>
                </pre>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Guide;
