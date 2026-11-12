/**
 * client/src/__tests__/Login.test.jsx
 *
 * React Testing Library tests for the Login component.
 *
 * NOTE: This file is written for Jest + @testing-library/react.
 * If your client uses Vitest, rename `jest.mock` → `vi.mock`,
 * `jest.fn()` → `vi.fn()`, etc., and import from 'vitest' instead.
 *
 * Required packages:
 *   @testing-library/react @testing-library/user-event @testing-library/jest-dom
 *   jest-environment-jsdom babel-jest @babel/preset-env @babel/preset-react
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// ─── Mocks (jest.mock is hoisted, keep at top level) ───────────────────────

// Mock httpAction — default export
const mockHttpAction = jest.fn();
jest.mock('../../utils/httpAction', () => mockHttpAction);

// Mock apis — default export returning an object with loginUser URL
jest.mock('../../utils/apis', () => () => ({
  loginUser: '/api/user/login',
}));

// Mock loginWithGoogle — named export
const mockLoginWithGoogle = jest.fn();
jest.mock('../../utils/loginWithGoogle', () => ({
  loginWithGoogle: mockLoginWithGoogle,
}));

// Mock useGeneral hook
const mockNavigate   = jest.fn();
const mockSetLoading = jest.fn();
let   mockLoading    = false;

jest.mock('../../hooks/useGeneral', () => () => ({
  navigate:   mockNavigate,
  loading:    mockLoading,
  setLoading: mockSetLoading,
}));

// Mock react-hot-toast
jest.mock('react-hot-toast', () => ({
  __esModule: true,
  default: { error: jest.fn(), success: jest.fn() },
}));

// Mock CSS import (no-op)
jest.mock('../Components/Auth/auth.css', () => ({}), { virtual: true });

// ─── Component import (after mocks) ────────────────────────────────────────
// The Login component lives at Components/Auth/Login.jsx relative to src/
// Adjust path as needed for your project layout.
import Login from '../Components/Auth/Login';

// ─── Helpers ───────────────────────────────────────────────────────────────

/**
 * Renders the Login component.
 * Login uses useNavigate internally (via useGeneral); wrapping in
 * MemoryRouter is unnecessary because useGeneral is fully mocked.
 */
function renderLogin() {
  return render(<Login />);
}

// ─── Teardown ──────────────────────────────────────────────────────────────

afterEach(() => {
  jest.clearAllMocks();
  mockLoading = false;
});

// =============================================================================
// 1. Initial render state
// =============================================================================

describe('Login — initial render', () => {
  it('shows email field, password field, login button, google button, register button, and forgot-password button', () => {
    renderLogin();

    // Email input (MUI TextField renders a label + input)
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    // Password input
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    // Login submit button
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
    // Continue with Google
    expect(screen.getByRole('button', { name: /continue with google/i })).toBeInTheDocument();
    // Create new account
    expect(screen.getByRole('button', { name: /create new account/i })).toBeInTheDocument();
    // Forgot password
    expect(screen.getByRole('button', { name: /forgot password/i })).toBeInTheDocument();
  });
});

// =============================================================================
// 2. User typing into fields
// =============================================================================

describe('Login — user typing', () => {
  it('allows the user to type into the email field', async () => {
    renderLogin();
    const emailInput = screen.getByLabelText(/email/i);

    await userEvent.type(emailInput, 'ravi@example.com');

    expect(emailInput.value).toBe('ravi@example.com');
  });

  it('allows the user to type into the password field', async () => {
    renderLogin();
    const passwordInput = screen.getByLabelText(/password/i);

    await userEvent.type(passwordInput, 'password123');

    expect(passwordInput.value).toBe('password123');
  });
});

// =============================================================================
// 3. Validation errors on empty submit
// =============================================================================

describe('Login — validation errors', () => {
  it('shows "Email is required" and "Password is required" when submitting empty form', async () => {
    renderLogin();

    // Click submit without filling anything
    fireEvent.click(screen.getByRole('button', { name: /^login$/i }));

    // Formik + Yup validation runs asynchronously
    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });

    // httpAction should NOT have been called
    expect(mockHttpAction).not.toHaveBeenCalled();
  });
});

// =============================================================================
// 4. Happy path — navigate to /dashboard (onboardingCompleted: true)
// =============================================================================

describe('Login — form submission happy path', () => {
  it('calls httpAction with correct args and navigates to /dashboard when onboarding is complete', async () => {
    mockHttpAction.mockResolvedValue({
      status: true,
      user:   { onboardingCompleted: true },
    });

    renderLogin();

    await userEvent.type(screen.getByLabelText(/email/i),    'ravi@example.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'password123');
    fireEvent.click(screen.getByRole('button', { name: /^login$/i }));

    await waitFor(() => {
      expect(mockHttpAction).toHaveBeenCalledWith(
        expect.objectContaining({
          url:    '/api/user/login',
          method: 'POST',
          body:   expect.objectContaining({
            email:    'ravi@example.com',
            password: 'password123',
          }),
        })
      );
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });
});

// =============================================================================
// 5. Onboarding redirect — navigate to /auth/onboarding
// =============================================================================

describe('Login — onboarding redirect', () => {
  it('navigates to /auth/onboarding when onboardingCompleted is false', async () => {
    mockHttpAction.mockResolvedValue({
      status: true,
      user:   { onboardingCompleted: false },
    });

    renderLogin();

    await userEvent.type(screen.getByLabelText(/email/i),    'ravi@example.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'password123');
    fireEvent.click(screen.getByRole('button', { name: /^login$/i }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/auth/onboarding');
    });

    // Must NOT navigate to dashboard
    expect(mockNavigate).not.toHaveBeenCalledWith('/dashboard');
  });
});

// =============================================================================
// 6. Loading state — setLoading called in correct order
// =============================================================================

describe('Login — loading state', () => {
  it('calls setLoading(true) before httpAction and setLoading(false) after', async () => {
    // Track call order using an array
    const callOrder = [];

    mockSetLoading.mockImplementation((val) => callOrder.push(`setLoading(${val})`));
    mockHttpAction.mockImplementation(async () => {
      callOrder.push('httpAction');
      return { status: true, user: { onboardingCompleted: true } };
    });

    renderLogin();

    await userEvent.type(screen.getByLabelText(/email/i),    'ravi@example.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'password123');
    fireEvent.click(screen.getByRole('button', { name: /^login$/i }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalled();
    });

    // Verify order: setLoading(true) → httpAction → setLoading(false)
    expect(callOrder).toEqual(['setLoading(true)', 'httpAction', 'setLoading(false)']);
  });
});

// =============================================================================
// 7. API error — navigate NOT called when httpAction returns null
// =============================================================================

describe('Login — API error handling', () => {
  it('does NOT call navigate when httpAction returns null (error handled internally)', async () => {
    mockHttpAction.mockResolvedValue(null); // httpAction shows toast internally

    renderLogin();

    await userEvent.type(screen.getByLabelText(/email/i),    'ravi@example.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'password123');
    fireEvent.click(screen.getByRole('button', { name: /^login$/i }));

    // Give async operations time to settle
    await waitFor(() => {
      expect(mockHttpAction).toHaveBeenCalledTimes(1);
    });

    expect(mockNavigate).not.toHaveBeenCalled();
  });
});

// =============================================================================
// 8. Google login button
// =============================================================================

describe('Login — Google OAuth', () => {
  it('calls loginWithGoogle when "Continue with Google" button is clicked', async () => {
    renderLogin();

    const googleBtn = screen.getByRole('button', { name: /continue with google/i });
    fireEvent.click(googleBtn);

    expect(mockLoginWithGoogle).toHaveBeenCalledTimes(1);
  });
});
