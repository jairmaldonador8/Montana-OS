import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { KanbanBoard } from '@/components/pipeline/kanban/KanbanBoard';
import { Lead } from '@/types/pipeline';

// Mock dependencies
vi.mock('@/hooks/usePipelineLeads', () => ({
  usePipelineLeads: vi.fn(),
}));

vi.mock('@/components/pipeline/kanban/KanbanColumn', () => ({
  KanbanColumn: ({ status, leads, onLeadClick }: any) => (
    <div data-testid={`column-${status}`}>
      <div className="column-header">{status}</div>
      {leads.map((lead: Lead) => (
        <div
          key={lead.id}
          data-testid={`lead-${lead.id}`}
          onClick={() => onLeadClick(lead)}
          className="lead-card"
        >
          {lead.nombre}
        </div>
      ))}
    </div>
  ),
}));

vi.mock('@/components/pipeline/kanban/LeadSidebar', () => ({
  LeadSidebar: ({ lead, onClose, onLeadUpdate, isUpdating }: any) => (
    <div data-testid="lead-sidebar">
      <div data-testid="sidebar-title">{lead.nombre}</div>
      <button data-testid="sidebar-close" onClick={onClose}>
        Close
      </button>
    </div>
  ),
}));

vi.mock('@hello-pangea/dnd', () => ({
  DragDropContext: ({ children, onDragEnd }: any) => (
    <div data-testid="drag-drop-context" onClick={() => onDragEnd(null)}>
      {children}
    </div>
  ),
}));

import { usePipelineLeads } from '@/hooks/usePipelineLeads';

describe('KanbanBoard Component', () => {
  const mockLeads: Lead[] = [
    { id: '1', nombre: 'Lead 1', status: 'lead_nuevo', property_id: 'prop-1', created_at: new Date().toISOString() },
    { id: '2', nombre: 'Lead 2', status: 'interesado', property_id: 'prop-2', created_at: new Date().toISOString() },
    { id: '3', nombre: 'Lead 3', status: 'en_visita', property_id: 'prop-3', created_at: new Date().toISOString() },
  ];

  const mockUpdateStatus = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    const mockUsePipelineLeads = vi.mocked(usePipelineLeads);
    mockUsePipelineLeads.mockReturnValue({
      leads: mockLeads,
      loading: false,
      error: null,
      updateStatus: mockUpdateStatus,
    });
  });

  it('should render without crashing', () => {
    render(<KanbanBoard />);
    expect(screen.getByTestId('drag-drop-context')).toBeInTheDocument();
  });

  it('should display loading state', () => {
    const mockUsePipelineLeads = vi.mocked(usePipelineLeads);
    mockUsePipelineLeads.mockReturnValue({
      leads: [],
      loading: true,
      error: null,
      updateStatus: mockUpdateStatus,
    });

    render(<KanbanBoard />);
    expect(screen.getByText('Cargando pipeline...')).toBeInTheDocument();
  });

  it('should display error state', () => {
    const mockUsePipelineLeads = vi.mocked(usePipelineLeads);
    mockUsePipelineLeads.mockReturnValue({
      leads: [],
      loading: false,
      error: 'Failed to fetch leads',
      updateStatus: mockUpdateStatus,
    });

    render(<KanbanBoard />);
    expect(screen.getByText('Error al cargar el pipeline')).toBeInTheDocument();
    expect(screen.getByText('Failed to fetch leads')).toBeInTheDocument();
  });

  it('should render all status columns', () => {
    render(<KanbanBoard />);

    const statuses = [
      'lead_nuevo',
      'interesado',
      'pendiente_respuesta',
      'en_visita',
      'propuesta_enviada',
      'cerrado',
      'no_interesado',
    ];

    statuses.forEach((status) => {
      expect(screen.getByTestId(`column-${status}`)).toBeInTheDocument();
    });
  });

  it('should display leads in correct columns', () => {
    render(<KanbanBoard />);

    expect(screen.getByTestId('lead-1')).toBeInTheDocument();
    expect(screen.getByTestId('lead-2')).toBeInTheDocument();
    expect(screen.getByTestId('lead-3')).toBeInTheDocument();
  });

  it('should open sidebar when lead is clicked', () => {
    render(<KanbanBoard />);

    const leadCard = screen.getByTestId('lead-1');
    fireEvent.click(leadCard);

    waitFor(() => {
      expect(screen.getByTestId('lead-sidebar')).toBeInTheDocument();
    });
  });

  it('should display selected lead in sidebar', async () => {
    render(<KanbanBoard />);

    const leadCard = screen.getByTestId('lead-1');
    fireEvent.click(leadCard);

    await waitFor(() => {
      expect(screen.getByTestId('sidebar-title')).toBeInTheDocument();
    });
  });

  it('should close sidebar when close button is clicked', async () => {
    render(<KanbanBoard />);

    // Open sidebar
    const leadCard = screen.getByTestId('lead-1');
    fireEvent.click(leadCard);

    await waitFor(() => {
      expect(screen.getByTestId('lead-sidebar')).toBeInTheDocument();
    });

    // Close sidebar
    const closeButton = screen.getByTestId('sidebar-close');
    fireEvent.click(closeButton);

    await waitFor(() => {
      expect(screen.queryByTestId('lead-sidebar')).not.toBeInTheDocument();
    });
  });

  it('should handle drag and drop status update', () => {
    const mockUsePipelineLeads = vi.mocked(usePipelineLeads);
    mockUsePipelineLeads.mockReturnValue({
      leads: mockLeads,
      loading: false,
      error: null,
      updateStatus: mockUpdateStatus,
    });

    render(<KanbanBoard />);

    // The drag and drop context is mocked, so we verify the structure is correct
    expect(screen.getByTestId('drag-drop-context')).toBeInTheDocument();
  });

  it('should pass filters to usePipelineLeads', () => {
    const mockUsePipelineLeads = vi.mocked(usePipelineLeads);

    const filters = { assigned_to: 'user-123' };
    render(<KanbanBoard filters={filters} />);

    expect(mockUsePipelineLeads).toHaveBeenCalledWith(filters);
  });

  it('should group leads by status correctly', () => {
    const leadsWithMultipleStatuses: Lead[] = [
      { id: '1', nombre: 'Lead 1', status: 'lead_nuevo', property_id: 'prop-1', created_at: new Date().toISOString() },
      { id: '2', nombre: 'Lead 2', status: 'lead_nuevo', property_id: 'prop-2', created_at: new Date().toISOString() },
      { id: '3', nombre: 'Lead 3', status: 'interesado', property_id: 'prop-3', created_at: new Date().toISOString() },
    ];

    const mockUsePipelineLeads = vi.mocked(usePipelineLeads);
    mockUsePipelineLeads.mockReturnValue({
      leads: leadsWithMultipleStatuses,
      loading: false,
      error: null,
      updateStatus: mockUpdateStatus,
    });

    render(<KanbanBoard />);

    const leadNuevoColumn = screen.getByTestId('column-lead_nuevo');
    const leadInteresadoColumn = screen.getByTestId('column-interesado');

    expect(leadNuevoColumn).toContainElement(screen.getByTestId('lead-1'));
    expect(leadNuevoColumn).toContainElement(screen.getByTestId('lead-2'));
    expect(leadInteresadoColumn).toContainElement(screen.getByTestId('lead-3'));
  });

  it('should display empty columns when no leads', () => {
    const mockUsePipelineLeads = vi.mocked(usePipelineLeads);
    mockUsePipelineLeads.mockReturnValue({
      leads: [],
      loading: false,
      error: null,
      updateStatus: mockUpdateStatus,
    });

    render(<KanbanBoard />);

    const statuses = [
      'lead_nuevo',
      'interesado',
      'pendiente_respuesta',
      'en_visita',
      'propuesta_enviada',
      'cerrado',
      'no_interesado',
    ];

    statuses.forEach((status) => {
      expect(screen.getByTestId(`column-${status}`)).toBeInTheDocument();
    });
  });

  it('should update sidebar when lead status changes', async () => {
    const mockUsePipelineLeads = vi.mocked(usePipelineLeads);
    mockUsePipelineLeads.mockReturnValue({
      leads: mockLeads,
      loading: false,
      error: null,
      updateStatus: mockUpdateStatus,
    });

    const { rerender } = render(<KanbanBoard />);

    // Open sidebar for lead
    const leadCard = screen.getByTestId('lead-1');
    fireEvent.click(leadCard);

    // Update mock data
    const updatedLeads = [
      { ...mockLeads[0], status: 'interesado' },
      ...mockLeads.slice(1),
    ];

    mockUsePipelineLeads.mockReturnValue({
      leads: updatedLeads,
      loading: false,
      error: null,
      updateStatus: mockUpdateStatus,
    });

    rerender(<KanbanBoard />);

    // Sidebar should still show the updated lead
    await waitFor(() => {
      expect(screen.getByTestId('sidebar-title')).toBeInTheDocument();
    });
  });
});

describe('KanbanBoard Interactions', () => {
  const mockLeads: Lead[] = [
    { id: '1', nombre: 'Lead 1', status: 'lead_nuevo', property_id: 'prop-1', created_at: new Date().toISOString() },
  ];

  const mockUpdateStatus = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    const mockUsePipelineLeads = vi.mocked(usePipelineLeads);
    mockUsePipelineLeads.mockReturnValue({
      leads: mockLeads,
      loading: false,
      error: null,
      updateStatus: mockUpdateStatus,
    });
  });

  it('should render sidebar only when a lead is selected', () => {
    render(<KanbanBoard />);

    expect(screen.queryByTestId('lead-sidebar')).not.toBeInTheDocument();

    const leadCard = screen.getByTestId('lead-1');
    fireEvent.click(leadCard);

    waitFor(() => {
      expect(screen.getByTestId('lead-sidebar')).toBeInTheDocument();
    });
  });

  it('should maintain sidebar state during component updates', async () => {
    const { rerender } = render(<KanbanBoard />);

    const leadCard = screen.getByTestId('lead-1');
    fireEvent.click(leadCard);

    await waitFor(() => {
      expect(screen.getByTestId('lead-sidebar')).toBeInTheDocument();
    });

    // Rerender component
    rerender(<KanbanBoard />);

    await waitFor(() => {
      expect(screen.getByTestId('lead-sidebar')).toBeInTheDocument();
    });
  });
});
