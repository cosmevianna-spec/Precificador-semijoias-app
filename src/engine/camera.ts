import type { EntradaCamera, PecaInput } from "./types";

/**
 * Aplica os três campos extraídos pela câmera futura.
 * Não calcula preço, banho, fator nem arredondamento.
 */
export function aplicarEntradaCamera(peca: PecaInput, entrada: EntradaCamera): PecaInput {
  return {
    ...peca,
    milesimo: entrada.milesimo,
    peso: entrada.peso,
    preco_bruto: entrada.preco_bruto,
  };
}
