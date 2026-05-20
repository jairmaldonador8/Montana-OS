import { render, screen } from '@testing-library/react';
import { MontanaButton } from '../MontanaButton';

describe('MontanaButton', () => {
  it('renders primary button with yellow background', () => {
    render(<MontanaButton variant="primary">Click me</MontanaButton>);
    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toHaveClass('bg-amber-400');
  });

  it('renders secondary button with yellow border', () => {
    render(<MontanaButton variant="secondary">Click me</MontanaButton>);
    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toHaveClass('border-amber-400');
  });

  it('handles disabled state', () => {
    render(<MontanaButton disabled>Disabled</MontanaButton>);
    const button = screen.getByRole('button', { name: /disabled/i });
    expect(button).toBeDisabled();
  });

  it('renders icon button as circular', () => {
    render(<MontanaButton variant="icon">❤️</MontanaButton>);
    const button = screen.getByRole('button', { name: /❤️/i });
    expect(button).toHaveClass('rounded-full');
  });
});
