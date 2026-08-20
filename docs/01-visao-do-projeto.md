# Visão do projeto

## O que é

O Precificador de Semijoias é uma calculadora para definir o preço de venda de uma peça a partir de:

- milésimo/espessura
- peso da peça
- preço do produto bruto
- custos da operação
- fator de venda

A referência operacional atual é a planilha:

`documentos/PLANILHA DE PRECIFICAÇÃO.xlsx`

A aplicação deve agilizar esse processo no celular e no navegador, sem virar cadastro, estoque ou ERP.

## Fonte de verdade

A planilha original define a **matemática** da Regra da Planilha.

Regras:

1. Não alterar a planilha original.
2. Não inventar fórmulas novas para a Regra da Planilha.
3. Quando a estrutura física do Excel for rígida demais (peso global, `G2=C11` fixo, várias linhas do mesmo SKU), preservar a matemática e implementar entrada **dinâmica por peça**.

## Prioridade

**Rapidez + precisão + facilidade de uso.**

A tela principal deve caber no fluxo real:

```text
peça ? pesar ? informar peso ? calcular
```

## Conceitos oficiais

| Conceito | Definição |
|---|---|
| Milésimo / espessura | O mesmo conceito. Valores da tabela: 1, 2, 3, 4, 5 e 6 |
| Peso bruto | Peso da peça em gramas, informado por peça. Usado no banho e no verniz |
| Preço do produto bruto | Custo de aquisição da peça sem banho/acabamento da operação |
| Índice de banho | Parâmetro por milésimo, editável em configurações |
| Índice de verniz | Parâmetro único, editável em configurações |
| Fator de venda | Percentual informado pelo usuário. 300% significa fator `3` |
| Ouro do dia | Cotação informativa. Editável. Não entra em nenhum cálculo |
| Regra da Planilha | Modo padrão. Matemática e arredondamento V1 iguais ao Excel |
| Regra Matemática | Segundo modo. Aplica o percentual sobre o custo. Arredondamento é parâmetro separado |
| Arredondamento da planilha | Único método na V1: `CEILING(preço_venda / 10; 1) × 10 ? 0,10` |

## O que a V1 é

- Calculadora de uma peça por vez
- Mobile-first, também no desktop
- Configurações separadas da operação do dia
- Dois modos de precificação, padrão = Regra da Planilha
- Um método de arredondamento na V1, com espaço para outros depois

## O que a V1 não é

- Cadastro complexo de produtos
- Controle de estoque
- ERP
- Sistema de câmera (só preparação de contrato)
- Terceiro modo de precificação (“Regra Maximizada” ou equivalente)

## Decisões já validadas

1. Ouro do dia é informativo.
2. Peso é por peça, nunca global.
3. Milésimo = espessura; lookup dinâmico após o peso.
4. Verniz = `índice_verniz × peso`. `H5=0` da planilha não é regra.
5. Tag, certificado, saquinho, sacola e caixinha são editáveis.
6. Fator inicial = 300%. Usuário altera livremente. Fórmula: `custo_total × (fator + 1)`.
7. Somente dois modos: Regra da Planilha e Regra Matemática.
8. Arredondamento V1 = comportamento da planilha.
9. Câmera futura só preenche milésimo, peso bruto e preço do produto bruto.
10. Sem cadastro/estoque/ERP na V1.
