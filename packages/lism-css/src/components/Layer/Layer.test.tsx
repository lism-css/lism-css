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

  test('style で backdropFilter を直接指定できる', () => {
    render(<Layer style={{ backdropFilter: 'contrast(1.1) sepia(0.4) grayscale(0.4)' }} data-testid="layer" />);
    const element = screen.getByTestId('layer');
    expect(element.style.backdropFilter).toBe('contrast(1.1) sepia(0.4) grayscale(0.4)');
  });

  test('style で blur を backdropFilter として指定できる', () => {
    render(<Layer style={{ backdropFilter: 'blur(5px)' }} data-testid="layer" />);
    const element = screen.getByTestId('layer');
    expect(element.style.backdropFilter).toBe('blur(5px)');
  });

  test('Lism の props も受け取れる', () => {
    render(<Layer p="20" data-testid="layer" />);
    const element = screen.getByTestId('layer');
    expect(element).toHaveClass('-p:20');
  });

  test('as で要素を変更できる', () => {
    render(<Layer as="section" data-testid="layer" />);
    const element = screen.getByTestId('layer');
    expect(element.tagName).toBe('SECTION');
  });

  test('as="a" で href を受け取れる', () => {
    render(<Layer as="a" href="https://example.com" data-testid="layer" />);
    const element = screen.getByTestId('layer');
    expect(element.tagName).toBe('A');
    expect(element.getAttribute('href')).toBe('https://example.com');
  });
});
