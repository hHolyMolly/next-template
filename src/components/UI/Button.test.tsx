import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';

import { Button } from '@/components/UI';

describe('Button', () => {
  it('renders children inside a <button> by default', () => {
    render(<Button>Click me</Button>);
    const el = screen.getByRole('button', { name: 'Click me' });
    expect(el.tagName).toBe('BUTTON');
  });

  it('applies variant/size classes via cva', () => {
    render(<Button variant="destructive" size="lg" data-testid="btn" />);
    const el = screen.getByTestId('btn');
    expect(el.className).toMatch(/bg-destructive/);
    expect(el.className).toMatch(/h-10/);
  });

  it('forwards ref to the underlying button', () => {
    const ref = { current: null as HTMLButtonElement | null };
    render(<Button ref={ref}>ok</Button>);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });

  it('renders a Slot (asChild) so child element receives classes', () => {
    render(
      <Button asChild>
        <a href="/home">home</a>
      </Button>,
    );
    const link = screen.getByRole('link', { name: 'home' });
    expect(link.tagName).toBe('A');
    expect(link.className).toMatch(/inline-flex/);
  });

  it('calls onClick when pressed', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Button onClick={onClick}>press</Button>);
    await user.click(screen.getByRole('button', { name: 'press' }));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('respects disabled attribute and skips click', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <Button disabled onClick={onClick}>
        nope
      </Button>,
    );
    await user.click(screen.getByRole('button', { name: 'nope' }));
    expect(onClick).not.toHaveBeenCalled();
  });
});
