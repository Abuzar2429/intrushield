import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import { DashboardPage } from '../pages/DashboardPage';
import { MonitoringProvider } from '../context/MonitoringContext';

// Mock recharts ResponsiveContainer to avoid JSDOM SVG dimensions issue
vi.mock('recharts', async () => {
  const original = await vi.importActual<any>('recharts');
  return {
    ...original,
    ResponsiveContainer: ({ children }: any) => <div data-testid="responsive-container">{children}</div>,
  };
});

describe('DashboardPage Component', () => {
  it('renders key security metrics stat cards', () => {
    render(
      <BrowserRouter>
        <MonitoringProvider>
          <DashboardPage />
        </MonitoringProvider>
      </BrowserRouter>
    );

    expect(screen.getByText('Network Throughput')).toBeInTheDocument();
    expect(screen.getByText('Packets Analyzed (24h)')).toBeInTheDocument();
    expect(screen.getByText('AI Threat Confidence')).toBeInTheDocument();
    expect(screen.getByText('Critical Alerts')).toBeInTheDocument();
  });

  it('renders global threat score gauge section', () => {
    render(
      <BrowserRouter>
        <MonitoringProvider>
          <DashboardPage />
        </MonitoringProvider>
      </BrowserRouter>
    );

    expect(screen.getByText('Global Threat Score')).toBeInTheDocument();
    expect(screen.getByText('BGP Flowspec Rules:')).toBeInTheDocument();
  });
});
