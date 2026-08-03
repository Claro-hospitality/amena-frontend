import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";

// SeccionFacturaCorte (dentro del diálogo) usa estas queries; se mockean para aislar el desglose.
// useDetalleCorte devuelve el desglose real del corte (reservados/extras/libres/invitados).
const mocks = vi.hoisted(() => ({
  useFacturaDeCorte: vi.fn(() => ({ data: null, isLoading: false })),
  useFacturarCorte: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
  useDatosFiscalesEmpresa: vi.fn(() => ({ data: null })),
  useDetalleCorte: vi.fn(
    () =>
      ({ data: undefined }) as {
        data:
          | { reservados: number; extras: number; libres: number; invitados: number; consumidas: number }
          | undefined;
      },
  ),
}));
vi.mock("../facturas/queries", () => ({
  useFacturaDeCorte: mocks.useFacturaDeCorte,
  useFacturarCorte: mocks.useFacturarCorte,
}));
vi.mock("../empresas/queries", () => ({ useDatosFiscalesEmpresa: mocks.useDatosFiscalesEmpresa }));
vi.mock("./queries", () => ({ useDetalleCorte: mocks.useDetalleCorte }));

function conDesglose(d: {
  reservados: number;
  extras: number;
  libres: number;
  invitados: number;
  consumidas: number;
}) {
  mocks.useDetalleCorte.mockReturnValue({ data: d });
}

import type { CorteConEmpresa } from "./api";
import { CorteDetalleDialog } from "./CorteDetalleDialog";

function corteCon(over: Partial<CorteConEmpresa>): CorteConEmpresa {
  return {
    id: 7,
    empresa_id: 1,
    semana_inicio: "2026-07-13",
    reservadas: 5,
    consumidas: 7,
    extras: 2,
    precio_unitario: 100,
    monto_total: 700,
    estado: "cerrado",
    created_at: "",
    updated_at: "",
    empresa: { nombre: "Empresa A" },
    ...over,
  } as CorteConEmpresa;
}

function renderizar(corte: CorteConEmpresa) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter>
        <CorteDetalleDialog corte={corte} onClose={() => {}} />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

/** Devuelve el valor (número) que muestra la fila de una métrica por su etiqueta. */
function valorDe(etiqueta: RegExp): string {
  const fila = screen.getByText(etiqueta).closest("div")!;
  return within(fila).getByText(/^\d+$/).textContent!;
}

describe("CorteDetalleDialog — desglose de consumo", () => {
  it("separa extras y libres del desglose real; sin faltantes ni invitados", () => {
    conDesglose({ reservados: 5, extras: 1, libres: 1, invitados: 0, consumidas: 7 });
    renderizar(corteCon({ reservadas: 5, consumidas: 7 }));
    expect(valorDe(/reservados consumidos/i)).toBe("5");
    expect(valorDe(/^Extras$/i)).toBe("1");
    expect(valorDe(/^Libres$/i)).toBe("1");
    expect(screen.queryByText(/^Invitados$/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/sin consumir/i)).not.toBeInTheDocument();
  });

  it("muestra reservados sin consumir (se cobran igual)", () => {
    conDesglose({ reservados: 3, extras: 0, libres: 0, invitados: 0, consumidas: 3 });
    renderizar(corteCon({ reservadas: 5, consumidas: 3 }));
    expect(valorDe(/reservados consumidos/i)).toBe("3");
    expect(valorDe(/reservados sin consumir/i)).toBe("2");
    expect(screen.getByText(/se cobran igual/i)).toBeInTheDocument();
  });

  it("modo libre con invitados: muestra libres y la fila de invitados", () => {
    conDesglose({ reservados: 0, extras: 2, libres: 25, invitados: 3, consumidas: 30 });
    renderizar(corteCon({ reservadas: 0, consumidas: 30 }));
    expect(valorDe(/reservados consumidos/i)).toBe("0");
    expect(valorDe(/^Extras$/i)).toBe("2");
    expect(valorDe(/^Libres$/i)).toBe("25");
    expect(valorDe(/^Invitados$/i)).toBe("3");
  });
});
