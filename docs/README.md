# Small Event System

一个轻量级、类型安全的事件系统，支持同步和异步事件处理。

## 核心特性

- 🚀 **类型安全** - 完整的 TypeScript 支持
- ⚡ **高性能** - 并发事件处理
- 🔧 **易于使用** - 简洁的 API 设计
- 🛡️ **错误处理** - 优雅的错误隔离机制
- 📝 **事件注册** - 强制事件注册，确保系统正确性

## 快速开始

### 1. 安装

```bash
npm install small-event-system
```

### 2. 导入

```typescript
import { EventBus } from 'small-event-system';
```

### 3. 定义事件类型（可选）

```typescript
// 扩展事件映射类型
declare module 'small-event-system' {
  interface EventMap {
    'user:login': {
      userId: string;
      username: string;
    };
    'order:created': {
      orderId: string;
      amount: number;
    };
  }
}
```

### 4. 创建事件总线实例

```typescript
const eventBus = new EventBus();
```

### 5. 注册事件和监听器（必需步骤）

```typescript
// 使用 registerEvents 方法注册事件和监听器
const listenerIds = eventBus.registerEvents([
  {
    event: 'user:login',
    listener: (data) => {
      console.log(`用户登录: ${data.username}`);
      // 处理登录逻辑
    },
    description: '处理用户登录事件'
  },
  {
    event: 'order:created',
    listener: (data) => {
      console.log(`订单创建: ${data.orderId}, 金额: ${data.amount}`);
      // 处理订单创建逻辑
    },
    description: '处理订单创建事件'
  }
]);
```

### 6. 触发事件

```typescript
// 触发事件（会自动验证事件是否已注册）
await eventBus.emit('user:login', {
  userId: '12345',
  username: '张三'
});

await eventBus.emit('order:created', {
  orderId: 'ORD-001',
  amount: 299.99
});
```

## API 参考

### EventBus 类

#### 构造函数

```typescript
const eventBus = new EventBus();
```

#### registerEvents

注册事件和监听器。这是使用事件系统的必要步骤。

```typescript
registerEvents<T extends keyof EventMap>(
  registrations: Array<{
    event: T;
    listener: (data: EventMap[T]) => void | Promise<void>;
    description?: string;
  }>
): string[]
```

**参数：**
- `registrations` - 事件注册配置数组
  - `event` - 事件名称
  - `listener` - 事件监听器函数
  - `description` - 可选的描述信息

**返回值：**
- 监听器 ID 数组，用于后续移除监听器

**示例：**
```typescript
const listenerIds = eventBus.registerEvents([
  {
    event: 'modal:open',
    listener: (data) => {
      console.log(`打开模态框: ${data.modalId}`);
    },
    description: '处理模态框打开事件'
  }
]);
```

#### emit

触发事件。会自动验证事件是否已注册。

```typescript
async emit<T extends keyof EventMap>(
  event: T,
  data: EventMap[T]
): Promise<void>
```

**参数：**
- `event` - 事件名称
- `data` - 事件数据

**示例：**
```typescript
await eventBus.emit('modal:open', { modalId: 'welcome-modal' });
```

#### isEventRegistered

检查事件是否已注册。

```typescript
isEventRegistered<T extends keyof EventMap>(event: T): boolean
```

**示例：**
```typescript
const isRegistered = eventBus.isEventRegistered('modal:open');
console.log('事件已注册:', isRegistered);
```

#### getRegisteredEvents

获取所有已注册的事件名称。

```typescript
getRegisteredEvents(): string[]
```

**示例：**
```typescript
const events = eventBus.getRegisteredEvents();
console.log('已注册的事件:', events);
```

#### on

直接注册单个监听器（不推荐，建议使用 registerEvents）。

```typescript
on<T extends keyof EventMap>(
  event: T,
  listener: (data: EventMap[T]) => void | Promise<void>
): string
```

#### off

移除监听器。

```typescript
off<T extends keyof EventMap>(eventName: T, listenerId: string): boolean
```

#### getListenerCount

获取指定事件的监听器数量。

```typescript
getListenerCount<T extends keyof EventMap>(event: T): number
```

#### hasListeners

检查指定事件是否有监听器。

```typescript
hasListeners<T extends keyof EventMap>(event: T): boolean
```

#### clear

清除所有事件和监听器。

```typescript
clear(): void
```

#### clearEvent

清除指定事件的所有监听器。

```typescript
clearEvent<T extends keyof EventMap>(event: T): boolean
```

## 使用场景

### 1. 用户认证系统

```typescript
// 注册用户相关事件
const authListenerIds = eventBus.registerEvents([
  {
    event: 'user:login',
    listener: (data) => {
      // 更新用户信息面板
      updateUserPanel(data);
    },
    description: '更新用户信息面板'
  },
  {
    event: 'user:login',
    listener: (data) => {
      // 加载用户权限
      loadUserPermissions(data.userId);
    },
    description: '加载用户权限'
  },
  {
    event: 'user:login',
    listener: (data) => {
      // 显示欢迎消息
      showWelcomeMessage(data.username);
    },
    description: '显示欢迎消息'
  }
]);

// 用户登录后触发
await eventBus.emit('user:login', {
  userId: '12345',
  username: '张三'
});
```

### 2. 购物车系统

```typescript
// 注册购物车相关事件
const cartListenerIds = eventBus.registerEvents([
  {
    event: 'cart:item-added',
    listener: (data) => {
      // 更新购物车图标数量
      updateCartIcon(data.itemCount);
    },
    description: '更新购物车图标'
  },
  {
    event: 'cart:item-added',
    listener: (data) => {
      // 保存到本地存储
      saveCartToStorage(data.items);
    },
    description: '保存购物车数据'
  },
  {
    event: 'cart:item-added',
    listener: (data) => {
      // 发送分析数据
      trackAnalytics('item_added', data);
    },
    description: '发送分析数据'
  }
]);

// 添加商品时触发
await eventBus.emit('cart:item-added', {
  itemCount: 3,
  items: [{ id: '1', name: '商品1', price: 100 }]
});
```

### 3. 表单验证系统

```typescript
// 注册表单相关事件
const formListenerIds = eventBus.registerEvents([
  {
    event: 'form:validation',
    listener: (data) => {
      // 实时验证
      validateField(data.fieldName, data.value);
    },
    description: '实时字段验证'
  },
  {
    event: 'form:validation',
    listener: (data) => {
      // 更新UI状态
      updateFieldStatus(data.fieldName, data.isValid);
    },
    description: '更新字段状态'
  },
  {
    event: 'form:validation',
    listener: (data) => {
      // 保存草稿
      saveDraft(data.formData);
    },
    description: '保存表单草稿'
  }
]);

// 表单字段变更时触发
await eventBus.emit('form:validation', {
  fieldName: 'email',
  value: 'test@example.com',
  isValid: true,
  formData: { email: 'test@example.com' }
});
```

## 最佳实践

### 1. 使用常量定义事件名

```typescript
const EVENTS = {
  USER_LOGIN: 'user:login',
  ORDER_CREATED: 'order:created',
  CART_ITEM_ADDED: 'cart:item-added'
} as const;
```

### 2. 集中管理监听器ID

```typescript
const listenerIds = {
  userLogin: '',
  orderCreated: '',
  cartItemAdded: ''
};

// 注册时保存ID
const ids = eventBus.registerEvents([
  {
    event: EVENTS.USER_LOGIN,
    listener: handleUserLogin,
    description: '处理用户登录'
  }
]);
listenerIds.userLogin = ids[0];
```

### 3. 组件销毁时清理监听器

```typescript
function cleanup() {
  eventBus.off(EVENTS.USER_LOGIN, listenerIds.userLogin);
  eventBus.off(EVENTS.ORDER_CREATED, listenerIds.orderCreated);
}
```

### 4. 错误处理

```typescript
// 监听器中的错误处理
eventBus.registerEvents([
  {
    event: 'user:login',
    listener: (data) => {
      try {
        processUserData(data);
      } catch (error) {
        console.error('处理用户数据时出错:', error);
      }
    },
    description: '处理用户数据'
  }
]);

// emit 时的错误处理
try {
  await eventBus.emit('user:login', {
    userId: '12345',
    username: '张三'
  });
} catch (error) {
  console.error('事件处理出错:', error);
}
```

## 注意事项

1. **必须注册事件**：在使用 `emit` 之前，必须先调用 `registerEvents` 注册事件。
2. **类型安全**：确保事件名称和数据类型与 `EventMap` 定义匹配。
3. **错误处理**：监听器中的错误不会阻止其他监听器执行，但会导致 `emit` 返回的 Promise reject。
4. **内存管理**：及时移除不需要的监听器，避免内存泄漏。
5. **并发执行**：所有监听器会并发执行，注意处理竞态条件。

## 许可证

MIT
