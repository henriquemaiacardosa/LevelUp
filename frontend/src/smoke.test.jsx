import { render, screen } from '@testing-library/react';

describe('ambiente de testes do frontend', () => {
  test('renderiza um componente e usa os matchers do jest-dom', () => {
    render(<h1>LevelUp</h1>);

    expect(screen.getByRole('heading', { name: 'LevelUp' })).toBeInTheDocument();
  });
});