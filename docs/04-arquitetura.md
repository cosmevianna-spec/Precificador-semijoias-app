# Arquitetura conceitual da V1

Arquitetura de produto, ainda sem c?digo.

## Princ?pio

O motor de c?lculo deve ser test?vel contra a planilha **sem depender da tela**.

A interface s? coleta entradas e mostra sa?das. A c?mera futura s? preenche entradas.

```text
[C?mera futura] --preenche--> [Calculadora UI] --entrada--> [Motor de c?lculo]
                                      ^                            |
                                      |                            v
                              [Configura??es] <------------ [Resultado]
```

## Decis?o: V1 sem servidor

A V1 n?o tem cadastro, estoque nem ERP. N?o h? motivo para backend obrigat?rio.

Proposta:

- aplica??o web (PWA), mobile-first
- c?lculo 100% no cliente
- configura??es salvas no dispositivo
- planilha original permanece arquivo morto de refer?ncia, fora do runtime

Isso reduz tempo de entrega e permite validar a matem?tica antes de qualquer infraestrutura.

## M?dulos conceituais

### 1. Motor de c?lculo

M?dulo puro.

Entrada: pe?a + par?metros + modo + m?todo de arredondamento.

Sa?da: custos intermedi?rios, custo total, pre?o de venda, pre?o final, e os seis custos de banho.

Regras:

- nenhuma leitura de DOM
- nenhuma leitura de c?mera
- nenhuma formata??o de moeda al?m da aritm?tica especificada
- ouro do dia n?o ? par?metro de f?rmula

Este m?dulo ? o ?nico lugar das f?rmulas da [l?gica de c?lculo](03-logica-de-calculo.md).

### 2. Par?metros / configura??es

Armazena o que n?o ? a opera??o do dia:

- ?ndices 1 a 6
- ?ndice do verniz
- custos padr?o
- fator padr?o
- ouro do dia
- modo de precifica??o
- m?todo de arredondamento

A calculadora inicia cada opera??o copiando os custos padr?o e o fator padr?o para campos edit?veis da pe?a. Alterar a pe?a **n?o** grava de volta nas configura??es, a menos que o usu?rio edite Configura??es.

### 3. Estado da opera??o (calculadora)

Estado vol?til de uma pe?a:

- mil?simo, peso, pre?o bruto
- fator da opera??o
- custos da opera??o
- resultado derivado do motor

N?o ? um cadastro.

### 4. Interface

Duas telas na V1:

1. Calculadora
2. Configura??es

Detalhadas em [05-telas-v1.md](05-telas-v1.md).

### 5. Adaptador de c?mera (contrato, n?o implementa??o)

Interface futura, por exemplo:

```text
CameraInput {
  milesimo: 1..6
  peso: number
  preco_bruto: number
}
```

O adaptador escreve nesses tr?s campos da calculadora e dispara o mesmo motor.

Proibido:

- calcular banho na c?mera
- aplicar fator na c?mera
- arredondar na c?mera
- ler ?ndices na c?mera

## Separa??o modo ? arredondamento

Dois eixos independentes:

```text
modo_precificacao:        REGRA_DA_PLANILHA | REGRA_MATEMATICA
metodo_arredondamento:    ARREDONDAMENTO_DA_PLANILHA | (futuros)
```

Na V1:

- os dois modos usam a mesma f?rmula de `preco_venda` (decis?o confirmada)
- s? existe um m?todo de arredondamento

A implementa??o deve manter os eixos separados mesmo assim, para n?o misturar markup com `CEILING`.

## Persist?ncia

| Dado | Onde | Quando grava |
|---|---|---|
| Configura??es | armazenamento local do dispositivo | ao salvar Configura??es |
| Pe?a atual | mem?ria da sess?o | a cada edi??o na calculadora |
| Planilha .xlsx | pasta `documentos/` | nunca pelo app |

N?o persistir um hist?rico de pe?as na V1 (fora de escopo).

## Garantia de compatibilidade com o Excel

1. O motor replica as f?rmulas da spec, n?o ?reinterpreta? margem.
2. Casos de teste em [06-validacao-excel.md](06-validacao-excel.md) usam valores reais da planilha.
3. Comparar `custo_total`, `preco_venda` e `preco_final` com as colunas `N`, `P` e `Q`.
4. Toler?ncia num?rica pequena (ex.: 0,0001) para ponto flutuante; o pre?o final exibido em reais usa 2 casas, mas o teste do motor compara o valor da f?rmula.
5. Documentar a diverg?ncia intencional da linha 5 do Excel (`H5=0`).

## Stack sugerida (n?o fechada)

Sugest?o para quando a implementa??o for autorizada, n?o um requisito de neg?cio:

- PWA web ?nica (celular e desktop)
- motor de c?lculo em fun??es puras, cobertas por testes
- UI simples, uma coluna no mobile

A escolha exata de framework fica para o momento da implementa??o.

## O que n?o entra na arquitetura da V1

- banco de dados de produtos
- usu?rios/perfis (pode ser uso local ?nico)
- API de cota??o de ouro
- OCR
- m?ltiplos m?todos de arredondamento implementados
