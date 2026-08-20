# Requisitos da V1

## Objetivo

Permitir que o usu?rio informe os dados de uma pe?a e receba imediatamente o custo e o pre?o de venda, com a mesma matem?tica da planilha no modo padr?o.

## Personas e contexto

Uso principal: opera??o no celular, depois de pesar a pe?a.

Uso secund?rio: mesmo fluxo no navegador desktop.

## Requisitos funcionais

### RF-01 ? Calculadora de uma pe?a

O sistema calcula uma pe?a por vez.

N?o h? cadastro de produtos, lista de estoque nem hist?rico obrigat?rio na V1.

### RF-02 ? Entradas da opera??o

Na tela principal, o usu?rio informa:

- mil?simo/espessura (1 a 6)
- peso bruto (gramas)
- pre?o do produto bruto
- fator de venda (pr?-preenchido com o padr?o, edit?vel)
- custos adicionais necess?rios (tag, certificado, saquinho, sacola, caixinha)

### RF-03 ? Peso por pe?a

Cada c?lculo usa somente o peso informado naquela opera??o.

? proibido reutilizar um peso global compartilhado entre pe?as, como a c?lula `C18` da planilha.

### RF-04 ? Banho din?mico

Ao informar o peso, o sistema calcula:

```text
custo_banho(espessura) = ?ndice_banho[espessura] ? peso_da_pe?a
```

para as seis espessuras.

A espessura selecionada define qual desses custos entra no c?lculo da pe?a.

? proibido amarrar linhas a c?lulas fixas (`G2=C11`, `G3=C12`, etc.).

### RF-05 ? Verniz

```text
custo_verniz = ?ndice_verniz ? peso_da_pe?a
```

O ?ndice ? configur?vel.

O custo do verniz entra no custo total da pe?a.

A c?lula `H5=0` da planilha n?o ? regra de neg?cio.

### RF-06 ? Custos adicionais

Os campos abaixo s?o edit?veis por opera??o e tamb?m t?m valor padr?o em Configura??es:

- Tag
- Certificado de garantia
- Saquinho pl?stico
- Sacola para presente
- Caixinha

N?o s?o constantes de neg?cio.

### RF-07 ? Fator de venda

Valor inicial/padr?o: **300%**.

O usu?rio pode alterar livremente na opera??o e o padr?o em Configura??es.

Interpreta??o oficial:

| Percentual | Fator | Multiplicador |
|---|---|---|
| 100% | 1 | custo ? 2 |
| 200% | 2 | custo ? 3 |
| 300% | 3 | custo ? 4 |

### RF-08 ? Sa?das imediatas

A calculadora exibe:

- custo do banho (da espessura selecionada)
- custo do verniz
- custos adicionais
- custo total
- pre?o de venda
- pre?o final

### RF-09 ? Dois modos de precifica??o

Somente:

- **A) Regra da Planilha** (padr?o da aplica??o)
- **B) Regra Matem?tica**

N?o existe terceiro modo.

A escolha fica em Configura??es, n?o na opera??o di?ria.

### RF-10 ? Arredondamento V1

?nico m?todo implementado: **Arredondamento da Planilha**.

A arquitetura deve prever outros m?todos no futuro, sem implement?-los na V1.

### RF-11 ? Ouro do dia

Existe, ? edit?vel, fica em Configura??es.

N?o participa de c?lculos e n?o gera ?ndices de banho.

### RF-12 ? Configura??es

?rea separada da calculadora, para par?metros que n?o s?o a opera??o do dia.

Ver [05-telas-v1.md](05-telas-v1.md).

### RF-13 ? Contrato futuro da c?mera

A V1 n?o implementa c?mera.

A arquitetura deve aceitar, no futuro, o preenchimento autom?tico de:

- mil?simo/espessura
- peso bruto
- pre?o do produto bruto

A c?mera n?o calcula pre?o.

## Requisitos n?o funcionais

| ID | Requisito |
|---|---|
| RNF-01 | Mobile-first; utiliz?vel com uma m?o sempre que poss?vel |
| RNF-02 | Funcionar tamb?m em navegador desktop |
| RNF-03 | Tela principal extremamente simples; avan?ado contra?do |
| RNF-04 | Resultado vis?vel imediatamente ap?s informar os dados |
| RNF-05 | Regra da Planilha deve ser test?vel contra valores da planilha original |
| RNF-06 | Motor de c?lculo isolado da interface, para valida??o sem UI |
| RNF-07 | Sem backend obrigat?rio na V1 |
| RNF-08 | Persist?ncia local das configura??es |

## Fora de escopo da V1

- Cadastro complexo de produtos
- SKU, estoque, pedidos, clientes, financeiro
- Implementa??o da c?mera/OCR
- Novos m?todos de arredondamento
- Terceiro modo de precifica??o
- Alterar a planilha original
- Sincroniza??o em nuvem (n?o necess?ria para a calculadora V1)

## Crit?rios de aceite da V1

1. Dado peso e mil?simo, o custo de banho ? `?ndice ? peso`.
2. O verniz ? `?ndice_verniz ? peso` e entra no total.
3. O custo total soma bruto, banho, verniz e os cinco custos adicionais.
4. No modo Regra da Planilha, `pre?o_venda = custo_total ? (fator + 1)`.
5. O pre?o final V1 usa `CEILING(pre?o_venda / 10; 1) ? 10 ? 0,10`.
6. Fator padr?o 300% produz multiplicador 4.
7. Trocar o mil?simo troca o custo de banho sem reeditar o peso.
8. Trocar o peso recalcula banho e verniz da pe?a atual.
9. Ouro do dia pode ser editado sem mudar nenhum resultado.
10. Os casos de teste de [06-validacao-excel.md](06-validacao-excel.md) passam no motor de c?lculo.
