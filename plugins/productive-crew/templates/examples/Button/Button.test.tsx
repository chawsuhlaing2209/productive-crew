import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Button } from './Button';

describe('Button', () => {
  it('renders its label', () => {
    render(<Button>Save</Button>);
    expect(screen.getByRole('button', { name: 'Save' })).toBeTruthy();
  });

  it('is disabled when disabled', () => {
    render(<Button disabled>Save</Button>);
    expect(screen.getByRole('button')).toHaveProperty('disabled', true);
  });
});
