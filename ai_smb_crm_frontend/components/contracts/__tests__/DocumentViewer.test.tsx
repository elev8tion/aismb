import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DocumentViewer from '../DocumentViewer';

const mockHtml = {
  msa: '<p>MSA Content</p>',
  sow: '<p>SOW Content</p>',
  addendum: '<p>Addendum Content</p>',
};

describe('DocumentViewer', () => {
  it('renders 3 tab buttons', () => {
    render(<DocumentViewer html={mockHtml} />);
    expect(screen.getByText('MSA')).toBeTruthy();
    expect(screen.getByText('SOW')).toBeTruthy();
    expect(screen.getByText('AI Addendum')).toBeTruthy();
  });

  it('shows MSA content initially', () => {
    render(<DocumentViewer html={mockHtml} />);
    expect(screen.getByText('MSA Content')).toBeTruthy();
  });

  it('switches to SOW tab on click', async () => {
    const user = userEvent.setup();
    render(<DocumentViewer html={mockHtml} />);
    await user.click(screen.getByText('SOW'));
    expect(screen.getByText('SOW Content')).toBeTruthy();
  });

  it('uses custom labels when provided', () => {
    render(<DocumentViewer html={mockHtml} labels={{ msa: 'Acuerdo Marco' }} />);
    expect(screen.getByText('Acuerdo Marco')).toBeTruthy();
  });

  it('shows initial progress as 0/3', () => {
    render(<DocumentViewer html={mockHtml} />);
    expect(screen.getByText(/0\/3/)).toBeTruthy();
  });

  it('shows scroll hint text', () => {
    render(<DocumentViewer html={mockHtml} />);
    expect(screen.getByText(/Scroll to bottom/)).toBeTruthy();
  });
});
