import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';

import { Input } from '@/components/UI';

describe('Input', () => {
  it('associates a label with the input via htmlFor/id', () => {
    render(<Input label="Email" />);
    const input = screen.getByLabelText('Email');
    expect(input).toBeInstanceOf(HTMLInputElement);
  });

  it('renders hint text and wires aria-describedby', () => {
    render(<Input label="Username" hint="3-20 characters" />);
    const input = screen.getByLabelText('Username');
    const described = input.getAttribute('aria-describedby');
    expect(described).toBeTruthy();
    expect(screen.getByText('3-20 characters').id).toBe(described);
  });

  it('flips aria-invalid and announces error text', () => {
    render(<Input label="Email" error="Invalid email" />);
    const input = screen.getByLabelText('Email');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByText('Invalid email')).toBeInTheDocument();
  });

  it('forwards user input', async () => {
    const user = userEvent.setup();
    render(<Input label="Name" />);
    const input = screen.getByLabelText('Name') as HTMLInputElement;
    await user.type(input, 'Ada');
    expect(input.value).toBe('Ada');
  });
});
