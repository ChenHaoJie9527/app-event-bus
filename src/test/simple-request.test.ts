import { simpleRequest } from '../request';
import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  afterEach,
  beforeAll,
  afterAll,
} from 'vitest';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';

const server = setupServer();

beforeAll(() => server.listen());

afterEach(() => server.resetHandlers());

afterAll(() => server.close());

describe('simpleRequest', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should call onSuccess when the request is successful', async () => {
    server.use(
      http.get('/api/users', () => {
        return HttpResponse.json([
          {
            id: 1,
            name: 'John Doe',
          },
          {
            id: 2,
            name: 'Dave',
          },
        ]);
      })
    );

    const onSuccess = vi.fn();

    const mockRequest = () => fetch('/api/users').then((res) => res.json());
    await simpleRequest(mockRequest, onSuccess);

    expect(onSuccess).toHaveBeenCalledWith([
      {
        id: 1,
        name: 'John Doe',
      },
      {
        id: 2,
        name: 'Dave',
      },
    ]);

    expect(onSuccess).toHaveBeenCalledTimes(1);
  });

  it('should not call onSuccess when a newer request has been made', async () => {
    server.use(
      http.get('/api/users', async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
        return HttpResponse.json([{ id: 1, name: 'John Doe' }]);
      })
    );

    const onSuccess = vi.fn();
    const mockRequest = () => fetch('/api/users').then((res) => res.json());

    const firstRequest = simpleRequest(mockRequest, onSuccess);

    const secondRequest = simpleRequest(mockRequest, onSuccess);

    await Promise.all([firstRequest, secondRequest]);

    expect(onSuccess).toHaveBeenCalledTimes(1);
  });

  it('should demonstrate the race condition mechanism', async () => {
    const requestLogs: string[] = [];

    server.use(
      http.get('/api/users', async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
        return HttpResponse.json([
          {
            id: 1,
            name: 'John Doe',
          },
        ]);
      })
    );

    const onSuccess = vi.fn((data) => {
      requestLogs.push(`Success with data: ${JSON.stringify(data)}`);
    });

    const mockRequest = () => fetch('/api/users').then((res) => res.json());

    const firstRequest = simpleRequest(mockRequest, onSuccess);

    const secondRequest = simpleRequest(mockRequest, onSuccess);

    await Promise.all([firstRequest, secondRequest]);

    expect(onSuccess).toHaveBeenCalledTimes(1);
    expect(requestLogs).toHaveLength(1);
  });

  it('should handle multiple concurrent requests correctly', async () => {
    const response: string[] = [];
    let requestCount = 0;

    server.use(
      http.get('/api/users', async ({ request }) => {
        const url = new URL(request.url);
        const delay = Number.parseInt(url.searchParams.get('delay') || '0', 10);

        requestCount++;

        const currentCount = requestCount;

        await new Promise((resolve) => setTimeout(resolve, delay));
        return HttpResponse.json({
          id: currentCount,
          message: `Response ${currentCount}`,
        });
      })
    );

    const onSuccess = vi.fn((data) => {
      response.push(data.message);
    });

    const createRequest = (delay: number) => () =>
      fetch(`/api/users?delay=${delay}`).then((res) => res.json());

    const requests = [
      simpleRequest(createRequest(200), onSuccess),
      simpleRequest(createRequest(100), onSuccess),
      simpleRequest(createRequest(50), onSuccess),
    ];

    await Promise.all(requests);
    expect(onSuccess).toHaveBeenCalledTimes(1);
    expect(response).toHaveLength(1);
  });

  it('should work with different types of data', async () => {
    server.use(
      http.get('/api/string', () => HttpResponse.text('Hello World')),
      http.get('/api/number', () => HttpResponse.json(10)),
      http.get('/api/boolean', () => HttpResponse.json(true)),
      http.get('/api/object', () => HttpResponse.json({ key: 'value' }))
    );

    const stringSuccess = vi.fn();
    const numberSuccess = vi.fn();
    const booleanSuccess = vi.fn();
    const objectSuccess = vi.fn();

    await Promise.all([
      simpleRequest(
        () => fetch('/api/string').then((res) => res.text()),
        stringSuccess
      ),
      simpleRequest(
        () => fetch('/api/number').then((res) => res.json()),
        numberSuccess
      ),
      simpleRequest(
        () => fetch('/api/boolean').then((res) => res.json()),
        booleanSuccess
      ),
      simpleRequest(
        () => fetch('/api/object').then((res) => res.json()),
        objectSuccess
      ),
    ]);

    expect(objectSuccess).toHaveBeenCalledWith({ key: 'value' });
  });

  it('should handle request cancellation correctly', async () => {
    let resolveFirstRequest: (value: any) => void;
    let resolveSecondRequest: (value: any) => void;

    const firstPromise = new Promise((resolve) => {
      resolveFirstRequest = resolve;
    });

    const secondPromise = new Promise((resolve) => {
      resolveSecondRequest = resolve;
    });

    const onSuccess = vi.fn();
    let requestCount = 0;

    const mockRequest = vi.fn(() => {
      requestCount++;
      return requestCount === 1 ? firstPromise : secondPromise;
    });

    const firstRequest = simpleRequest(mockRequest, onSuccess);

    const secondRequest = simpleRequest(mockRequest, onSuccess);

    resolveFirstRequest!({ data: 'first' });
    await firstRequest;

    expect(onSuccess).not.toHaveBeenCalled();

    resolveSecondRequest!({ data: 'second' });
    await secondRequest;

    expect(onSuccess).toHaveBeenCalledWith({ data: 'second' });
    expect(onSuccess).toHaveBeenCalledTimes(1);
  });

  it('should create independent instances when createSimpleRequest is called multiple times', async () => {
    const { createSimpleRequest } = await import('../request');

    const instance1 = createSimpleRequest();
    const instance2 = createSimpleRequest();

    server.use(
      http.get('/api/test', () => HttpResponse.json({ data: 'test' }))
    );
    const onSuccess1 = vi.fn();
    const onSuccess2 = vi.fn();

    const mockRequest = () => fetch('/api/test').then((res) => res.json());

    await Promise.all([
      instance1(mockRequest, onSuccess1),
      instance2(mockRequest, onSuccess2),
    ]);

    expect(onSuccess1).toHaveBeenCalledTimes(1);
    expect(onSuccess2).toHaveBeenCalledTimes(1);
    expect(onSuccess1).toHaveBeenCalledWith({ data: 'test' });
    expect(onSuccess2).toHaveBeenCalledWith({ data: 'test' });
  });
});
