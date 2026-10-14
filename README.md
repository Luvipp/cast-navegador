# Cast Navegador Media Center 2.0

Media center web com receptor para o navegador do PS4 e controle pelo celular.

## Recursos
- Receptor de TV com código de pareamento.
- Controle remoto pelo celular.
- Histórico e favoritos salvos localmente no navegador do celular.
- Diagnóstico básico de links MP4, HLS e páginas web.
- Atalhos para avançar/voltar 10 segundos, play/pause e volume.
- Layout responsivo para celular e tela grande.

## Executar
```bash
npm install
npm start
```

O servidor usa `PORT` do ambiente quando definido (como no Render). Os arquivos `index.html`, `server.js` e `package.json` ficam na raiz do repositório para facilitar uploads pelo celular.

## Uso
- Receptor do PS4: `/?mode=screen`
- Controle do celular: `/?mode=remote`

A reprodução depende do formato e da compatibilidade do navegador. O projeto não extrai automaticamente vídeo de qualquer site nem contorna DRM, login ou outras proteções.
