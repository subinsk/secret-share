import { render, screen } from '@testing-library/react';
import DashboardPage from './page';
import { vi } from 'vitest';

vi.mock('next-auth/react', () => ({ useSession: () => ({ data: { user: { id: 'user1' } }, status: 'authenticated' }) }));
vi.mock('@/providers/snackbar-provider', () => ({ useSnackbar: () => ({ showSnackbar: vi.fn() }) }));
vi.mock('@/utils/trpc', () => ({
  trpc: {
    secret: {
      list: { useQuery: () => ({ data: [{ id: 'secret1', secretText: 'test', oneTimeAccess: true, expiresAt: null, isViewed: false }], isLoading: false }) },
      delete: { useMutation: () => ({ mutate: vi.fn() }) },
    },
  },
}));

describe('DashboardPage', () => {
  it('renders dashboard and secret list', () => {
    render(<DashboardPage />);
    expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
    expect(screen.getByText(/test/i)).toBeInTheDocument();
  });
});
