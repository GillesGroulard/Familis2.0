import { render, fireEvent, screen } from '@testing-library/react';
import { QuickActions } from '../QuickActions';

describe('QuickActions', () => {
  const mockProps = {
    currentPage: 'feed' as const,
    onFeedClick: jest.fn(),
    onFamilyClick: jest.fn(),
    onSlideshowClick: jest.fn(),
  };

  it('renders family button on feed page', () => {
    render(<QuickActions {...mockProps} />);
    expect(screen.getByTitle('Family Settings')).toBeInTheDocument();
  });

  it('renders feed button on join page', () => {
    render(<QuickActions {...mockProps} currentPage="join" />);
    expect(screen.getByTitle('Back to Feed')).toBeInTheDocument();
  });

  it('renders slideshow button', () => {
    render(<QuickActions {...mockProps} />);
    expect(screen.getByTitle('Start Slideshow')).toBeInTheDocument();
  });

  it('calls correct handlers when buttons are clicked', () => {
    render(<QuickActions {...mockProps} />);
    
    fireEvent.click(screen.getByTitle('Family Settings'));
    expect(mockProps.onFamilyClick).toHaveBeenCalled();

    fireEvent.click(screen.getByTitle('Start Slideshow'));
    expect(mockProps.onSlideshowClick).toHaveBeenCalled();
  });
});