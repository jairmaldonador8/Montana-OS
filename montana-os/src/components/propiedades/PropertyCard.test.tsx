import React from 'react';
import { render, screen } from '@testing-library/react';
import { PropertyCard } from './PropertyCard';

// Mock next/link
jest.mock('next/link', () => {
  return ({ children, href }: any) => (
    <a href={href}>{children}</a>
  );
});

describe('PropertyCard', () => {
  it('renders with default props', () => {
    render(<PropertyCard />);

    expect(screen.getByText('Casa Alfonso Reyes')).toBeInTheDocument();
    expect(screen.getByText('San Pedro Garza García')).toBeInTheDocument();
    expect(screen.getByText('$5.2M')).toBeInTheDocument();
  });

  it('renders with custom props', () => {
    render(
      <PropertyCard
        id="custom-1"
        title="Penthouse Luxury"
        location="Monterrey"
        price="$8.5M"
        rating={4}
        favorites={25}
      />
    );

    expect(screen.getByText('Penthouse Luxury')).toBeInTheDocument();
    expect(screen.getByText('Monterrey')).toBeInTheDocument();
    expect(screen.getByText('$8.5M')).toBeInTheDocument();
    expect(screen.getByText('(25 favoritos)')).toBeInTheDocument();
  });

  it('renders with 5 stars by default', () => {
    const { container } = render(<PropertyCard />);
    const stars = container.querySelectorAll('svg[size="16"]');

    // Should have 5 stars for default rating of 5
    expect(stars.length).toBeGreaterThanOrEqual(5);
  });

  it('renders action buttons', () => {
    render(<PropertyCard />);

    expect(screen.getByText('Ver más')).toBeInTheDocument();
    expect(screen.getByText('Contactar')).toBeInTheDocument();
  });

  it('renders image placeholder when no imageUrl provided', () => {
    const { container } = render(<PropertyCard />);
    const imageContainer = container.querySelector('.bg-gradient-to-br');

    expect(imageContainer).toHaveClass('from-amber-100', 'to-yellow-100');
  });

  it('renders image when imageUrl is provided', () => {
    render(
      <PropertyCard
        imageUrl="https://example.com/property.jpg"
      />
    );

    const image = screen.getByAltText('Casa Alfonso Reyes') as HTMLImageElement;
    expect(image).toBeInTheDocument();
    expect(image.src).toBe('https://example.com/property.jpg');
  });

  it('has correct link href', () => {
    render(<PropertyCard id="prop-123" />);

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/propiedades/prop-123');
  });

  it('renders favorite button', () => {
    const { container } = render(<PropertyCard />);
    const favoriteButton = container.querySelector('button');

    expect(favoriteButton).toBeInTheDocument();
    expect(favoriteButton).toHaveClass('hover:text-red-500');
  });

  it('renders with different ratings', () => {
    const { rerender, container } = render(<PropertyCard rating={3} />);

    let stars = container.querySelectorAll('svg');
    expect(stars.length).toBeGreaterThanOrEqual(3);

    rerender(<PropertyCard rating={4} />);
    stars = container.querySelectorAll('svg');
    expect(stars.length).toBeGreaterThanOrEqual(4);
  });
});
