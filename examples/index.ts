/**
 * EventBus example collection
 *
 * This file provides a unified export of all the examples for use in different environments.
 */

import { EventBus } from '../src/events';
import { basicUsageExample, setupDOMExample, cleanup } from './basic-usage';
import { createModalSystemExample } from './modal-system';

// Re-export for external use

export async function quickStartExample() {
  console.log('=== EventBus quick start example ===');

  const events = [
    {
      event: 'hello',
      listener: (data: { name: string }) => {
        console.log(`Hello, ${data.name}!`);
      },
      description: 'Greeting event',
    },
  ] as const;

  const eventBus = new EventBus(events);
  await eventBus.emit('hello', { name: 'EventBus' });

  console.log('Quick start example completed!');
  return eventBus;
}

export async function runAllExamples() {
  console.log('=== Run all EventBus examples ===');

  if (typeof window === 'undefined') {
    console.log('Running Node.js compatible examples...');
    await quickStartExample();
    return;
  }

  try {
    await quickStartExample();
    await basicUsageExample();
    setupDOMExample();
    createModalSystemExample();

    console.log('All examples completed!');
  } catch (error) {
    console.error('Example running error:', error);
  }
}

/**
 * Example cleanup function
 *
 * Clean up all resources created by examples
 */
export function cleanupAllExamples() {
  console.log('=== Clean up all example resources ===');

  try {
    // Clean up basic example
    cleanup();

    console.log('All example resources cleaned up');
  } catch (error) {
    console.error('Error during cleanup:', error);
  }
}

/**
 * Example usage guide
 */
export const EXAMPLES_GUIDE = {
  basicUsage: {
    description: 'show EventBus basic features and dom integration',
    file: 'basic-usage.ts',
    environment: 'browser + Node.js',
    features: [
      'event registration',
      'dom integration',
      'type safety',
      'resource cleanup',
    ],
  },

  modalSystem: {
    description: 'complete modal window management system',
    file: 'modal-system.ts',
    environment: 'browser',
    features: [
      'modal window management',
      'form processing',
      'animation effect',
      'event delegation',
    ],
  },

  htmlDemo: {
    description: 'visual interactive demo',
    file: 'simple-demo.html',
    environment: 'browser',
    features: [
      'complete UI',
      'real-time logging',
      'multiple interaction methods',
      'styling',
    ],
  },

  quickStart: {
    description: 'simplest usage example',
    file: 'index.ts#quickStartExample',
    environment: 'Node.js + browser',
    features: ['minimal configuration', 'quick start'],
  },
};

/**
 * Print usage guide
 */
export function printGuide() {
  console.log('\n📚 EventBus example usage guide');
  console.log('================================');

  for (const [name, info] of Object.entries(EXAMPLES_GUIDE)) {
    console.log(`\n🎯 ${name}`);
    console.log(`   Description: ${info.description}`);
    console.log(`   File: ${info.file}`);
    console.log(`   Environment: ${info.environment}`);
    console.log(`   Features: ${info.features.join(', ')}`);
  }

  console.log('\n🚀 Quick start:');
  console.log('   import { quickStartExample } from "./examples";');
  console.log('   quickStartExample();');

  console.log('\n🌐 View in browser:');
  console.log('   Open examples/simple-demo.html');

  console.log('\n📖 Detailed documentation:');
  console.log('   View examples/README.md');
}

// Entry point for ES Module environment
export async function main() {
  console.log('📚 EventBus Examples');
  console.log('====================\n');
  await runAllExamples();
}

export {
  basicUsageExample,
  setupDOMExample,
  cleanup,
  createModalSystemExample,
};
