import { render, screen } from '@testing-library/react';
import { FeaturesSection } from '../FeaturesSection';

describe('FeaturesSection', () => {
  it('renders features section with heading', () => {
    render(<FeaturesSection />);
    expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
  });

  it('renders feature cards', () => {
    render(<FeaturesSection />);
    const cards = screen.getAllByRole('heading', { level: 3 });
    expect(cards.length).toBeGreaterThan(0);
  });

  it('has grid layout', () => {
    const { container } = render(<FeaturesSection />);
    const grid = container.querySelector('.grid');
    expect(grid).toHaveClass('grid');
    expect(grid).toHaveClass('grid-cols-1');
  });

  it('renders with proper responsive classes', () => {
    const { container } = render(<FeaturesSection />);
    const grid = container.querySelector('.grid');
    expect(grid).toHaveClass('md:grid-cols-2');
    expect(grid).toHaveClass('lg:grid-cols-4');
  });

  it('renders white background', () => {
    const { container } = render(<FeaturesSection />);
    const section = container.querySelector('section');
    expect(section).toHaveClass('bg-white');
  });
});
