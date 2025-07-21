import React from 'react'

const Features: React.FC = () => {
  const features = [
    {
      icon: '🔒',
      title: 'Type Safety',
      description: 'Full TypeScript support with compile-time type checking for events and data.'
    },
    {
      icon: '⚡',
      title: 'Async Support',
      description: 'Handle both synchronous and asynchronous listeners with Promise.all.'
    },
    {
      icon: '🛡️',
      title: 'Error Isolation',
      description: 'One listener\'s error doesn\'t prevent others from executing.'
    },
    {
      icon: '🎯',
      title: 'Precise Control',
      description: 'Remove listeners by unique ID for better memory management.'
    },
    {
      icon: '🚀',
      title: 'High Performance',
      description: 'Concurrent listener execution for optimal performance.'
    },
    {
      icon: '📦',
      title: 'Zero Dependencies',
      description: 'Lightweight with no external dependencies.'
    }
  ]

  return (
    <section id="features" className="features">
      <div className="container">
        <h2 className="section-title">Why EventBus?</h2>
        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card">
              <div className="feature-icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Features 