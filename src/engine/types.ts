export type Milesimo = 1 | 2 | 3 | 4 | 5 | 6;

export const MILESIMOS: readonly Milesimo[] = [1, 2, 3, 4, 5, 6];

export type ModoPrecificacao = "REGRA_DA_PLANILHA" | "REGRA_MATEMATICA";

export type MetodoArredondamento = "ARREDONDAMENTO_DA_PLANILHA";

export type CustosAdicionais = {
  tag: number;
  certificado: number;
  saquinho: number;
  sacola: number;
  caixinha: number;
};

export type PecaInput = CustosAdicionais & {
  milesimo: Milesimo;
  peso: number;
  preco_bruto: number;
  fator_percentual: number;
};

/**
 * Parâmetros que entram no cálculo.
 * ouro_do_dia NÃO pertence a este tipo de propósito.
 */
export type ParametrosCalculo = {
  indice_banho: Record<Milesimo, number>;
  indice_verniz: number;
  modo_precificacao: ModoPrecificacao;
  metodo_arredondamento: MetodoArredondamento;
};

export type Configuracoes = ParametrosCalculo & {
  fator_percentual_padrao: number;
  ouro_do_dia: number;
  custos_padrao: CustosAdicionais;
};

export type ResultadoCalculo = {
  custo_banho: number;
  custo_banho_por_espessura: Record<Milesimo, number>;
  custo_verniz: number;
  custos_adicionais: number;
  custo_total: number;
  preco_venda: number;
  preco_final: number;
  fator: number;
};

/**
 * Contrato futuro da câmera: só preenche entradas da calculadora.
 * Sem lógica de precificação.
 */
export type EntradaCamera = {
  milesimo: Milesimo;
  peso: number;
  preco_bruto: number;
};
