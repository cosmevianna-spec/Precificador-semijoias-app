export function parseNumero(texto: string): number {
  const normalizado = texto.trim().replace(/\s/g, "").replace(",", ".");
  if (normalizado === "" || normalizado === "." || normalizado === "-" || normalizado === "-.") {
    return Number.NaN;
  }
  const n = Number(normalizado);
  return Number.isFinite(n) ? n : Number.NaN;
}

export function formatarMoeda(valor: number): string {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function textoOuVazio(valor: number): string {
  return Number.isFinite(valor) ? String(valor).replace(".", ",") : "";
}
