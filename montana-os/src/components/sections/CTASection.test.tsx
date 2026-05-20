import { render, screen } from '@testing-library/react';
import { CTASection } from '../CTASection';

describe('CTASection', () => {
  it('renders with gradient background', () => {
    const { container } = render(<CTASection />);
    const section = container.querySelector('section');
    expect(section).toHaveClass('bg-gradient-to-r');
    expect(section).toHaveClass('from-amber-400');
  });

  it('renders heading and button', () => {
    render(<CTASection />);
    expect(screen.getByRole('heading')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Comienza Ahora/i })).toBeInTheDocument();
  });
});
