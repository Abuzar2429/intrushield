import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import { LoginPage } from '../pages/auth/LoginPage';
import { authApi } from '../services/apiClient';

vi.mock('../services/apiClient', () => ({
  authApi: {
    login: vi.fn(),
  },
}));

describe('LoginPage Component', () => {
  it('renders the SOC gateway login header and form elements', () => {
    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );

    expect(screen.getByText(/Intru/i)).toBeInTheDocument();
    expect(screen.getByText(/Shield/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Enterprise Email/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sign In to SOC Session/i })).toBeInTheDocument();
  });

  it('submits the form with default credentials and invokes authApi.login', async () => {
    vi.mocked(authApi.login).mockResolvedValueOnce({
      message: 'Login successful',
      token: 'fake-jwt-token',
      user: { id: '1', email: 'admin@intrushield.io', name: 'SOC Lead', role: 'Administrator', createdAt: '' },
    });

    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );

    const submitBtn = screen.getByRole('button', { name: /Sign In to SOC Session/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(authApi.login).toHaveBeenCalledWith({
        email: 'admin@intrushield.io',
        password: 'Admin@12345',
      });
    });
  });
});
