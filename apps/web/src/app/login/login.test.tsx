import { render, screen } from '@testing-library/react';
import LoginPage from './page';
import { vi } from 'vitest';

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }), useSearchParams: () => ({}) }));
vi.mock('@/providers/snackbar-provider', () => ({ useSnackbar: () => ({ showSnackbar: vi.fn() }) }));


describe('LoginPage', () => {
  it('renders login form', () => {
    render(<LoginPage />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });
});
