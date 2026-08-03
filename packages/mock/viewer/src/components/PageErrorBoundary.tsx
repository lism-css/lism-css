import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Stack, Text } from 'lism-css/react';
import { Alert } from '@lism-css/ui/react/Alert';
import { Button } from '@lism-css/ui/react/Button';

interface PageErrorBoundaryProps {
  /** Page id, used for the message and for logging. */
  pageId: string;
  children: ReactNode;
}

interface PageErrorBoundaryState {
  error: Error | null;
}

/**
 * Catches render errors coming from a mock page.
 *
 * Without this the whole viewer would unmount and leave a blank screen, which
 * hides the very information the author needs. The boundary is remounted with a
 * `key` whenever the page changes, so switching pages always clears the error.
 */
export default class PageErrorBoundary extends Component<PageErrorBoundaryProps, PageErrorBoundaryState> {
  state: PageErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): PageErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`[lism-mock] Failed to render page "${this.props.pageId}".`, error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ error: null });
  };

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    return (
      <Stack p="30" g="20">
        <Alert type="alert">
          <Stack g="10">
            <Text fw="bold">Failed to render “{this.props.pageId}”.</Text>
            <Text as="pre" fz="xs" ff="mono" whs="pre-wrap" ovw="anywhere">
              {error.stack ?? `${error.name}: ${error.message}`}
            </Text>
          </Stack>
        </Alert>
        <Text fz="s" c="text-2">
          Fix the page source and save it, then retry. The full stack trace is also in the browser console.
        </Text>
        <Button as="button" type="button" variant="outline" aslf="start" onClick={this.handleRetry}>
          Retry
        </Button>
      </Stack>
    );
  }
}
