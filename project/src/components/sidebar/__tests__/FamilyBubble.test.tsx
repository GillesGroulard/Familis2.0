import { render, fireEvent, screen } from '@testing-library/react';
import { FamilyBubble } from '../FamilyBubble';

const mockFamily = {
  id: '123',
  name: 'Test Family',
  display_name: 'Test Family Display',
  color: '#056aa0',
  join_code: 'ABC123',
  family_picture: null,
  slideshow_photo_limit: 30,
  slideshow_speed: 15
};

describe('FamilyBubble', () => {
  it('renders correctly with default avatar', () => {
    const onSelect = jest.fn();
    render(
      <FamilyBubble
        family={mockFamily}
        isSelected={false}
        onSelect={onSelect}
      />
    );

    expect(screen.getByTitle('Test Family Display')).toBeInTheDocument();
  });

  it('calls onSelect when clicked', () => {
    const onSelect = jest.fn();
    render(
      <FamilyBubble
        family={mockFamily}
        isSelected={false}
        onSelect={onSelect}
      />
    );

    fireEvent.click(screen.getByTitle('Test Family Display'));
    expect(onSelect).toHaveBeenCalledWith('123');
  });

  it('shows selected state correctly', () => {
    const onSelect = jest.fn();
    const { container } = render(
      <FamilyBubble
        family={mockFamily}
        isSelected={true}
        onSelect={onSelect}
      />
    );

    expect(container.querySelector('.ring-primary-500')).toBeInTheDocument();
  });
});