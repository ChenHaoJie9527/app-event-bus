import React, { useEffect } from 'react';
import Prism from 'prismjs';
import 'prismjs/components/prism-typescript';

const apiList = [
  {
    title: 'EventBus Constructor',
    code: 'new EventBus<EventMap = BaseEventMap>()',
    desc: 'Creates a new EventBus instance with optional type parameter for custom event maps.',
  },
  {
    title: 'on(event, listener)',
    code: `on<T extends keyof EventMap>(
  event: T,
  listener: (data: EventMap[T]) => void | Promise<void>
): string`,
    desc: 'Registers a listener for a specific event. Returns a unique listener ID.',
  },
  {
    title: 'emit(event, data)',
    code: `emit<T extends keyof EventMap>(
  event: T,
  data: EventMap[T]
): Promise<void>`,
    desc: 'Emits an event and calls all registered listeners concurrently.',
  },
  {
    title: 'off(eventName, listenerId)',
    code: `off<T extends keyof EventMap>(
  eventName: T,
  listenerId: string
): boolean`,
    desc: 'Removes a specific listener by ID. Returns true if listener was removed.',
  },
];

const Api: React.FC = () => {
  useEffect(() => {
    Prism.highlightAll();
  }, []);

  return (
    <section className="api" id="api">
      <div className="container">
        <h2 className="section-title">API Reference</h2>
        <div className="api-grid">
          {apiList.map((item) => (
            <div className="api-card" key={item.title}>
              <h3>{item.title}</h3>
              <pre>
                <code className="language-typescript">{item.code}</code>
              </pre>
              <p>{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Api;
