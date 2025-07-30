function createSimpleRequest() {
  let latestRequestId = 0;

  const handler = async <T>(
    fn: () => Promise<T>,
    onSuccess: (data: T) => void
  ) => {
    const requestId = performance.now();
    latestRequestId = requestId;

    try {
      const result = await fn();
      if (requestId === latestRequestId) {
        onSuccess(result);
      }
    } catch (error) {
      if (requestId === latestRequestId) {
        console.error(error);
      }
    }
  };

  handler.destroy = () => {
    latestRequestId = 0;
  };

  return handler;
}

export const simpleRequest = createSimpleRequest();

export { createSimpleRequest };
