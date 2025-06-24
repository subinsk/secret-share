import { render, screen } from '@testing-library/react';
import SecretViewPage from './page';
import { vi } from 'vitest';

vi.mock('next/navigation', () => ({ useParams: () => ({ id: 'secret1' }) }));
vi.mock('@/providers/snackbar-provider', () => ({ useSnackbar: () => ({ showSnackbar: vi.fn() }) }));
vi.mock('../../../utils/trpc', () => ({
  trpc: {
    secret: {
      getInfo: { useQuery: () => ({ data: { id: 'secret1', oneTimeAccess: true, expiresAt: null, password: 'pw' }, isLoading: false }) },
      get: { useMutation: () => ({ mutate: vi.fn() }) },
    },
  },
}));

describe('SecretViewPage', () => {
  it('renders secret info and copy button', () => {
    render(<SecretViewPage />);
    expect(screen.getByText(/secret/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /copy/i })).toBeInTheDocument();
  });

  it('shows password prompt if password protected', () => {
    render(<SecretViewPage />);
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it('shows expired message if secret is expired', () => {
    vi.mock('../../../utils/trpc', () => ({
      trpc: {
        secret: {
          getInfo: { useQuery: () => ({ data: { id: 'secret1', oneTimeAccess: false, expiresAt: new Date(Date.now() - 10000).toISOString(), password: null }, isLoading: false }) },
          get: { useMutation: () => ({ mutate: vi.fn() }) },
        },
      },
    }));
    render(<SecretViewPage />);
    expect(screen.getByText(/expired/i)).toBeInTheDocument();
  });
});
