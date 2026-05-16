/**
 * JSON Worker
 * Offloads heavy JSON parsing and formatting to a background thread.
 */

self.onmessage = (e: MessageEvent) => {
  const { action, payload } = e.data;

  if (action === 'parse') {
    try {
      const parsed = JSON.parse(payload);
      self.postMessage({ status: 'success', data: parsed });
    } catch (error: any) {
      self.postMessage({ status: 'error', message: error.message });
    }
  }

  if (action === 'format') {
    try {
      const parsed = JSON.parse(payload);
      const formatted = JSON.stringify(parsed, null, 2);
      self.postMessage({ status: 'success', data: formatted });
    } catch (error: any) {
      self.postMessage({ status: 'error', message: error.message });
    }
  }
};
