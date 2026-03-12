import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/UI/Dialog';

describe('Dialog', () => {
  it('renders nothing when closed', () => {
    render(
      <Dialog>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent>
          <p>Content</p>
        </DialogContent>
      </Dialog>,
    );

    expect(screen.queryByText('Content')).not.toBeInTheDocument();
  });

  it('opens when trigger is clicked', async () => {
    const user = userEvent.setup();

    render(
      <Dialog>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Test Title</DialogTitle>
            <DialogDescription>Test Description</DialogDescription>
          </DialogHeader>
          <p>Dialog Content</p>
        </DialogContent>
      </Dialog>,
    );

    await user.click(screen.getByText('Open'));

    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
    expect(screen.getByText('Dialog Content')).toBeInTheDocument();
  });

  it('renders close button with accessible label', async () => {
    const user = userEvent.setup();

    render(
      <Dialog>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent>
          <p>Content</p>
        </DialogContent>
      </Dialog>,
    );

    await user.click(screen.getByText('Open'));

    expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
  });

  it('renders in controlled mode', () => {
    render(
      <Dialog open>
        <DialogContent>
          <p>Controlled Content</p>
        </DialogContent>
      </Dialog>,
    );

    expect(screen.getByText('Controlled Content')).toBeInTheDocument();
  });
});
