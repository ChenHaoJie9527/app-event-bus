# 事件类型定义用户指南

## 📖 概述

本指南详细说明如何作为第三方用户，在使用 small-event-system 库时定义自己的事件类型。

## 🎯 核心概念

### 模块声明扩展（Module Declaration Augmentation）

`events.d.ts` 文件使用了 TypeScript 的模块声明扩展技术，允许你：

1. **不修改原始库代码**：扩展事件类型而不需要 fork 或修改库
2. **类型安全**：获得完整的类型检查和智能提示
3. **灵活扩展**：可以随时添加新的事件类型

## 🔧 使用方式

### 方式一：直接扩展 BaseEventMap（推荐）

这是最简单和最常用的方式。

#### 步骤 1：创建类型声明文件

在你的项目中创建一个 `.d.ts` 文件，例如 `my-events.d.ts`：

```typescript
// my-events.d.ts
declare module 'small-event-system' {
  interface BaseEventMap {
    // 你的自定义事件
    'my-app:user:registered': {
      userId: string;
      email: string;
      registrationDate: Date;
    };
    
    'my-app:payment:completed': {
      orderId: string;
      amount: number;
      paymentMethod: 'credit-card' | 'paypal' | 'alipay';
      transactionId: string;
    };
    
    'my-app:notification:sent': {
      userId: string;
      type: 'email' | 'sms' | 'push';
      content: string;
      sentAt: Date;
    };
  }
}
```

#### 步骤 2：在 tsconfig.json 中包含文件

确保你的 `tsconfig.json` 包含这个文件：

```json
{
  "compilerOptions": {
    // ... 其他配置
  },
  "include": [
    "src/**/*",
    "my-events.d.ts"  // 添加你的类型声明文件
  ]
}
```

#### 步骤 3：使用事件

现在你可以在代码中使用这些自定义事件：

```typescript
import { EventBus } from 'small-event-system';

const eventBus = new EventBus();

// 监听自定义事件 - 有完整的类型提示
eventBus.on('my-app:user:registered', (data) => {
  // data 的类型自动推断为：
  // { userId: string; email: string; registrationDate: Date }
  console.log(`用户 ${data.userId} 注册成功，邮箱: ${data.email}`);
});

// 触发自定义事件 - 有类型检查
await eventBus.emit('my-app:payment:completed', {
  orderId: 'order123',
  amount: 299.99,
  paymentMethod: 'credit-card',
  transactionId: 'txn_abc123'
});
```

### 方式二：分模块定义（适合大型项目）

如果你的项目很大，可以将事件类型按模块分开定义。

#### 步骤 1：创建模块化的事件类型

```typescript
// events/user-events.d.ts
export interface UserEvents {
  'user:login:success': {
    userId: string;
    timestamp: number;
    userAgent?: string;
  };
  'user:logout:complete': {
    userId: string;
    sessionDuration: number;
  };
  'user:profile:updated': {
    userId: string;
    changes: Record<string, unknown>;
  };
}

// events/payment-events.d.ts
export interface PaymentEvents {
  'payment:completed': {
    orderId: string;
    amount: number;
    paymentMethod: string;
    transactionId: string;
  };
  'payment:failed': {
    orderId: string;
    error: string;
    retryCount: number;
  };
}

// events/notification-events.d.ts
export interface NotificationEvents {
  'notification:sent': {
    userId: string;
    type: 'email' | 'sms' | 'push';
    content: string;
    sentAt: Date;
  };
  'notification:delivered': {
    userId: string;
    notificationId: string;
    deliveredAt: Date;
  };
}
```

#### 步骤 2：合并到主类型声明文件

```typescript
// my-events.d.ts
import type { UserEvents, PaymentEvents, NotificationEvents } from './events';

declare module 'small-event-system' {
  interface BaseEventMap extends UserEvents, PaymentEvents, NotificationEvents {
    // 可以在这里添加其他事件
  }
}
```

### 方式三：使用工具类型（高级用法）

对于需要动态生成事件类型的场景，可以使用工具类型。

#### 步骤 1：定义工具类型

```typescript
// event-utils.d.ts
export type CreateEventMap<T extends Record<string, unknown>> = {
  [K in keyof T]: T[K];
};

export type EventWithMetadata<T> = T & {
  metadata: {
    timestamp: number;
    source: string;
    version: string;
  };
};

export type CreateTypedEvent<T extends Record<string, unknown>> = {
  [K in keyof T]: EventWithMetadata<T[K]>;
};
```

#### 步骤 2：使用工具类型

```typescript
// my-events.d.ts
import type { CreateTypedEvent } from './event-utils';

declare module 'small-event-system' {
  interface BaseEventMap extends CreateTypedEvent<{
    'my-app:user:action': {
      userId: string;
      action: string;
      details: Record<string, unknown>;
    };
  }> {}
}
```

## 📋 命名约定

### 推荐的事件命名格式

```
{应用名}:{模块名}:{动作名}
```

例如：
- `my-app:user:registered`
- `my-app:payment:completed`
- `my-app:notification:sent`

### 命名规则

1. **使用小写字母和连字符**
2. **避免空格和特殊字符**
3. **保持命名的一致性和可读性**
4. **使用有意义的描述性名称**

## 🔍 类型检查示例

### 正确的使用方式

```typescript
// ✅ 正确：事件名存在且数据类型匹配
await eventBus.emit('my-app:user:registered', {
  userId: 'user123',
  email: 'user@example.com',
  registrationDate: new Date()
});

// ✅ 正确：监听器参数类型正确
eventBus.on('my-app:payment:completed', (data) => {
  // data 的类型自动推断为正确的事件数据类型
  console.log(`支付完成: ${data.orderId}, 金额: ${data.amount}`);
});
```

### 错误的使用方式

```typescript
// ❌ 错误：事件名不存在
await eventBus.emit('non-existent-event', {});

// ❌ 错误：数据类型不匹配
await eventBus.emit('my-app:user:registered', {
  userId: 123, // 应该是 string
  email: 'user@example.com',
  registrationDate: '2024-01-01' // 应该是 Date
});

// ❌ 错误：缺少必需字段
await eventBus.emit('my-app:user:registered', {
  userId: 'user123'
  // 缺少 email 和 registrationDate
});
```

## 🛠️ 调试技巧

### 1. 检查类型定义

```typescript
// 在代码中检查事件类型
import type { EventMap } from 'small-event-system';

// 这会显示所有可用的事件类型
type AvailableEvents = keyof EventMap;
```

### 2. 验证事件数据结构

```typescript
// 验证特定事件的数据结构
import type { EventMap } from 'small-event-system';

type UserRegisteredData = EventMap['my-app:user:registered'];
// 这会显示该事件的完整数据结构
```

### 3. 使用 TypeScript 编译器检查

```bash
# 运行类型检查
npx tsc --noEmit

# 如果有类型错误，会显示具体的错误信息
```

## 📝 最佳实践

### 1. 保持事件类型的一致性

```typescript
// 好的做法：使用一致的数据结构
interface BaseEventData {
  timestamp: number;
  source: string;
}

declare module 'small-event-system' {
  interface BaseEventMap {
    'my-app:user:registered': BaseEventData & {
      userId: string;
      email: string;
    };
    'my-app:user:logged-in': BaseEventData & {
      userId: string;
      userAgent: string;
    };
  }
}
```

### 2. 使用联合类型增加灵活性

```typescript
declare module 'small-event-system' {
  interface BaseEventMap {
    'my-app:notification:sent': {
      userId: string;
      type: 'email' | 'sms' | 'push';
      content: string;
      sentAt: Date;
    };
  }
}
```

### 3. 添加可选字段

```typescript
declare module 'small-event-system' {
  interface BaseEventMap {
    'my-app:user:action': {
      userId: string;
      action: string;
      details?: Record<string, unknown>; // 可选字段
      metadata?: {
        ip?: string;
        userAgent?: string;
      };
    };
  }
}
```

## 🚀 实际项目示例

### 电商应用示例

```typescript
// ecommerce-events.d.ts
declare module 'small-event-system' {
  interface BaseEventMap {
    // 用户相关事件
    'ecommerce:user:registered': {
      userId: string;
      email: string;
      registrationDate: Date;
      referralCode?: string;
    };
    
    'ecommerce:user:logged-in': {
      userId: string;
      loginMethod: 'email' | 'social' | 'phone';
      userAgent: string;
      ipAddress: string;
    };
    
    // 商品相关事件
    'ecommerce:product:viewed': {
      userId: string;
      productId: string;
      category: string;
      price: number;
      viewDuration: number;
    };
    
    'ecommerce:product:added-to-cart': {
      userId: string;
      productId: string;
      quantity: number;
      price: number;
      cartId: string;
    };
    
    // 订单相关事件
    'ecommerce:order:created': {
      orderId: string;
      userId: string;
      items: Array<{
        productId: string;
        quantity: number;
        price: number;
      }>;
      totalAmount: number;
      shippingAddress: {
        street: string;
        city: string;
        country: string;
        zipCode: string;
      };
    };
    
    'ecommerce:order:paid': {
      orderId: string;
      userId: string;
      paymentMethod: 'credit-card' | 'paypal' | 'alipay';
      transactionId: string;
      amount: number;
      paidAt: Date;
    };
    
    // 支付相关事件
    'ecommerce:payment:completed': {
      orderId: string;
      transactionId: string;
      amount: number;
      paymentMethod: string;
      status: 'success' | 'failed' | 'pending';
      completedAt: Date;
    };
    
    // 通知相关事件
    'ecommerce:notification:sent': {
      userId: string;
      type: 'order-confirmation' | 'shipping-update' | 'payment-reminder';
      channel: 'email' | 'sms' | 'push';
      content: string;
      sentAt: Date;
    };
  }
}
```

## ❓ 常见问题

### Q: 为什么我的事件类型没有生效？

A: 检查以下几点：
1. 确保 `.d.ts` 文件被包含在 `tsconfig.json` 的 `include` 中
2. 确保模块声明路径正确（`declare module 'small-event-system'`）
3. 重启 TypeScript 语言服务器（在 VS Code 中按 Cmd+Shift+P，选择 "TypeScript: Restart TS Server"）

### Q: 如何删除或修改已定义的事件类型？

A: 直接在 `.d.ts` 文件中修改或删除相应的事件定义即可。TypeScript 会自动重新计算类型。

### Q: 可以在运行时动态添加事件类型吗？

A: 不可以。TypeScript 的类型系统是编译时的，事件类型必须在编译时定义。

### Q: 如何处理事件类型的版本兼容性？

A: 建议在事件数据中包含版本信息：

```typescript
declare module 'small-event-system' {
  interface BaseEventMap {
    'my-app:user:action': {
      version: '1.0';
      userId: string;
      action: string;
      data: Record<string, unknown>;
    };
  }
}
```

## 📚 总结

通过使用 `events.d.ts` 文件，你可以：

1. **灵活扩展**：在不修改原始库的情况下添加自定义事件类型
2. **类型安全**：获得完整的类型检查和智能提示
3. **维护性好**：事件类型定义集中管理，易于维护
4. **团队协作**：团队成员可以共享和复用事件类型定义

记住，好的事件类型设计是成功使用事件系统的关键！ 