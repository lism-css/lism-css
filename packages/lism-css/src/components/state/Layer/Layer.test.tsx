import { describe, test, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import Layer from './Layer';

afterEach(() => {
  cleanup();
});

describe('Layer', () => {
  test('isLayer クラスが付与される', () => {
    render(<Layer data-testid="layer" />);
    const element = screen.getByTestId('layer');
    expect(element).toHaveClass('is--layer');
  });

  test('他の props は Lism へ透過される', () => {
    render(<Layer as="section" p="20" data-testid="layer" />);
    const element = screen.getByTestId('layer');
    expect(element.tagName).toBe('SECTION');
    expect(element).toHaveClass('-p:20');
  });
});
