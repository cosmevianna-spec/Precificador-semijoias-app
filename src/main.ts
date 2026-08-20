import "./styles.css";
import { aplicarEntradaCamera, calcular, custosBanhoPorEspessura, MILESIMOS, pecaInicial } from "./engine";
import type { Configuracoes, EntradaCamera, PecaInput } from "./engine";
import { formatarMoeda, parseNumero, textoOuVazio } from "./format";
import { carregarConfiguracoes, milesimoValido, salvarConfiguracoes } from "./storage";

function $(id: string): HTMLElement {
  const el = document.getElementById(id);
  if (!el) {
    throw new Error(`Elemento #${id} não encontrado`);
  }
  return el;
}

function input(id: string): HTMLInputElement {
  return $(id) as HTMLInputElement;
}

let config: Configuracoes = carregarConfiguracoes();
let peca: PecaInput = pecaInicial(config);

function telaConfig(): boolean {
  return location.hash === "#/config";
}

function parametros() {
  return {
    indice_banho: config.indice_banho,
    indice_verniz: config.indice_verniz,
    modo_precificacao: config.modo_precificacao,
    metodo_arredondamento: config.metodo_arredondamento,
  };
}

function pecaPronta(): boolean {
  return Number.isFinite(peca.peso) && Number.isFinite(peca.preco_bruto) && Number.isFinite(peca.fator_percentual);
}

function atualizarNavegacao(): void {
  const configAberta = telaConfig();
  $("view-calculadora").classList.toggle("hidden", configAberta);
  $("view-config").classList.toggle("hidden", !configAberta);
  $("titulo-tela").textContent = configAberta ? "Configurações" : "Calculadora";
  const link = $("link-nav") as HTMLAnchorElement;
  link.href = configAberta ? "#/" : "#/config";
  link.textContent = configAberta ? "Calculadora" : "Configurações";
  if (configAberta) {
    $("preco-final").classList.add("hidden");
  }
}

function montarMilesimos(): void {
  const grupo = $("milesimos");
  grupo.replaceChildren();
  for (const milesimo of MILESIMOS) {
    const botao = document.createElement("button");
    botao.type = "button";
    botao.className = "chip";
    botao.textContent = String(milesimo);
    botao.setAttribute("role", "radio");
    botao.setAttribute("aria-checked", String(peca.milesimo === milesimo));
    botao.addEventListener("click", () => {
      peca.milesimo = milesimo;
      montarMilesimos();
      renderResultado();
    });
    grupo.append(botao);
  }
}

function campoIndice(id: string, valor: number, aoMudar: (n: number) => void): HTMLInputElement {
  const campo = document.createElement("input");
  campo.id = id;
  campo.type = "text";
  campo.inputMode = "decimal";
  campo.autocomplete = "off";
  campo.spellcheck = false;
  campo.setAttribute("enterkeyhint", "next");
  campo.setAttribute("autocapitalize", "off");
  campo.value = textoOuVazio(valor);
  campo.addEventListener("input", () => {
    const n = parseNumero(campo.value);
    if (Number.isFinite(n)) {
      aoMudar(n);
      persistirConfig();
      renderResultado();
    }
  });
  return campo;
}

function montarTabelaBanho(): void {
  const corpo = $("tabela-banho");
  corpo.replaceChildren();
  for (const milesimo of MILESIMOS) {
    const linha = document.createElement("tr");
    linha.id = `linha-banho-${milesimo}`;
    linha.addEventListener("click", (evento) => {
      if (evento.target instanceof HTMLInputElement) {
        return;
      }
      peca.milesimo = milesimo;
      montarMilesimos();
      renderResultado();
    });
    const colEsp = document.createElement("td");
    colEsp.textContent = String(milesimo);
    const colIndice = document.createElement("td");
    colIndice.className = "celula-indice";
    colIndice.append(
      campoIndice(`indice-banho-${milesimo}`, config.indice_banho[milesimo], (n) => {
        config.indice_banho[milesimo] = n;
      }),
    );
    const colCusto = document.createElement("td");
    colCusto.className = "celula-custo";
    colCusto.id = `custo-banho-${milesimo}`;
    colCusto.textContent = "—";
    linha.append(colEsp, colIndice, colCusto);
    corpo.append(linha);
  }

  const linhaVerniz = document.createElement("tr");
  linhaVerniz.className = "linha-verniz";
  const colNome = document.createElement("td");
  colNome.textContent = "Verniz";
  const colIndice = document.createElement("td");
  colIndice.className = "celula-indice";
  colIndice.append(
    campoIndice("indice-verniz", config.indice_verniz, (n) => {
      config.indice_verniz = n;
    }),
  );
  const colCusto = document.createElement("td");
  colCusto.className = "celula-custo";
  colCusto.id = "custo-verniz-tabela";
  colCusto.textContent = "—";
  linhaVerniz.append(colNome, colIndice, colCusto);
  corpo.append(linhaVerniz);
}

function atualizarCustosTabela(): void {
  const temPeso = Number.isFinite(peca.peso);
  const banhos = temPeso ? custosBanhoPorEspessura(peca.peso, config.indice_banho) : null;
  for (const milesimo of MILESIMOS) {
    $("custo-banho-" + milesimo).textContent = banhos ? formatarMoeda(banhos[milesimo]) : "—";
    $("linha-banho-" + milesimo).classList.toggle("selecionada", peca.milesimo === milesimo);
  }
  $("custo-verniz-tabela").textContent = temPeso
    ? formatarMoeda(config.indice_verniz * peca.peso)
    : "—";
}

function preencherFormularioPeca(): void {
  input("peso").value = textoOuVazio(peca.peso);
  input("preco-bruto").value = textoOuVazio(peca.preco_bruto);
  input("fator").value = textoOuVazio(peca.fator_percentual);
  input("tag").value = textoOuVazio(peca.tag);
  input("certificado").value = textoOuVazio(peca.certificado);
  input("saquinho").value = textoOuVazio(peca.saquinho);
  input("sacola").value = textoOuVazio(peca.sacola);
  input("caixinha").value = textoOuVazio(peca.caixinha);
}

function preencherFormularioConfig(): void {
  input("ouro-do-dia").value = textoOuVazio(config.ouro_do_dia);
  ($("modo") as HTMLSelectElement).value = config.modo_precificacao;
  ($("arredondamento") as HTMLSelectElement).value = config.metodo_arredondamento;
  input("fator-padrao").value = textoOuVazio(config.fator_percentual_padrao);
  input("padrao-tag").value = textoOuVazio(config.custos_padrao.tag);
  input("padrao-certificado").value = textoOuVazio(config.custos_padrao.certificado);
  input("padrao-saquinho").value = textoOuVazio(config.custos_padrao.saquinho);
  input("padrao-sacola").value = textoOuVazio(config.custos_padrao.sacola);
  input("padrao-caixinha").value = textoOuVazio(config.custos_padrao.caixinha);
  atualizarEnterKeyHint();
}

function atualizarResumos(): void {
  const extras = peca.tag + peca.certificado + peca.saquinho + peca.sacola + peca.caixinha;
  $("resumo-extras").textContent = ` · ${formatarMoeda(extras)}`;
  $("resumo-banho").textContent = ` · milésimo ${peca.milesimo}`;
}

function atualizarPendencias(): void {
  const pesoOk = Number.isFinite(peca.peso);
  const brutoOk = Number.isFinite(peca.preco_bruto);
  input("peso").closest(".field")?.classList.toggle("campo-pendente", !pesoOk);
  input("preco-bruto").closest(".field")?.classList.toggle("campo-pendente", !brutoOk);
  input("peso").setAttribute("aria-invalid", pesoOk ? "false" : "true");
  input("preco-bruto").setAttribute("aria-invalid", brutoOk ? "false" : "true");

  const vazio = $("resultado-vazio");
  if (!pesoOk && !brutoOk) {
    vazio.textContent = "Informe o peso e o preço bruto para calcular.";
  } else if (!pesoOk) {
    vazio.textContent = "Informe o peso da peça.";
  } else if (!brutoOk) {
    vazio.textContent = "Informe o preço do produto bruto.";
  } else if (!Number.isFinite(peca.fator_percentual)) {
    vazio.textContent = "Informe o fator de venda.";
  }
}

function renderResultado(): void {
  const vazio = $("resultado-vazio");
  const valores = $("resultado-valores");
  const faixa = $("preco-final");
  atualizarCustosTabela();
  atualizarResumos();
  atualizarPendencias();

  if (telaConfig() || !pecaPronta()) {
    vazio.classList.remove("hidden");
    valores.classList.add("hidden");
    faixa.classList.add("hidden");
    return;
  }

  const resultado = calcular(peca, parametros());
  vazio.classList.add("hidden");
  valores.classList.remove("hidden");
  faixa.classList.remove("hidden");
  $("out-banho").textContent = formatarMoeda(resultado.custo_banho);
  $("out-verniz").textContent = formatarMoeda(resultado.custo_verniz);
  $("out-extras").textContent = formatarMoeda(resultado.custos_adicionais);
  $("out-total").textContent = formatarMoeda(resultado.custo_total);
  $("out-venda").textContent = formatarMoeda(resultado.preco_venda);
  $("out-final").textContent = formatarMoeda(resultado.preco_final);
}

function persistirConfig(): void {
  salvarConfiguracoes(config);
}

function ligarCamposPeca(): void {
  const extras = new Set<keyof PecaInput>(["tag", "certificado", "saquinho", "sacola", "caixinha"]);
  const map: Array<[string, Exclude<keyof PecaInput, "milesimo">]> = [
    ["peso", "peso"],
    ["preco-bruto", "preco_bruto"],
    ["fator", "fator_percentual"],
    ["tag", "tag"],
    ["certificado", "certificado"],
    ["saquinho", "saquinho"],
    ["sacola", "sacola"],
    ["caixinha", "caixinha"],
  ];
  for (const [id, chave] of map) {
    input(id).addEventListener("input", () => {
      const n = parseNumero(input(id).value);
      peca[chave] = extras.has(chave) && !Number.isFinite(n) ? 0 : n;
      renderResultado();
    });
  }
}

function ligarCamposConfig(): void {
  input("ouro-do-dia").addEventListener("input", () => {
    const n = parseNumero(input("ouro-do-dia").value);
    if (Number.isFinite(n)) {
      config.ouro_do_dia = n;
      persistirConfig();
    }
  });
  $("modo").addEventListener("change", () => {
    config.modo_precificacao =
      ($("modo") as HTMLSelectElement).value === "REGRA_MATEMATICA"
        ? "REGRA_MATEMATICA"
        : "REGRA_DA_PLANILHA";
    persistirConfig();
    renderResultado();
  });
  input("fator-padrao").addEventListener("input", () => {
    const n = parseNumero(input("fator-padrao").value);
    if (Number.isFinite(n)) {
      config.fator_percentual_padrao = n;
      persistirConfig();
    }
  });
  const padroes: Array<[string, keyof Configuracoes["custos_padrao"]]> = [
    ["padrao-tag", "tag"],
    ["padrao-certificado", "certificado"],
    ["padrao-saquinho", "saquinho"],
    ["padrao-sacola", "sacola"],
    ["padrao-caixinha", "caixinha"],
  ];
  for (const [id, chave] of padroes) {
    input(id).addEventListener("input", () => {
      const n = parseNumero(input(id).value);
      if (Number.isFinite(n)) {
        config.custos_padrao[chave] = n;
        persistirConfig();
      }
    });
  }
}

/**
 * Ponto de extensão da câmera futura: preenche milésimo, peso e preço bruto
 * e dispara o mesmo motor. Sem OCR e sem botão na V1.
 */
export function preencherDaCamera(entrada: EntradaCamera): void {
  peca = aplicarEntradaCamera(peca, {
    ...entrada,
    milesimo: milesimoValido(entrada.milesimo),
  });
  preencherFormularioPeca();
  montarMilesimos();
  renderResultado();
}

function camposDaTelaAtiva(origem?: Element): Array<HTMLInputElement | HTMLSelectElement> {
  const view = telaConfig() ? $("view-config") : $("view-calculadora");
  const naTabela = Boolean(origem?.closest("#precificacao-banho"));
  return [...view.querySelectorAll<HTMLInputElement | HTMLSelectElement>("input, select")].filter((el) => {
    if (el.disabled) {
      return false;
    }
    const bloco = el.closest("details");
    if (bloco && !bloco.open) {
      return false;
    }
    return Boolean(el.closest("#precificacao-banho")) === naTabela;
  });
}

function atualizarEnterKeyHint(): void {
  const origens = telaConfig() ? [$("view-config")] : [$("form-calc"), $("precificacao-banho")];
  for (const origem of origens) {
    const campos = camposDaTelaAtiva(origem).filter((el) => el instanceof HTMLInputElement);
    campos.forEach((el, i) => {
      el.setAttribute("enterkeyhint", i === campos.length - 1 ? "done" : "next");
    });
  }
}

function focarCampo(el: HTMLInputElement | HTMLSelectElement): void {
  el.focus();
  if (el instanceof HTMLInputElement) {
    window.setTimeout(() => el.select(), 0);
  }
}

function avancarCampo(atual: HTMLInputElement | HTMLSelectElement, direcao: 1 | -1): void {
  const campos = camposDaTelaAtiva(atual);
  const indice = campos.indexOf(atual);
  const proximo = indice >= 0 ? campos[indice + direcao] : undefined;
  if (proximo) {
    focarCampo(proximo);
    return;
  }
  if (direcao === 1) {
    atual.blur();
  }
}

function ligarEnterEntreCampos(): void {
  $("app").addEventListener("keydown", (evento) => {
    if (evento.key !== "Enter" || evento.isComposing) {
      return;
    }
    const alvo = evento.target;
    if (!(alvo instanceof HTMLInputElement) && !(alvo instanceof HTMLSelectElement)) {
      return;
    }
    evento.preventDefault();
    avancarCampo(alvo, evento.shiftKey ? -1 : 1);
  });

  $("form-calc").addEventListener("submit", (evento) => {
    evento.preventDefault();
  });

  $("custos-adicionais").addEventListener("toggle", atualizarEnterKeyHint);
  $("precificacao-banho").addEventListener("toggle", atualizarEnterKeyHint);
}

function iniciar(): void {
  montarMilesimos();
  montarTabelaBanho();
  preencherFormularioPeca();
  preencherFormularioConfig();
  ligarCamposPeca();
  ligarCamposConfig();
  ligarEnterEntreCampos();
  atualizarEnterKeyHint();
  atualizarNavegacao();
  renderResultado();
  window.addEventListener("hashchange", () => {
    atualizarNavegacao();
    atualizarEnterKeyHint();
    renderResultado();
  });
}

iniciar();
