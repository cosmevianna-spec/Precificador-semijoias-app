# Telas da V1

Pensadas primeiro para celular, utilizáveis no desktop.

Duas telas. Nenhum cadastro de produto.

## Mapa

```text
Calculadora (tela principal)
  ├─ entradas da peça
  ├─ custos adicionais (contraídos)
  ├─ resultado
  └─ preview opcional das 6 espessuras (contraído)

Configurações
  ├─ ouro do dia
  ├─ modo e arredondamento
  ├─ fator padrão
  ├─ índices de banho e verniz
  └─ custos padrão
```

## 1. Tela principal — Calculadora

Objetivo: informar rápido e ver o preço.

### 1.1 Sempre visíveis — entrada

| Campo | Tipo | Observação |
|---|---|---|
| Milésimo / Espessura | seleção 1 a 6 | lookup dinâmico; não há linha fixa |
| Peso bruto | número, gramas | obrigatório para calcular banho e verniz |
| Preço do produto bruto | moeda | |
| Fator de venda | percentual | inicia com o padrão (300%); editável nesta tela |

Ordem visual sugerida, de cima para baixo, acompanhando o fluxo real:

1. Peso bruto  
2. Milésimo / Espessura  
3. Preço do produto bruto  
4. Fator de venda  

A câmera futura preencheria os três primeiros. Não mostrar botão de câmera na V1.

### 1.2 Contraído — custos adicionais da operação

Bloco fechado por padrão, por exemplo “Custos adicionais”.

| Campo | Tipo |
|---|---|
| Tag | moeda |
| Certificado de garantia | moeda |
| Saquinho plástico | moeda |
| Sacola para presente | moeda |
| Caixinha | moeda |

Ao abrir a calculadora, copiar os custos padrão das Configurações. O usuário altera só se aquela peça for diferente.

Não é necessário um campo “verniz em R$” aqui: o verniz é calculado pelo índice × peso. O índice fica em Configurações.

### 1.3 Sempre visíveis — resultado

| Campo | Origem |
|---|---|
| Custo do banho | `índice[milésimo] × peso` |
| Custo do verniz | `índice_verniz × peso` |
| Custos adicionais | soma dos cinco campos |
| Custo total | soma oficial |
| Preço de venda | modo de precificação |
| Preço final | arredondamento V1 |

Destaque visual no **preço final**. Os demais valores existem para conferência.

### 1.4 Contraído — conferência das espessuras

Bloco opcional, fechado por padrão: “Banho por espessura”.

Mostra as seis linhas `espessura → custo_banho`, já usando o peso informado.

Útil porque a planilha exibia as seis espessuras ao mesmo tempo. Na aplicação isso é preview, não seis peças.

Se o peso estiver vazio, o bloco não calcula.

### 1.5 O que não aparece na tela principal

- índices de banho
- índice de verniz
- ouro do dia (opcional: uma linha discreta somente leitura; preferência da spec: ficar em Configurações para não poluir)
- seletor de modo de precificação
- seletor de arredondamento
- cadastro (produto, código, descrição, unidade)

Acesso às Configurações: ícone ou link discreto no topo.

## 2. Tela — Configurações

Separada da operação do dia.

### 2.1 Informativo

| Campo | Editável | Entra no cálculo |
|---|---|---|
| Ouro do dia | sim | não |

### 2.2 Precificação

| Campo | V1 |
|---|---|
| Modo de precificação | `Regra da Planilha` (padrão) ou `Regra Matemática` |
| Método de arredondamento | somente `Arredondamento da planilha`, habilitado |
| Fator de venda padrão | 300%, editável |

Métodos futuros de arredondamento não devem aparecer como opção operacional na V1. Se houver menção na UI, deve estar claramente indisponível, sem fórmula implementada.

### 2.3 Tabela de banho

| Campo | Default da planilha |
|---|---|
| Índice milésimo 1 | 2,24 |
| Índice milésimo 2 | 3,58 |
| Índice milésimo 3 | 4,33 |
| Índice milésimo 4 | 5,07 |
| Índice milésimo 5 | 5,81 |
| Índice milésimo 6 | 6,56 |
| Índice do verniz | 0,38 |

### 2.4 Custos padrão

| Campo | Proposta de default |
|---|---|
| Tag | 0,30 |
| Certificado de garantia | 0,20 |
| Saquinho plástico | 0,12 |
| Sacola para presente | 0,00 |
| Caixinha | 0,00 |

Esses defaults preenchem a calculadora; não travam a operação.

## 3. Comportamento da UI

- Recalcular a cada alteração de campo (sem botão “Calcular”, salvo se a usabilidade mobile exigir um passo explícito após o peso).
- Preferência: recálculo imediato.
- Campos vazios: não inventar peso 0 como se fosse peça pesada; resultado só depois de peso e dados mínimos.
- Trocar o milésimo não apaga o peso.
- Trocar o peso atualiza os seis banhos e o verniz.
- Alterar ouro do dia nas Configurações não muda o resultado da calculadora.

## 4. Desktop

A mesma calculadora em coluna única, largura limitada, para não espalhar 17 colunas como a planilha.

Configurações podem usar mais largura na tabela de índices, sem mudar os campos.
