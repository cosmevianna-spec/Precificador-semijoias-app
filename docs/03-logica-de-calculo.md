# Especifica??o da l?gica de c?lculo

Este documento ? a especifica??o normativa do motor de c?lculo da V1.

N?o inventa f?rmulas para a Regra da Planilha. A matem?tica abaixo foi extra?da da planilha original e das decis?es de neg?cio validadas.

Fonte: `documentos/PLANILHA DE PRECIFICA??O.xlsx`.

## 1. Entradas

### 1.1 Entradas da pe?a (opera??o)

| Campo | Unidade | Origem |
|---|---|---|
| `milesimo` | inteiro 1..6 | usu?rio ou, no futuro, c?mera |
| `peso` | gramas | usu?rio ou, no futuro, c?mera |
| `preco_bruto` | R$ | usu?rio ou, no futuro, c?mera |
| `fator_percentual` | % | usu?rio; default das configura??es |
| `tag` | R$ | usu?rio; default das configura??es |
| `certificado` | R$ | usu?rio; default das configura??es |
| `saquinho` | R$ | usu?rio; default das configura??es |
| `sacola` | R$ | usu?rio; default das configura??es |
| `caixinha` | R$ | usu?rio; default das configura??es |

### 1.2 Par?metros (configura??es)

| Campo | Valor inicial extra?do da planilha / decis?o |
|---|---|
| `indice_banho[1]` | 2,24 |
| `indice_banho[2]` | 3,58 |
| `indice_banho[3]` | 4,33 |
| `indice_banho[4]` | 5,07 |
| `indice_banho[5]` | 5,81 |
| `indice_banho[6]` | 6,56 |
| `indice_verniz` | 0,38 |
| `fator_percentual_padrao` | 300 |
| `modo_precificacao` | `REGRA_DA_PLANILHA` |
| `metodo_arredondamento` | `ARREDONDAMENTO_DA_PLANILHA` |
| `ouro_do_dia` | 745 (informativo; n?o usado nas f?rmulas) |

Os custos padr?o iniciais podem copiar os exemplos da planilha, mas **n?o s?o regra**. Proposta de default da V1 (linhas 2?3 da planilha):

| Campo | Proposta de default |
|---|---|
| tag | 0,30 |
| certificado | 0,20 |
| saquinho | 0,12 |
| sacola | 0,00 |
| caixinha | 0,00 |

## 2. Convers?o do fator

```text
fator = fator_percentual / 100
```

Exemplos oficiais:

```text
100% ? fator 1 ? multiplicador (fator + 1) = 2
200% ? fator 2 ? multiplicador (fator + 1) = 3
300% ? fator 3 ? multiplicador (fator + 1) = 4
```

Na planilha, a c?lula `O` guarda o n?mero do fator (ex.: `6`) com formato `%`. A aplica??o deve tratar o percentual de forma expl?cita para o usu?rio (campo 300), e converter para `fator = 3` internamente. N?o armazenar `6` para representar 300%.

## 3. Custos calculados (iguais nos dois modos)

Estas etapas n?o dependem do modo de precifica??o.

### 3.1 Banho

Para cada espessura `e` em `{1,2,3,4,5,6}`:

```text
custo_banho[e] = indice_banho[e] ? peso
```

Custo da pe?a:

```text
custo_banho_peca = custo_banho[milesimo]
```

### 3.2 Verniz

```text
custo_verniz = indice_verniz ? peso
```

N?o zerar o verniz por analogia ? c?lula `H5` da planilha.

### 3.3 Custos adicionais

```text
custos_adicionais = tag + certificado + saquinho + sacola + caixinha
```

### 3.4 Custo total

```text
custo_total =
    preco_bruto
  + custo_banho_peca
  + custo_verniz
  + tag
  + certificado
  + saquinho
  + sacola
  + caixinha
```

Equivalente a `SUM(F:M)` da planilha, com banho e verniz obtidos dinamicamente.

## 4. Modos de precifica??o

Existem somente dois modos. O arredondamento **n?o** ? um terceiro modo; ? par?metro separado.

### 4.1 Regra da Planilha (padr?o)

F?rmula da coluna `P`:

```text
preco_venda = custo_total ? (fator + 1)
```

Na V1, o pre?o final aplica o Arredondamento da Planilha (se??o 5).

Este modo ? o de **compatibilidade com o Excel**.

### 4.2 Regra Matem?tica

O percentual incide sobre o custo:

```text
preco_venda = custo_total + (custo_total ? fator)
```

que ? algebricamente id?ntico a:

```text
preco_venda = custo_total ? (fator + 1)
```

Exemplos oficiais, custo = R$ 100:

| Percentual | Pre?o de venda |
|---|---|
| 100% | R$ 200 |
| 200% | R$ 300 |
| 300% | R$ 400 |

O arredondamento permanece par?metro separado. Na V1, o ?nico m?todo dispon?vel ainda ? o da planilha. Por isso, **na V1 os dois modos geram o mesmo `preco_venda` e o mesmo `preco_final`**, desde que entradas e fator sejam iguais.

Isso ? intencional:

- n?o inventar uma terceira f?rmula
- separar conceitualmente **como o percentual entra** e **como o pre?o ? arredondado**
- permitir, no futuro, outro m?todo de arredondamento sem criar um terceiro modo de precifica??o

Se, depois da V1, a Regra Matem?tica precisar divergir da planilha (por exemplo, sem o `CEILING` psicol?gico), isso se faz trocando o m?todo de arredondamento, n?o criando um novo modo.

## 5. Arredondamento

### 5.1 V1 ? Arredondamento da Planilha

F?rmula da coluna `Q`:

```text
preco_final = CEILING(preco_venda / 10; 1) ? 10 ? 0,10
```

Comportamento do Excel `CEILING(n?mero; signific?ncia)`: arredonda o n?mero **para cima**, longe de zero, para o m?ltiplo da signific?ncia.

Efeito pr?tico: sobe para a pr?xima dezena e subtrai R$ 0,10, gerando pre?os `x9,90`.

Exemplo oficial:

```text
R$ 115,878 ? CEILING(11,5878; 1) = 12 ? 120 ? 0,10 = R$ 119,90
```

Casos de borda a preservar (n?o ?corrigir?):

| preco_venda | preco_final |
|---|---|
| 70,00 | 69,90 |
| 70,01 | 79,90 |
| 62,888 | 69,90 |
| 0,00 | ?0,10 |

O caso `0,00 ? ?0,10` ? o comportamento literal da f?rmula. A V1 deve reproduzi-lo no motor para compatibilidade; a UI pode omitir pre?o final enquanto peso/bruto ainda estiverem vazios, mas isso ? regra de interface, n?o mudan?a da f?rmula.

### 5.2 Futuro (n?o implementar agora)

A configura??o deve reservar o campo `metodo_arredondamento` com o valor:

- `ARREDONDAMENTO_DA_PLANILHA` (?nico habilitado na V1)

Valores futuros ficam apenas como extens?o prevista, sem UI operacional e sem c?digo de c?lculo na V1.

## 6. Ouro do dia

`ouro_do_dia` ? armazenado e exibido.

N?o aparece em nenhuma f?rmula desta especifica??o.

## 7. Ordem do c?lculo

```text
1. Ler par?metros (?ndices, verniz, modo, arredondamento)
2. Ler entradas da pe?a
3. fator = fator_percentual / 100
4. Para e em 1..6: custo_banho[e] = indice_banho[e] ? peso
5. custo_banho_peca = custo_banho[milesimo]
6. custo_verniz = indice_verniz ? peso
7. custo_total = bruto + banho + verniz + extras
8. preco_venda = custo_total ? (fator + 1)   // ambos os modos na V1
9. preco_final = arredondar(preco_venda)     // s? m?todo da planilha na V1
```

Ouro do dia n?o entra em nenhum passo.

## 8. O que a aplica??o melhora sem mudar a matem?tica

| Planilha | Aplica??o |
|---|---|
| Um peso em `C18` para todas as linhas | Peso da pe?a atual |
| `G2=C11`, `G3=C12`, ? | Lookup `indice_banho[milesimo] ? peso` |
| Seis linhas do mesmo c?digo 334 | Uma pe?a por c?lculo |
| `H5=0` em um exemplo | Verniz sempre pela f?rmula, salvo o usu?rio zerar o ?ndice |
| Fator 5 / 5,5 / 6 nos exemplos | Padr?o 300%, edit?vel |
| Ouro do dia vis?vel e sem f?rmula | Igual: vis?vel, sem f?rmula |
