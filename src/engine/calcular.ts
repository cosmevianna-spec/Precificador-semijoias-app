import { MILESIMOS } from "./types";
import type {
  Milesimo,
  ModoPrecificacao,
  ParametrosCalculo,
  PecaInput,
  ResultadoCalculo,
} from "./types";

export function fatorDePercentual(fator_percentual: number): number {
  return fator_percentual / 100;
}

/**
 * Equivalente a CEILING(número; significância) do Excel,
 * com tolerância para erro de ponto flutuante.
 */
export function excelCeiling(numero: number, significancia: number): number {
  if (significancia === 0) {
    return 0;
  }
  const razao = numero / significancia;
  const inteiroMaisProximo = Math.round(razao);
  if (Math.abs(razao - inteiroMaisProximo) < 1e-10) {
    return inteiroMaisProximo * significancia;
  }
  return Math.ceil(razao - 1e-12) * significancia;
}

export function arredondarDaPlanilha(preco_venda: number): number {
  return excelCeiling(preco_venda / 10, 1) * 10 - 0.1;
}

export function custosBanhoPorEspessura(
  peso: number,
  indice_banho: Record<Milesimo, number>,
): Record<Milesimo, number> {
  const resultado = {} as Record<Milesimo, number>;
  for (const milesimo of MILESIMOS) {
    resultado[milesimo] = indice_banho[milesimo] * peso;
  }
  return resultado;
}

function precoVenda(custo_total: number, fator: number, modo: ModoPrecificacao): number {
  if (modo === "REGRA_MATEMATICA") {
    return custo_total + custo_total * fator;
  }
  return custo_total * (fator + 1);
}

function precoFinal(preco_venda: number, parametros: ParametrosCalculo): number {
  switch (parametros.metodo_arredondamento) {
    case "ARREDONDAMENTO_DA_PLANILHA":
      return arredondarDaPlanilha(preco_venda);
    default: {
      const _exaustivo: never = parametros.metodo_arredondamento;
      return _exaustivo;
    }
  }
}

export function calcular(peca: PecaInput, parametros: ParametrosCalculo): ResultadoCalculo {
  const fator = fatorDePercentual(peca.fator_percentual);
  const custo_banho_por_espessura = custosBanhoPorEspessura(peca.peso, parametros.indice_banho);
  const custo_banho = custo_banho_por_espessura[peca.milesimo];
  const custo_verniz = parametros.indice_verniz * peca.peso;
  const custos_adicionais =
    peca.tag + peca.certificado + peca.saquinho + peca.sacola + peca.caixinha;
  const custo_total =
    peca.preco_bruto +
    custo_banho +
    custo_verniz +
    peca.tag +
    peca.certificado +
    peca.saquinho +
    peca.sacola +
    peca.caixinha;
  const preco_venda = precoVenda(custo_total, fator, parametros.modo_precificacao);
  const preco_final = precoFinal(preco_venda, parametros);

  return {
    custo_banho,
    custo_banho_por_espessura,
    custo_verniz,
    custos_adicionais,
    custo_total,
    preco_venda,
    preco_final,
    fator,
  };
}
