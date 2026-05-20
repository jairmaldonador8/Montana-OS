import { render, screen } from '@testing-library/react';
import { HeroSection } from '../HeroSection';

describe('HeroSection', () => {
  it('renders hero section with heading', () => {
    render(<HeroSection />);
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
  });

  it('renders subheading text', () => {
    render(<HeroSection />);
    expect(screen.getByText(/CRM Inmobiliario Premium/i)).toBeInTheDocument();
  });

  it('renders CTA button', () => {
    render(<HeroSection />);
    expect(screen.getByRole('button', { name: /Comienza Ahora/i })).toBeInTheDocument();
  });

  it('has centered layout', () => {
    const { container } = render(<HeroSection />);
    const section = container.querySelector('section');
    expect(section).toHaveClass('text-center');
  });

  it('has white background', () => {
    const { container } = render(<HeroSection />);
    const section = container.querySelector('section');
    expect(section).toHaveClass('bg-white');
  });
});
