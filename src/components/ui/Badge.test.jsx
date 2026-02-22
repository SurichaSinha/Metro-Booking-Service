import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Badge from './Badge';

describe('Badge', () => {
  it('renders children correctly', () => {
    render(<Badge>Test Badge</Badge>);
    expect(screen.getByText('Test Badge')).toBeInTheDocument();
  });

  it('applies default variant classes', () => {
    render(<Badge>Default</Badge>);
    expect(screen.getByText('Default')).toHaveClass('bg-gray-100');
  });

  it('applies custom color when provided', () => {
    render(<Badge color="#E53935">Red Line</Badge>);
    const badge = screen.getByText('Red Line');
    expect(badge).toHaveStyle({ backgroundColor: '#E5393520' });
  });

  it('applies correct size classes', () => {
    const { rerender } = render(<Badge size="sm">Small</Badge>);
    expect(screen.getByText('Small')).toHaveClass('px-2');

    rerender(<Badge size="lg">Large</Badge>);
    expect(screen.getByText('Large')).toHaveClass('px-3');
  });

  it('applies interchange variant', () => {
    render(<Badge variant="interchange">Interchange</Badge>);
    expect(screen.getByText('Interchange')).toHaveClass('bg-purple-100');
  });
});
