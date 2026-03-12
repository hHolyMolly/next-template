import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

import { Skeleton } from '@/components/UI/Skeleton';

describe('Skeleton', () => {
  it('renders with default classes', () => {
    render(<Skeleton data-testid="skeleton" />);
    const el = screen.getByTestId('skeleton');
    expect(el.className).toContain('animate-pulse');
    expect(el.className).toContain('rounded-md');
  });

  it('applies custom className', () => {
    render(<Skeleton className="w-32 h-8" data-testid="skeleton" />);
    const el = screen.getByTestId('skeleton');
    expect(el.className).toContain('w-32');
    expect(el.className).toContain('h-8');
  });

  it('supports dark theme via bg-primary/10', () => {
    render(<Skeleton data-testid="skeleton" />);
    const el = screen.getByTestId('skeleton');
    expect(el.className).toContain('bg-primary/10');
  });
});
