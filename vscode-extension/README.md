# AngularJS Easy Components Navigation

Adiciona **Ir para Definicao** para tags HTML registradas com:

```js
app.component('valueDisplay', { ... });
```

Em um template, use `Ctrl+clique` ou `F12` sobre `<value-display>` para abrir a declaracao JavaScript.

A mesma navegacao funciona no JavaScript para a API do plugin, incluindo `app.register`, `app.component`, `app.mount`, `EasyComponents.use`, `EasyComponents.app`, `$setState` e `$emit`.

Dentro de um `*.component.js`, a extensao tambem navega entre a funcao `register...` e seu import no app, abre os imports de HTML/CSS incorporados no bundle e continua reconhecendo `templateUrl`/`styleUrl` em projetos sem build.

A extensao procura por padrao em `**/*.component.{js,ts,mjs}`. O glob pode ser alterado em `easyComponents.navigation.filePattern` nas configuracoes do VS Code.
