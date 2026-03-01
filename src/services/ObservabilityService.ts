import * as Sentry from '@sentry/browser';

const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN;
const isConfigured = !!SENTRY_DSN;

export function initObservability() {
  if (!isConfigured) {
    console.log('[Observability] Sentry not configured, skipping initialization');
    return;
  }

  Sentry.init({
    dsn: SENTRY_DSN,
    environment: import.meta.env.MODE,
    release: import.meta.env.VITE_APP_VERSION || 'unknown',
    sendDefaultPii: true,
    
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: false,
        blockAllMedia: false,
      }),
    ],

    tracesSampleRate: 0.1,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,

    beforeSend(event) {
      if (event.exception) {
        console.error('[Sentry] Capturing error:', event.exception);
      }
      return event;
    },
  });

  console.log('[Observability] Sentry initialized');
}

export function captureException(error: Error, context?: Record<string, unknown>) {
  if (!isConfigured) {
    console.error('[Observability] Error (not sent):', error, context);
    return;
  }

  Sentry.withScope((scope) => {
    if (context) {
      Object.entries(context).forEach(([key, value]) => {
        scope.setExtra(key, value);
      });
    }
    Sentry.captureException(error);
  });
}

export function captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info') {
  if (!isConfigured) {
    console.log(`[Observability] ${level.toUpperCase()}: ${message}`);
    return;
  }

  Sentry.captureMessage(message, level);
}

export function setUser(id: string, username?: string) {
  if (!isConfigured) return;
  
  Sentry.setUser({ id, username });
}

export function clearUser() {
  if (!isConfigured) return;
  
  Sentry.setUser(null);
}

export function addBreadcrumb(category: string, message: string, data?: Record<string, unknown>) {
  if (!isConfigured) return;
  
  Sentry.addBreadcrumb({
    category,
    message,
    data,
    level: 'info',
  });
}

export function observeAsync<T>(
  name: string,
  fn: () => Promise<T>,
  context?: Record<string, unknown>
): Promise<T> {
  return Sentry.startSpan({ name }, async () => {
    try {
      const result = await fn();
      return result;
    } catch (error) {
      captureException(error as Error, { operation: name, ...context });
      throw error;
    }
  });
}

export function testSentry() {
  if (!isConfigured) {
    console.log('[Observability] Sentry not configured - test failed');
    return;
  }
  
  captureException(new Error('Sentry test error'), { test: true });
  captureMessage('Sentry test message', 'info');
  console.log('[Observability] Test error and message sent to Sentry');
}

(window as unknown as Record<string, unknown>).testSentry = testSentry;
