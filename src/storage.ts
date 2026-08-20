import { CONFIGURACOES_PADRAO } from "./engine";
import type { Configuracoes, Milesimo } from "./engine";

const CHAVE = "precificador-semijoias-v1-config";

function ehMilesimo(valor: unknown): valor is Milesimo {
  return valor === 1 || valor === 2 || valor === 3 || valor === 4 || valor === 5 || valor === 6;
}

export function carregarConfiguracoes(): Configuracoes {
  const bruto = localStorage.getItem(CHAVE);
  if (!bruto) {
    return structuredClone(CONFIGURACOES_PADRAO);
  }
  try {
    const lido = JSON.parse(bruto) as Partial<Configuracoes>;
    const indices = { ...CONFIGURACOES_PADRAO.indice_banho };
    for (const chave of [1, 2, 3, 4, 5, 6] as const) {
      const n = Number(lido.indice_banho?.[chave]);
      if (Number.isFinite(n)) {
        indices[chave] = n;
      }
    }
    const custos = { ...CONFIGURACOES_PADRAO.custos_padrao };
    for (const campo of ["tag", "certificado", "saquinho", "sacola", "caixinha"] as const) {
      const n = Number(lido.custos_padrao?.[campo]);
      if (Number.isFinite(n)) {
        custos[campo] = n;
      }
    }
    return {
      indice_banho: indices,
      indice_verniz: Number.isFinite(Number(lido.indice_verniz))
        ? Number(lido.indice_verniz)
        : CONFIGURACOES_PADRAO.indice_verniz,
      modo_precificacao:
        lido.modo_precificacao === "REGRA_MATEMATICA" ? "REGRA_MATEMATICA" : "REGRA_DA_PLANILHA",
      metodo_arredondamento: "ARREDONDAMENTO_DA_PLANILHA",
      fator_percentual_padrao: Number.isFinite(Number(lido.fator_percentual_padrao))
        ? Number(lido.fator_percentual_padrao)
        : CONFIGURACOES_PADRAO.fator_percentual_padrao,
      ouro_do_dia: Number.isFinite(Number(lido.ouro_do_dia))
        ? Number(lido.ouro_do_dia)
        : CONFIGURACOES_PADRAO.ouro_do_dia,
      custos_padrao: custos,
    };
  } catch {
    return structuredClone(CONFIGURACOES_PADRAO);
  }
}

export function salvarConfiguracoes(config: Configuracoes): void {
  localStorage.setItem(CHAVE, JSON.stringify(config));
}

export function milesimoValido(valor: number): Milesimo {
  return ehMilesimo(valor) ? valor : 1;
}

const CHAVE_TEMA = "precificador-semijoias-v1-tema";

export type Tema = "dia" | "noite";

export function carregarTema(): Tema {
  return localStorage.getItem(CHAVE_TEMA) === "noite" ? "noite" : "dia";
}

export function salvarTema(tema: Tema): void {
  localStorage.setItem(CHAVE_TEMA, tema);
}
