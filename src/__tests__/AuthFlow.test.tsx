import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { describe, it, expect, vi } from 'vitest';
import { LoginPage } from '../pages/auth/LoginPage';
import { authApi } from '../services/apiClient';

vi.mock('../services/apiClient', () => ({
  authApi: {
    login: vi.fn(),
    googleLogin: vi.fn(),
  },
}));

const renderLoginPage = () =>
  render(
    <GoogleOAuthProvider clientId="test-client-id">
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    </GoogleOAuthProvider>
  );

describe('LoginPage Component', () => {
  it('renders the security gateway login header and form elements', () => {
    renderLoginPage();

    expect(screen.getByText(/Intru/i)).toBeInTheDocument();
    expect(screen.getByText(/Shield/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Account Email/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sign In/i })).toBeInTheDocument();
  });

  it('starts with empty email and password inputs (no default pre-filled credentials)', () => {
    renderLoginPage();

    const emailInput = screen.getByLabelText(/Account Email/i) as HTMLInputElement;
    const passwordInput = screen.getByLabelText(/Password/i) as HTMLInputElement;

    expect(emailInput.value).toBe('');
    expect(passwordInput.value).toBe('');
  });

  it('submits user credentials and invokes authApi.login', async () => {
    vi.mocked(authApi.login).mockResolvedValueOnce({
      message: 'Login successful',
      token: 'fake-jwt-token',
      user: { id: 'usr-1', email: 'user@example.com', role: 'Client' },
    });

    renderLoginPage();

    const emailInput = screen.getByLabelText(/Account Email/i);
    const passwordInput = screen.getByLabelText(/Password/i);
    const submitBtn = screen.getByRole('button', { name: /Sign In/i });

    fireEvent.change(emailInput, { target: { value: 'user@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'Password123!' } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(authApi.login).toHaveBeenCalledWith({
        email: 'user@example.com',
        password: 'Password123!',
      });
    });
  });
});
