# Roadmap do AngularJS Easy Components

Este arquivo e o checklist permanente do projeto. A cada etapa concluida, os itens devem ser marcados aqui e os testes correspondentes precisam continuar passando.

## Progresso geral

- [x] Fase 1 — API declarativa `v0.2`
- [x] Fase 2 — CLI, gerador e registro automatico `v0.3`
- [x] Fase 3 — inteligencia semantica no VS Code `v0.4`
- [x] Fase 4 — build e desempenho de producao `v0.5`
- [x] Fase 5 — estabilidade e distribuicao `v1.0`
- [ ] Fase 6 — migracao de `old_componentes` para o modelo declarativo

## Fase 1 — API declarativa `v0.2`

- [x] Criar `defineComponent(nome, definicao)` independente do modulo AngularJS.
- [x] Aceitar nomes legiveis em kebab-case e converte-los para AngularJS.
- [x] Criar `createApp({ name, dependencies, components })`.
- [x] Registrar componentes novos e funcoes legadas na mesma aplicacao.
- [x] Montar a aplicacao automaticamente, no DOM pronto e uma unica vez.
- [x] Adicionar helpers `text`, `number`, `boolean`, `object`, `array`, `event` e `required`.
- [x] Adicionar injecao declarativa por alias com `inject`.
- [x] Migrar um componente real da demonstracao para comprovar a nova API.
- [x] Atualizar navegacao da extensao para `defineComponent` e a nova API.
- [x] Manter compatibilidade com `app`, `use`, `component` e funcoes `register...`.
- [x] Validar com testes unitarios, bundle e navegador real.

## Fase 2 — CLI, gerador e registro automatico `v0.3`

- [x] Criar o comando `easy-components create <nome>`.
- [x] Gerar `.component.js`, `.html`, `.css` e teste no mesmo diretorio.
- [x] Gerar ou atualizar um catalogo central de componentes.
- [x] Permitir registro automatico pelo catalogo sem listar imports manualmente.
- [x] Atualizar `html-custom-data.json` a partir das props declaradas.
- [x] Adicionar modo `check` para detectar nomes, arquivos e props inconsistentes.
- [x] Documentar migracao gradual de projetos AngularJS existentes.

## Fase 3 — inteligencia semantica no VS Code `v0.4`

- [x] Autocompletar tags e props diretamente de `defineComponent`.
- [x] Ir da tag HTML para o JavaScript e do JavaScript para HTML/CSS.
- [x] Autocompletar membros de `vm` em templates.
- [x] Diagnosticar props ausentes, desconhecidas ou com binding incorreto.
- [x] Renomear componente e prop de forma segura entre os arquivos.
- [x] Exibir hover com tipo, binding e obrigatoriedade.

## Fase 4 — build e desempenho de producao `v0.5`

- [x] Entregar configuracao de build reutilizavel, minificada e com sourcemaps.
- [x] Incorporar templates e estilos ao bundle para eliminar requests em runtime.
- [x] Agrupar atualizacoes de estado para reduzir ciclos de digest redundantes.
- [x] Medir watchers, tempo de montagem, destruicao e heap por componente.
- [x] Definir orcamentos de bundle e desempenho com falha automatica no CI.
- [x] Comparar o custo da camada com componentes AngularJS nativos.

## Fase 5 — estabilidade e distribuicao `v1.0`

- [x] Isolar CSS por estrategia documentada e compativel com AngularJS.
- [x] Garantir funcionamento com CSP sem `unsafe-eval` adicional.
- [x] Criar harness oficial para testes unitarios de componentes.
- [x] Cobrir acessibilidade e destruicao de recursos nos componentes de exemplo.
- [x] Preparar pacote npm, extensao VSIX, changelog e guia de atualizacao.
- [x] Definir suporte de navegadores, versionamento semantico e politica de manutencao.

## Publicacao externa

- [ ] Publicar no npm quando houver autorizacao e acesso a conta.
- [ ] Publicar no VS Code Marketplace quando houver autorizacao e acesso ao publisher.

Essas duas operacoes nao alteram o codigo da `v1.0`; os artefatos locais ficam em `release/`.

## Fase 6 — migracao dos componentes legados Bootstrap 3

- [x] Inventariar os arquivos e separar componentes, servicos e duplicatas.
- [x] Definir o mapa entre as APIs antigas e os novos componentes.
- [x] Converter os componentes visuais para `defineComponent`, com HTML e CSS separados.
- [x] Criar adaptadores para os servicos que ainda dependem da aplicacao antiga.
- [x] Criar demonstracao Bootstrap 3 e testes de comportamento, build e memoria.
- [x] Documentar a troca gradual e os pontos que exigem integracao com o backend.
- [x] Inventariar por AST a API publica antiga e gerar a linha de base de paridade.
- [x] Criar motor de compatibilidade importavel com os 21 factories originais.
- [x] Criar `gc-legacy-host` para usar os motores antigos por uma tag declarativa.
- [ ] Portar e testar recursos avancados de `TabelaJS`: agrupamento, totalizadores, scroll incremental, exportacao e impressao.
- [ ] Portar regras especializadas de consulta, arquivos, importacao, historico e fluxo operacional com casos reais do backend.
- [ ] Configurar e validar os comandos reais de impressora, balanca e RFID no ambiente do GCWeb.
- [ ] Migrar uma tela real consumidora e remover nela os factories antigos.

## Criterio para considerar o plano concluido

A `v1.0` deve permitir criar, importar, navegar, testar, empacotar e diagnosticar um componente sem repetir infraestrutura AngularJS, preservando interoperabilidade com componentes nativos e projetos legados.
