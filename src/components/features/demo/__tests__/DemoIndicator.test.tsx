import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { DemoIndicator, DemoBanner, DemoStatusBadge, DemoWarning } from '../DemoIndicator';

// Mock next/link
jest.mock('next/link', () => {
  return function MockLink({ children, href }: { children: React.ReactNode; href: string }) {
    return <a href={href}>{children}</a>;
  };
});

describe('DemoIndicator', () => {
  it('renders without crashing', () => {
    render(<DemoIndicator />);
    expect(screen.getByText('DEMO')).toBeInTheDocument();
  });

  it('displays demo indicator text', () => {
    render(<DemoIndicator />);
    const demoText = screen.getByText('DEMO');
    expect(demoText).toBeInTheDocument();
    expect(demoText).toHaveClass('label');
  });

  it('renders as a button with toggle functionality', () => {
    render(<DemoIndicator />);
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label', 'Expand demo panel');
    expect(button).toHaveAttribute('aria-expanded', 'false');
  });

  it('has correct CSS classes applied', () => {
    render(<DemoIndicator />);
    const indicator = screen.getByRole('button').parentElement;
    expect(indicator).toHaveClass('indicator');
  });

  it('is accessible with proper ARIA attributes', () => {
    render(<DemoIndicator />);
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label', 'Expand demo panel');
    expect(button).toHaveAttribute('aria-expanded', 'false');
  });

  it('renders with fixed positioning for overlay', () => {
    render(<DemoIndicator />);
    const indicator = screen.getByRole('button').parentElement;
    
    // The indicator should have styles that position it as a fixed overlay
    expect(indicator).toHaveClass('indicator');
  });
});

describe('DemoBanner', () => {
  it('renders without crashing', () => {
    render(<DemoBanner />);
    expect(screen.getByText(/Demo Mode/)).toBeInTheDocument();
  });

  it('displays demo banner message', () => {
    render(<DemoBanner />);
    expect(screen.getByText(/Demo Mode Active/)).toBeInTheDocument();
    expect(screen.getByText(/simulated for testing/)).toBeInTheDocument();
  });

  it('calls onDismiss when close button is clicked', () => {
    const onDismissMock = jest.fn();
    render(<DemoBanner onDismiss={onDismissMock} />);
    
    const closeButton = screen.getByText('×');
    closeButton.click();
    expect(onDismissMock).toHaveBeenCalledTimes(1);
  });

  it('renders without close button when onDismiss is not provided', () => {
    render(<DemoBanner />);
    expect(screen.queryByText('×')).not.toBeInTheDocument();
  });
});

describe('DemoStatusBadge', () => {
  it('renders without crashing', () => {
    render(<DemoStatusBadge />);
    expect(screen.getByText('DEMO')).toBeInTheDocument();
  });

  it('displays demo status badge', () => {
    render(<DemoStatusBadge />);
    const badge = screen.getByText('DEMO');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('statusBadge');
  });
});

describe('DemoWarning', () => {
  it('renders with default message', () => {
    render(<DemoWarning />);
    expect(screen.getByText(/Demo mode/)).toBeInTheDocument();
    expect(screen.getByText(/Changes will not be saved/)).toBeInTheDocument();
  });

  it('renders with custom message', () => {
    const customMessage = 'Custom demo warning message';
    render(<DemoWarning message={customMessage} />);
    expect(screen.getByText(customMessage)).toBeInTheDocument();
  });

  it('has warning styling applied', () => {
    render(<DemoWarning />);
    const warning = screen.getByText(/Demo mode/).parentElement;
    expect(warning).toHaveClass('warning');
  });
});
