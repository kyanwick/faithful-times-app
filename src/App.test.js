import { render, screen } from '@testing-library/react';
import App from './App';
import React from 'react';

test('renders Islamic Prayer Times', () => {
  render(<App />);
  const titleElement = screen.getByText(/Islamic Prayer Times/i);
  expect(titleElement).toBeInTheDocument();
});
