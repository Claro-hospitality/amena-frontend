import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";

// SeccionFacturaCorte (dentro del diálogo) usa estas queries; se mockean para aislar el desglose.
const mocks = vi.hoisted(() => ({
  useFacturaDeCorte: vi.fn(() => ({ data: null, isLoading: false })),
  useFacturarCorte: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
  useDatosFiscalesEmpresa: vi.fn(() => ({ data: null })),
}));
vi.mock("../facturas/queries", () => ({
  useFacturaDeCorte: mocks.useFacturaDeCorte,
  useFacturarCorte: mocks.useFacturarCorte,
}));
vi.mock("../empresas/queries", () => ({ useDatosFiscalesEmpresa: mocks.useDatosFiscalesEmpresa }));

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
  it("con más consumidas que reservadas: reservados consumidos + extras/libres, sin faltantes", () => {
    renderizar(corteCon({ reservadas: 5, consumidas: 7 }));
    // reservadosConsumidos = min(5,7)=5 ; extrasLibres = 7-5=2
    expect(valorDe(/reservados consumidos/i)).toBe("5");
    expect(valorDe(/extras y libres/i)).toBe("2");
    expect(screen.queryByText(/sin consumir/i)).not.toBeInTheDocument();
  });

  it("con reservados sin consumir: los muestra con la nota de que se cobran igual", () => {
    renderizar(corteCon({ reservadas: 5, consumidas: 3 }));
    // reservadosConsumidos = 3 ; sinConsumir = 2 ; extrasLibres = 0
    expect(valorDe(/reservados consumidos/i)).toBe("3");
    expect(valorDe(/reservados sin consumir/i)).toBe("2");
    expect(screen.getByText(/se cobran igual/i)).toBeInTheDocument();
  });

  it("empresa en modo libre (0 reservados): todo cae en extras y libres", () => {
    renderizar(corteCon({ reservadas: 0, consumidas: 30 }));
    expect(valorDe(/reservados consumidos/i)).toBe("0");
    expect(valorDe(/extras y libres/i)).toBe("30");
    expect(screen.queryByText(/sin consumir/i)).not.toBeInTheDocument();
  });
});
