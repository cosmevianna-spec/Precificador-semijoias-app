# Validação contra a planilha

Como garantir que a **Regra da Planilha** reproduz o Excel, e quais testes a V1 deve ter antes de considerar o motor correto.

Planilha: `documentos/PLANILHA DE PRECIFICAÇÃO.xlsx`, aba `Planilha1`.

## 1. Estratégia

1. Isolar o motor de cálculo (sem UI).
2. Montar casos com os **mesmos números** das linhas 2–7 e da tabela de banho.
3. Comparar `custo_banho`, `custo_verniz`, `custo_total` (coluna N), `preco_venda` (coluna P) e `preco_final` (coluna Q).
4. Usar o fator **da linha do Excel**, não o padrão 300% da aplicação, nos testes de compatibilidade.
5. Registrar divergências intencionais (linha 5 / verniz).

A UI pode formatar `69,9` como `R$ 69,90`. O teste do motor compara o número da fórmula.

## 2. Parâmetros globais da planilha (snapshot)

Valores lidos da planilha, sem interpretação extra:

| Célula | Significado | Valor |
|---|---|---|
| C18 | peso usado no snapshot | 2,2 |
| B11..B16 | índices milésimos 1..6 | 2,24 / 3,58 / 4,33 / 5,07 / 5,81 / 6,56 |
| B17 | índice verniz | 0,38 |
| B22 | ouro do dia | 745 (não usado) |

Fórmulas conferidas:

```text
C11..C16 = B × C$18
C17      = C18 × B17
Nn       = SUM(Fn:Mn)
Pn       = Nn × (On + 1)
Qn       = CEILING(Pn/10; 1) × 10 − 0,1
```

## 3. Testes unitários do motor (Regra da Planilha)

Todos com `peso = 2,2`, `indice_verniz = 0,38`, índices da tabela.

### T01 — Banho por espessura

| Espessura | Índice | custo_banho esperado |
|---|---|---|
| 1 | 2,24 | 4,928 |
| 2 | 3,58 | 7,876 |
| 3 | 4,33 | 9,526 |
| 4 | 5,07 | 11,154 |
| 5 | 5,81 | 12,782 |
| 6 | 6,56 | 14,432 |

### T02 — Verniz

```text
custo_verniz = 2,2 × 0,38 = 0,836
```

### T03 — Linha 2 do Excel (compatibilidade plena)

Entradas: milésimo 1, bruto 2,60, tag 0,30, certificado 0,20, saquinho 0,12, sacola 0, caixinha 0, fator percentual 600 (célula `O2=6`).

| Saída | Esperado |
|---|---|
| custo_banho | 4,928 |
| custo_verniz | 0,836 |
| custo_total (N) | 8,984 |
| preco_venda (P) | 62,888 |
| preco_final (Q) | 69,90 |

### T04 — Linha 3

Milésimo 2, bruto 2,35, tag 0,30, certificado 0,20, saquinho 0,12, sacola 0, caixinha 0, fator 600%.

| Saída | Esperado |
|---|---|
| custo_total | 11,682 |
| preco_venda | 81,774 |
| preco_final | 89,90 |

### T05 — Linha 4

Milésimo 3, bruto 2,00, tag 1,00, certificado 0,39, saquinho 0,15, sacola 0, caixinha 0, fator 550% (`O4=5,5`).

| Saída | Esperado |
|---|---|
| custo_total | 13,902 |
| preco_venda | 90,363 |
| preco_final | 99,90 |

### T06 — Linha 6

Milésimo 5, bruto 2,00, tag 1,00, certificado 0,39, saquinho 0,15, sacola 0, caixinha 0, fator 500% (`O6=5`).

| Saída | Esperado |
|---|---|
| custo_total | 17,158 |
| preco_venda | 102,948 |
| preco_final | 109,90 |

### T07 — Linha 7

Milésimo 6, bruto 2,00, tag 1,00, certificado 0,39, saquinho 0,15, sacola 0, caixinha 0, fator 500%.

| Saída | Esperado |
|---|---|
| custo_total | 18,808 |
| preco_venda | 112,848 |
| preco_final | 119,90 |

### T08 — Linha 5 (divergência intencional)

Excel: `H5=0` (verniz zerado na linha), milésimo 4, bruto 4,75, tag 0,30, certificado 0,20, saquinho 0,15, fator 600%.

| Origem | custo_verniz | custo_total | preco_venda | preco_final |
|---|---|---|---|---|
| Excel | 0 | 16,554 | 115,878 | 119,90 |
| Aplicação (regra oficial) | 0,836 | 17,390 | 121,730 | 129,90 |

O teste da **aplicação** deve esperar a linha “Aplicação”, não copiar `H5=0`.

Pode existir um teste auxiliar “replay Excel linha 5” que força `custo_verniz = 0` só para provar que, com a mesma soma, o Excel bate. Esse teste não é o comportamento do produto.

### T09 — Lookup dinâmico

Mesmo peso 2,2 e mesmos custos extras da linha 2, trocando só o milésimo de 1 para 3:

- custo_banho deve passar de 4,928 para 9,526
- sem nenhum amarre `G2=C11`

### T10 — Peso por peça

Dois cálculos em sequência:

1. peso 2,2, milésimo 1 → banho 4,928  
2. peso 1,0, milésimo 1 → banho 2,24  

O segundo **não** pode continuar usando 2,2.

### T11 — Ouro do dia isolado

Repetir T03 com `ouro_do_dia` 745 e depois 999.

Nenhuma saída numérica pode mudar.

### T12 — Fator padrão da aplicação (300%)

Entradas da linha 2, mas `fator_percentual = 300`.

```text
custo_total = 8,984
preco_venda = 8,984 × 4 = 35,936
preco_final = CEILING(3,5936; 1) × 10 − 0,10 = 39,90
```

Este caso não existe como linha na planilha; valida a decisão oficial do fator inicial.

### T13 — Arredondamento psicológico

| preco_venda | preco_final |
|---|---|
| 115,878 | 119,90 |
| 62,888 | 69,90 |
| 70,00 | 69,90 |
| 70,01 | 79,90 |

### T14 — Regra Matemática na V1

Com as entradas de T03, o modo `REGRA_MATEMATICA` deve produzir o mesmo `preco_venda` e `preco_final` que a Regra da Planilha.

Se este teste falhar, algum dos modos inventou fórmula.

## 4. Como reproduzir no Excel (conferência manual)

Para um caso de compatibilidade:

1. Abrir a planilha original (cópia de leitura; não salvar alterações na original se for experimento).
2. Ajustar `C18` ao peso do teste.
3. Conferir `C11:C17`.
4. Conferir a linha cuja espessura corresponde ao milésimo, com os mesmos F, I, J, K, L, M, O.
5. Comparar N, P, Q.

Para não contaminar a fonte de verdade, preferir conferir pelos valores já extraídos neste documento.

## 5. Critério de pronto do motor

O motor da V1 está pronto para a UI quando passarem:

- T01 a T07 (compatibilidade)
- T08 na interpretação da aplicação
- T09 a T14 (melhorias e decisões oficiais)

Falha em T03–T07 bloqueia a implementação da tela: a matemática ainda não está fiel à planilha.
