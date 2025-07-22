import { EventBus, createEventBus, type TypedEventBus } from '../events';
import type { EventRegistrationTuple } from '../types';

// 定义事件注册项
const userEvents = [
  {
    event: 'user:login',
    listener: (data: { userId: string; username: string }) => {
      console.log('User logged in:', data.username);
    },
    description: 'User login handler'
  },
  {
    event: 'user:logout',
    listener: (data: { userId: string; reason?: string }) => {
      console.log('User logged out:', data.userId, data.reason);
    },
    description: 'User logout handler'
  }
] as const;

const orderEvents = [
  {
    event: 'order:created',
    listener: (data: { orderId: string; amount: number; items: string[] }) => {
      console.log('Order created:', data.orderId, 'Amount:', data.amount);
    },
    description: 'Order creation handler'
  },
  {
    event: 'order:cancelled',
    listener: (data: { orderId: string; reason: string }) => {
      console.log('Order cancelled:', data.orderId, 'Reason:', data.reason);
    },
    description: 'Order cancellation handler'
  }
] as const;

// 方式1：使用构造函数
const eventBus1 = new EventBus(userEvents);

// 方式2：使用工厂函数（推荐）
const eventBus2 = createEventBus(userEvents);

// 动态注册更多事件
eventBus2.registerEvents(orderEvents);

// 现在可以触发所有事件，并且有完整的类型提示
async function demonstrateUsage() {
  // 这些调用都有完整的类型提示
  await eventBus2.emit('user:login', { userId: '123', username: '张三' });
  await eventBus2.emit('user:logout', { userId: '123', reason: 'Session expired' });
  await eventBus2.emit('order:created', { 
    orderId: 'ORD-001', 
    amount: 299.99, 
    items: ['Product A', 'Product B'] 
  });
  await eventBus2.emit('order:cancelled', { 
    orderId: 'ORD-001', 
    reason: 'Customer request' 
  });

  // 添加更多监听器
  const listenerId = eventBus2.on('user:login', (data: any) => {
    console.log('Additional login handler:', data.username);
  });

  // 移除监听器
  eventBus2.off('user:login', listenerId);

  // 检查事件状态
  console.log('Registered events:', eventBus2.getRegisteredEvents());
  console.log('Has listeners for user:login:', eventBus2.hasListeners('user:login'));
  console.log('Listener count for user:login:', eventBus2.getListenerCount('user:login'));
}

// 方式3：空 EventBus，后续注册
const eventBus3 = new EventBus();

// 注册事件
eventBus3.registerEvents(userEvents);
eventBus3.registerEvents(orderEvents);

// 现在也可以使用
async function demonstrateEmptyBus() {
  await eventBus3.emit('user:login', { userId: '456', username: '李四' });
  await eventBus3.emit('order:created', { 
    orderId: 'ORD-002', 
    amount: 199.99, 
    items: ['Product C'] 
  });
}

// 方式4：类型安全的 EventBus（推荐用于复杂项目）
function createTypedEventBus<T extends EventRegistrationTuple>(
  events: T
): TypedEventBus<T> {
  return new EventBus(events) as TypedEventBus<T>;
}

// 使用类型安全的 EventBus
const typedEventBus = createTypedEventBus([
  {
    event: 'notification:show',
    listener: (data: { message: string; type: 'info' | 'error' | 'success' }) => {
      console.log(`[${data.type.toUpperCase()}] ${data.message}`);
    },
    description: 'Notification handler'
  },
  {
    event: 'data:sync',
    listener: (data: { userId: string; timestamp: number; data: unknown }) => {
      console.log(`Syncing data for user ${data.userId} at ${new Date(data.timestamp).toISOString()}`);
    },
    description: 'Data sync handler'
  }
] as const);

async function demonstrateTypedEventBus() {
  // 这些调用有完整的类型安全
  await typedEventBus.emit('notification:show', { 
    message: 'Operation completed successfully', 
    type: 'success' 
  });
  
  await typedEventBus.emit('data:sync', { 
    userId: '789', 
    timestamp: Date.now(), 
    data: { settings: { theme: 'dark' } } 
  });

  // 添加类型安全的监听器
  const listenerId = typedEventBus.on('notification:show', (data) => {
    // data 的类型是 { message: string; type: 'info' | 'error' | 'success' }
    console.log('Additional notification handler:', data.message);
  });

  // 移除监听器
  typedEventBus.off('notification:show', listenerId);
}

export { 
  demonstrateUsage, 
  demonstrateEmptyBus, 
  demonstrateTypedEventBus,
  typedEventBus 
};
