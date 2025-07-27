import { FC } from 'react';
import { MotionEffect } from './animate-ui/effects/motion-effect';

const Features: FC = () => {
  const features = [
    {
      icon: '🔒',
      title: 'Type Safety',
      description:
        'Full TypeScript support with compile-time type checking for events and data.',
    },
    {
      icon: '⚡',
      title: 'Async Support',
      description:
        'Handle both synchronous and asynchronous listeners with Promise.all.',
    },
    {
      icon: '🛡️',
      title: 'Error Isolation',
      description:
        "One listener's error doesn't prevent others from executing.",
    },
    {
      icon: '🎯',
      title: 'Precise Control',
      description:
        'Remove listeners by unique ID for better memory management.',
    },
    {
      icon: '🚀',
      title: 'High Performance',
      description: 'Concurrent listener execution for optimal performance.',
    },
    {
      icon: '⚙️',
      title: 'Smart Configuration',
      description:
        'Automatic DOM integration and debounce configuration through options.',
    },
    {
      icon: '🌐',
      title: 'DOM Integration',
      description:
        'Seamless integration with DOM events using data attributes.',
    },
    {
      icon: '📦',
      title: 'Zero Dependencies',
      description: 'Lightweight with no external dependencies.',
    },
  ];

  return (
    <section className="features" id="features">
      <div className="container">
        <h2 className="section-title">Why EventBus?</h2>
        <div className="features-grid">
          {features.map((feature, index) => (
            <MotionEffect
              blur="8px"
              className="feature-card"
              delay={0.1 + index * 0.1}
              fade={{ initialOpacity: 0 }}
              inView
              key={index}
              slide={{ direction: 'up', offset: 80 }}
              transition={{
                type: 'spring',
                stiffness: 180,
                damping: 12,
                mass: 1.2,
              }}
              zoom={{ initialScale: 0.6, scale: 1 }}
            >
              <div>
                <div className="feature-icon">{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            </MotionEffect>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
