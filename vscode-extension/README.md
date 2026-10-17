# AngularJS Easy Components para VS Code

Adiciona **Ir para Definicao** para tags HTML declaradas com a API moderna:

```js
export default EasyComponents.defineComponent('value-display', { ... });
```

e tambem para componentes registrados pela API compativel:

```js
app.component('valueDisplay', { ... });
```

Em um template, use `Ctrl+clique` ou `F12` sobre `<value-display>` para abrir a declaracao JavaScript.

A mesma navegacao funciona no JavaScript para a API do plugin, incluindo `EasyComponents.createApp`, `EasyComponents.defineComponent`, helpers de props, `app.register`, `app.component`, `app.mount`, `$setState` e `$emit`.

A partir da versao 0.7, a extensao cria um indice diretamente dos arquivos `*.component.js` e oferece:

- autocomplete de tags e props sem manter uma lista manual;
- tipo, binding e obrigatoriedade no hover;
- autocomplete dos membros `vm` no template do componente;
- diagnosticos para props desconhecidas, obrigatorias ausentes e bindings incorretos;
- renomeacao de tags e props entre a declaracao JavaScript e os templates HTML;
- navegacao entre tag, declaracao, template e CSS.

Dentro de um `*.component.js`, a extensao tambem navega entre a funcao `register...` e seu import no app, abre os imports de HTML/CSS incorporados no bundle e continua reconhecendo `templateUrl`/`styleUrl` em projetos sem build.

A extensao procura por padrao em `**/*.component.{js,ts,mjs}`. O glob pode ser alterado em `easyComponents.navigation.filePattern` nas configuracoes do VS Code. Depois de instalar ou atualizar a pasta local, execute **Developer: Reload Window**.
