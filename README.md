# Precificador de Semijoias

Site: https://cosmevianna-spec.github.io/Precificador-semijoias-app/

Calculadora de precifica??o de semijoias, otimizada para celular e navegador.

O objetivo ? substituir o uso manual da planilha com **rapidez, precis?o e facilidade**.

## Status

V1 implementada: motor de c?lculo, testes e interface web.

A planilha original em `documentos/PLANILHA DE PRECIFICA??O.xlsx` ? a fonte de verdade da matem?tica. Ela **n?o deve ser alterada** e **n?o ? publicada** neste reposit?rio.

## Como executar

Requisitos: Node.js 20+.

```bash
npm install
npm test
npm run dev
```

O Vite imprime um endere?o local, em geral `http://localhost:5173`.

Abra esse endere?o no navegador do computador ou, no mesmo Wi-Fi, o endere?o de rede (Network) no celular.

Para gerar a vers?o de produ??o:

```bash
npm run build
npm run preview
```

## Documenta??o oficial

| Documento | Conte?do |
|---|---|
| [docs/01-visao-do-projeto.md](docs/01-visao-do-projeto.md) | Vis?o, escopo e regras fundamentais |
| [docs/02-requisitos-v1.md](docs/02-requisitos-v1.md) | Requisitos da V1 |
| [docs/03-logica-de-calculo.md](docs/03-logica-de-calculo.md) | Especifica??o da l?gica de c?lculo |
| [docs/04-arquitetura.md](docs/04-arquitetura.md) | Arquitetura conceitual |
| [docs/05-telas-v1.md](docs/05-telas-v1.md) | Telas, campos da calculadora e configura??es |
| [docs/06-validacao-excel.md](docs/06-validacao-excel.md) | Compatibilidade com o Excel e testes |

## Fora da V1

- Cadastro complexo de produtos
- Estoque
- ERP
- C?mera/OCR (h? apenas o contrato `aplicarEntradaCamera` / `preencherDaCamera`)
- Novos m?todos de arredondamento al?m do da planilha
