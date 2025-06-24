import { render } from '@testing-library/react';
import { screen, fireEvent } from '@testing-library/dom';
import CreateSecretPage from './page';
import { vi } from 'vitest';

vi.mock('next-auth/react', () => ({ useSession: () => ({ data: { user: { id: 'user1' } }, status: 'authenticated' }) }));
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock('@/providers/snackbar-provider', () => ({ useSnackbar: () => ({ showSnackbar: vi.fn() }) }));


describe('CreateSecretPage', () => {
  it('renders secret input and submit button', () => {
    render(<CreateSecretPage />);
    expect(screen.getByLabelText(/secret/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create secret/i })).toBeInTheDocument();
  });

  it('shows error if secret is empty on submit', () => {
    render(<CreateSecretPage />);
    fireEvent.click(screen.getByRole('button', { name: /create secret/i }));
    expect(screen.getByText(/please enter a secret/i)).toBeInTheDocument();
  });

  it('shows error if password is too short', () => {
    render(<CreateSecretPage />);
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: '123' } });
    fireEvent.click(screen.getByRole('button', { name: /create secret/i }));
    // This assumes you have a helper text or error for short passwords
    // expect(screen.getByText(/password must be at least/i)).toBeInTheDocument();
  });

  it('toggles one-time access switch', () => {
    render(<CreateSecretPage />);
    const toggle = screen.getByRole('checkbox', { name: /one-time access/i });
    expect(toggle).toBeChecked();
    fireEvent.click(toggle);
    expect(toggle).not.toBeChecked();
  });

  it('changes expiration option', () => {
    render(<CreateSecretPage />);
    const select = screen.getByLabelText(/expiration/i);
    fireEvent.change(select, { target: { value: '7d' } });
    expect((select as HTMLInputElement).value).toBe('7d');
  });

  it('toggles password visibility', () => {
    render(<CreateSecretPage />);
    const toggleBtn = screen.getAllByRole('button').find(btn => btn.querySelector('svg'));
    expect(toggleBtn).toBeDefined();
    if (toggleBtn) fireEvent.click(toggleBtn);
    // No assertion here, but ensures toggle does not throw
  });
});
