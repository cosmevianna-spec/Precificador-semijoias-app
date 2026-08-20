import { describe, expect, it } from "vitest";
import { aplicarEntradaCamera } from "./camera";
import {
  arredondarDaPlanilha,
  calcular,
  custosBanhoPorEspessura,
  fatorDePercentual,
} from "./calcular";
import { CONFIGURACOES_PADRAO, INDICE_BANHO_PADRAO, INDICE_VERNIZ_PADRAO } from "./defaults";
import type { ParametrosCalculo, PecaInput } from "./types";

const PARAMETROS: ParametrosCalculo = {
  indice_banho: { ...INDICE_BANHO_PADRAO },
  indice_verniz: INDICE_VERNIZ_PADRAO,
  modo_precificacao: "REGRA_DA_PLANILHA",
  metodo_arredondamento: "ARREDONDAMENTO_DA_PLANILHA",
};

const PESO_PLANILHA = 2.2;

function peca(parcial: Partial<PecaInput> & Pick<PecaInput, "milesimo" | "preco_bruto">): PecaInput {
  return {
    peso: PESO_PLANILHA,
    fator_percentual: 600,
    tag: 0.3,
    certificado: 0.2,
    saquinho: 0.12,
    sacola: 0,
    caixinha: 0,
    ...parcial,
  };
}

describe("conversão do fator", () => {
  it("100% → fator 1, 200% → 2, 300% → 3", () => {
    expect(fatorDePercentual(100)).toBe(1);
    expect(fatorDePercentual(200)).toBe(2);
    expect(fatorDePercentual(300)).toBe(3);
    expect(fatorDePercentual(550)).toBe(5.5);
    expect(fatorDePercentual(600)).toBe(6);
  });
});

describe("T01 — banho por espessura", () => {
  it("calcula índice × peso para os milésimos 1 a 6", () => {
    const banhos = custosBanhoPorEspessura(PESO_PLANILHA, INDICE_BANHO_PADRAO);
    expect(banhos[1]).toBeCloseTo(4.928, 4);
    expect(banhos[2]).toBeCloseTo(7.876, 4);
    expect(banhos[3]).toBeCloseTo(9.526, 4);
    expect(banhos[4]).toBeCloseTo(11.154, 4);
    expect(banhos[5]).toBeCloseTo(12.782, 4);
    expect(banhos[6]).toBeCloseTo(14.432, 4);
  });
});

describe("T02 — verniz", () => {
  it("custo_verniz = índice_verniz × peso", () => {
    const resultado = calcular(peca({ milesimo: 1, preco_bruto: 2.6 }), PARAMETROS);
    expect(resultado.custo_verniz).toBeCloseTo(0.836, 4);
  });
});

describe("T03 — linha 2 do Excel", () => {
  it("reproduz N, P e Q da planilha", () => {
    const resultado = calcular(peca({ milesimo: 1, preco_bruto: 2.6 }), PARAMETROS);
    expect(resultado.custo_banho).toBeCloseTo(4.928, 4);
    expect(resultado.custo_verniz).toBeCloseTo(0.836, 4);
    expect(resultado.custo_total).toBeCloseTo(8.984, 4);
    expect(resultado.preco_venda).toBeCloseTo(62.888, 4);
    expect(resultado.preco_final).toBeCloseTo(69.9, 2);
  });
});

describe("T04 — linha 3 do Excel", () => {
  it("milésimo 2, bruto 2,35, fator 600%", () => {
    const resultado = calcular(peca({ milesimo: 2, preco_bruto: 2.35 }), PARAMETROS);
    expect(resultado.custo_total).toBeCloseTo(11.682, 4);
    expect(resultado.preco_venda).toBeCloseTo(81.774, 4);
    expect(resultado.preco_final).toBeCloseTo(89.9, 2);
  });
});

describe("T05 — linha 4 do Excel", () => {
  it("milésimo 3, fator 550% e custos extras diferentes", () => {
    const resultado = calcular(
      peca({
        milesimo: 3,
        preco_bruto: 2,
        fator_percentual: 550,
        tag: 1,
        certificado: 0.39,
        saquinho: 0.15,
      }),
      PARAMETROS,
    );
    expect(resultado.custo_total).toBeCloseTo(13.902, 4);
    expect(resultado.preco_venda).toBeCloseTo(90.363, 4);
    expect(resultado.preco_final).toBeCloseTo(99.9, 2);
  });
});

describe("T06 — linha 6 do Excel", () => {
  it("milésimo 5, fator 500%", () => {
    const resultado = calcular(
      peca({
        milesimo: 5,
        preco_bruto: 2,
        fator_percentual: 500,
        tag: 1,
        certificado: 0.39,
        saquinho: 0.15,
      }),
      PARAMETROS,
    );
    expect(resultado.custo_total).toBeCloseTo(17.158, 4);
    expect(resultado.preco_venda).toBeCloseTo(102.948, 4);
    expect(resultado.preco_final).toBeCloseTo(109.9, 2);
  });
});

describe("T07 — linha 7 do Excel", () => {
  it("milésimo 6, fator 500%", () => {
    const resultado = calcular(
      peca({
        milesimo: 6,
        preco_bruto: 2,
        fator_percentual: 500,
        tag: 1,
        certificado: 0.39,
        saquinho: 0.15,
      }),
      PARAMETROS,
    );
    expect(resultado.custo_total).toBeCloseTo(18.808, 4);
    expect(resultado.preco_venda).toBeCloseTo(112.848, 4);
    expect(resultado.preco_final).toBeCloseTo(119.9, 2);
  });
});

describe("T08 — linha 5 não copia H5=0", () => {
  const baseLinha5 = peca({
    milesimo: 4,
    preco_bruto: 4.75,
    tag: 0.3,
    certificado: 0.2,
    saquinho: 0.15,
    fator_percentual: 600,
  });

  it("usa verniz configurado (regra oficial da aplicação)", () => {
    const resultado = calcular(baseLinha5, PARAMETROS);
    expect(resultado.custo_verniz).toBeCloseTo(0.836, 4);
    expect(resultado.custo_total).toBeCloseTo(17.39, 4);
    expect(resultado.preco_venda).toBeCloseTo(121.73, 4);
    expect(resultado.preco_final).toBeCloseTo(129.9, 2);
  });

  it("replay Excel: só bate a linha 5 se o índice de verniz for forçado a zero", () => {
    const resultado = calcular(baseLinha5, { ...PARAMETROS, indice_verniz: 0 });
    expect(resultado.custo_verniz).toBeCloseTo(0, 4);
    expect(resultado.custo_total).toBeCloseTo(16.554, 4);
    expect(resultado.preco_venda).toBeCloseTo(115.878, 4);
    expect(resultado.preco_final).toBeCloseTo(119.9, 2);
  });
});

describe("T09 — lookup dinâmico", () => {
  it("trocar o milésimo troca o custo de banho com o mesmo peso", () => {
    const extras = peca({ milesimo: 1, preco_bruto: 2.6 });
    const m1 = calcular(extras, PARAMETROS);
    const m3 = calcular({ ...extras, milesimo: 3 }, PARAMETROS);
    expect(m1.custo_banho).toBeCloseTo(4.928, 4);
    expect(m3.custo_banho).toBeCloseTo(9.526, 4);
    expect(m3.custo_banho).not.toBeCloseTo(m1.custo_banho, 4);
  });
});

describe("T10 — peso por peça", () => {
  it("o segundo cálculo não reutiliza o peso do primeiro", () => {
    const base = peca({ milesimo: 1, preco_bruto: 2.6 });
    const a = calcular({ ...base, peso: 2.2 }, PARAMETROS);
    const b = calcular({ ...base, peso: 1 }, PARAMETROS);
    expect(a.custo_banho).toBeCloseTo(4.928, 4);
    expect(b.custo_banho).toBeCloseTo(2.24, 4);
  });
});

describe("T11 — ouro do dia isolado", () => {
  it("ouro_do_dia não é parâmetro do motor e não altera o resultado", () => {
    const pecaT03 = peca({ milesimo: 1, preco_bruto: 2.6 });
    const r1 = calcular(pecaT03, PARAMETROS);
    const r2 = calcular(pecaT03, PARAMETROS);
    expect(CONFIGURACOES_PADRAO.ouro_do_dia).toBe(745);
    const ouroAlterado = { ...CONFIGURACOES_PADRAO, ouro_do_dia: 999 };
    expect(ouroAlterado.ouro_do_dia).toBe(999);
    expect(r1.custo_total).toBeCloseTo(r2.custo_total, 10);
    expect(r1.preco_venda).toBeCloseTo(r2.preco_venda, 10);
    expect(r1.preco_final).toBeCloseTo(r2.preco_final, 10);
    expect("ouro_do_dia" in PARAMETROS).toBe(false);
  });
});

describe("T12 — fator padrão 300%", () => {
  it("300% → custo × 4 e arredondamento da planilha", () => {
    const resultado = calcular(
      peca({ milesimo: 1, preco_bruto: 2.6, fator_percentual: 300 }),
      PARAMETROS,
    );
    expect(resultado.fator).toBe(3);
    expect(resultado.custo_total).toBeCloseTo(8.984, 4);
    expect(resultado.preco_venda).toBeCloseTo(35.936, 4);
    expect(resultado.preco_final).toBeCloseTo(39.9, 2);
  });
});

describe("T13 — arredondamento da planilha", () => {
  it("reproduz CEILING(preço/10; 1) × 10 − 0,10", () => {
    expect(arredondarDaPlanilha(115.878)).toBeCloseTo(119.9, 2);
    expect(arredondarDaPlanilha(62.888)).toBeCloseTo(69.9, 2);
    expect(arredondarDaPlanilha(70)).toBeCloseTo(69.9, 2);
    expect(arredondarDaPlanilha(70.01)).toBeCloseTo(79.9, 2);
    expect(arredondarDaPlanilha(0)).toBeCloseTo(-0.1, 2);
  });
});

describe("T14 — regra matemática na V1", () => {
  it("produz o mesmo preço de venda e final que a regra da planilha", () => {
    const pecaT03 = peca({ milesimo: 1, preco_bruto: 2.6 });
    const planilha = calcular(pecaT03, PARAMETROS);
    const matematica = calcular(pecaT03, {
      ...PARAMETROS,
      modo_precificacao: "REGRA_MATEMATICA",
    });
    expect(matematica.preco_venda).toBeCloseTo(planilha.preco_venda, 10);
    expect(matematica.preco_final).toBeCloseTo(planilha.preco_final, 10);
  });
});

describe("contrato da câmera", () => {
  it("preenche só milésimo, peso e preço bruto", () => {
    const original = peca({ milesimo: 1, preco_bruto: 2.6, fator_percentual: 300 });
    const atualizada = aplicarEntradaCamera(original, {
      milesimo: 4,
      peso: 1.5,
      preco_bruto: 9.9,
    });
    expect(atualizada.milesimo).toBe(4);
    expect(atualizada.peso).toBe(1.5);
    expect(atualizada.preco_bruto).toBe(9.9);
    expect(atualizada.fator_percentual).toBe(300);
    expect(atualizada.tag).toBe(original.tag);
  });
});
