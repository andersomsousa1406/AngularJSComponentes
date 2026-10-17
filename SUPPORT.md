# Suporte e compatibilidade

## Runtime

- AngularJS: 1.5 ate 1.8.x.
- Navegadores validados: Chrome e Edge atuais.
- Firefox ESR e Safari atuais: suporte esperado pelas APIs usadas, com validacao recomendada no projeto consumidor.
- Internet Explorer nao faz parte da matriz da versao 1.x.

## Ferramentas

- Node.js 18 ou superior.
- VS Code 1.80 ou superior para a extensao.
- Python 3 e Chrome/Edge sao necessarios apenas para executar o benchmark integrado deste repositorio.

## Versionamento

O projeto segue SemVer:

- patch: correcoes compativeis;
- minor: recursos novos compativeis;
- major: mudancas que exigem migracao.

APIs legadas documentadas permanecem compativeis durante toda a serie 1.x. Deprecacoes devem aparecer no changelog antes de uma remocao em versao major.

## Manutencao

Correcoes de seguranca e regressao tem prioridade. Uma alteracao de runtime deve manter os testes unitarios, CSP, acessibilidade, memoria, orcamento de bundle e comparacao com AngularJS nativo aprovados.
