import type { Configuracoes, CustosAdicionais, Milesimo, PecaInput } from "./types";

export const INDICE_BANHO_PADRAO: Record<Milesimo, number> = {
  1: 2.24,
  2: 3.58,
  3: 4.33,
  4: 5.07,
  5: 5.81,
  6: 6.56,
};

export const INDICE_VERNIZ_PADRAO = 0.38;

export const CUSTOS_PADRAO: CustosAdicionais = {
  tag: 0.3,
  certificado: 0.2,
  saquinho: 0.12,
  sacola: 0,
  caixinha: 0,
};

export const CONFIGURACOES_PADRAO: Configuracoes = {
  indice_banho: { ...INDICE_BANHO_PADRAO },
  indice_verniz: INDICE_VERNIZ_PADRAO,
  modo_precificacao: "REGRA_DA_PLANILHA",
  metodo_arredondamento: "ARREDONDAMENTO_DA_PLANILHA",
  fator_percentual_padrao: 300,
  ouro_do_dia: 745,
  custos_padrao: { ...CUSTOS_PADRAO },
};

export function pecaInicial(config: Configuracoes): PecaInput {
  return {
    milesimo: 1,
    peso: Number.NaN,
    preco_bruto: Number.NaN,
    fator_percentual: config.fator_percentual_padrao,
    ...config.custos_padrao,
  };
}
