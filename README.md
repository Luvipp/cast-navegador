# Cast Navegador — protótipo

Um receptor experimental para deixar aberto no navegador do PS4 e controlar pelo navegador do celular usando um código de seis dígitos.

## Rodar no computador

Requer Node.js 18 ou superior.

```bash
npm install
npm start
```

Abra `http://localhost:3000/?mode=screen` no dispositivo receptor e `http://IP-DO-COMPUTADOR:3000/?mode=remote` no celular. Para o teste na mesma rede Wi-Fi, ambos precisam alcançar o computador. Para uso pela internet, publique o servidor em uma hospedagem que suporte Node.js e WebSockets; HTTPS/WSS é recomendado.

## Limitações importantes

- Isto é um protótipo, não um serviço já hospedado publicamente.
- O PS4 precisa conseguir abrir o endereço do servidor e estabelecer WebSocket.
- O receptor tenta tocar o link enviado em um elemento HTML5 `<video>`. Links diretos públicos de MP4 são a melhor aposta; HLS e outros formatos dependem do navegador/servidor.
- Links de páginas como YouTube, Netflix e outros serviços protegidos por DRM não são convertidos em vídeo e podem não funcionar.
- Teste a compatibilidade no navegador real do PS4 antes de contar com ele.
