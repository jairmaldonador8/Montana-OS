import { render, screen } from '@testing-library/react';
import { MontanaCard } from '../MontanaCard';
import { describe, it, expect } from 'vitest';

describe('MontanaCard', () => {
  it('renders card with base styling', () => {
    render(<MontanaCard>Content</MontanaCard>);
    const card = screen.getByText('Content').closest('div');
    expect(card).toHaveClass('bg-white');
    expect(card).toHaveClass('border-gray-200');
  });

  it('renders card with hover shadow effect', () => {
    render(<MontanaCard>Content</MontanaCard>);
    const card = screen.getByText('Content').closest('div');
    expect(card).toHaveClass('hover:shadow-md');
  });

  it('renders with custom className', () => {
    render(<MontanaCard className="custom-class">Content</MontanaCard>);
    const card = screen.getByText('Content').closest('div');
    expect(card).toHaveClass('custom-class');
  });

  it('renders header and content sections', () => {
    render(
      <MontanaCard>
        <MontanaCard.Header>
          <MontanaCard.Title>Title</MontanaCard.Title>
        </MontanaCard.Header>
        <MontanaCard.Content>Body content</MontanaCard.Content>
      </MontanaCard>
    );
    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Body content')).toBeInTheDocument();
  });

  it('renders footer section', () => {
    render(
      <MontanaCard>
        <MontanaCard.Footer>Footer</MontanaCard.Footer>
      </MontanaCard>
    );
    expect(screen.getByText('Footer')).toBeInTheDocument();
  });
});
