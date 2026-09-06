'use client';

import { useTranslations } from 'next-intl';
import { Component, type ErrorInfo, type ReactNode } from 'react';

import { Button } from '@/components/UI/Button';
import { errorReporting } from '@/lib/errorReporting';

/** Default translated fallback (class components can't call hooks). */
function DefaultFallback({ onReset }: { onReset: () => void }) {
  const t = useTranslations('translations.errors');

  return (
    <div className="flex flex-col items-center justify-center gap-3 p-6 text-center">
      <p className="text-sm text-muted-foreground">{t('something_went_wrong')}</p>
      <Button size="sm" onClick={onReset}>
        {t('try_again')}
      </Button>
    </div>
  );
}

type ErrorBoundaryProps = {
  children: ReactNode;
  fallback?: ReactNode | ((error: Error, reset: () => void) => ReactNode);
};

type ErrorBoundaryState = {
  hasError: boolean;
  error: Error | null;
};

/**
 * Reusable error boundary for wrapping sections of a page.
 * Catches rendering errors and displays a fallback UI.
 *
 * @example
 * <ErrorBoundary fallback={<p>Something went wrong</p>}>
 *   <MyComponent />
 * </ErrorBoundary>
 *
 * @example
 * <ErrorBoundary fallback={(error, reset) => (
 *   <div>
 *     <p>Error: {error.message}</p>
 *     <button onClick={reset}>Retry</button>
 *   </div>
 * )}>
 *   <MyComponent />
 * </ErrorBoundary>
 */
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    errorReporting.captureException(error, {
      ...(info.componentStack ? { componentStack: info.componentStack } : {}),
    });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      const { fallback } = this.props;

      if (typeof fallback === 'function') {
        return fallback(this.state.error, this.handleReset);
      }

      if (fallback) {
        return fallback;
      }

      return <DefaultFallback onReset={this.handleReset} />;
    }

    return this.props.children;
  }
}

export { ErrorBoundary };
