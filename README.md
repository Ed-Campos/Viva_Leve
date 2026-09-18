# Leve — Diário de Emagrecimento

App simples e offline para acompanhar peso, água, refeições/calorias e hábitos
diários (incluindo treino). Feito em HTML/CSS/JS puro, sem dependências,
salvando tudo localmente no navegador (localStorage).

## Estrutura
- `index.html` — estrutura e estilos
- `app.js` — toda a lógica do app
- `manifest.json` — configuração do PWA (nome, ícone, cores)
- `sw.js` — service worker (cache offline)
- `icons/` — ícones do app
- `vercel.json` — configuração mínima do Vercel

## Deploy no Vercel

**Pelo site (mais fácil):**
1. Crie conta em https://vercel.com
2. **Add New → Project**
3. Suba esta pasta (ou conecte a um repositório Git contendo estes arquivos)
4. Não precisa configurar nada — é site estático puro
5. **Deploy**

**Pela linha de comando:**
```
npm i -g vercel
cd leve-vercel
vercel login
vercel --prod
```

## Depois do deploy
- Abra a URL no celular.
- **Android (Chrome)**: banner de instalação aparece sozinho, ou toque em
  "Instalar" dentro do app (tela inicial ou Ajustes ⚙).
- **iPhone (Safari)**: toque em Compartilhar (□↑) → "Adicionar à Tela de
  Início". O app te guia com esse passo a passo também.
- Funciona 100% offline depois da primeira visita.
- Os dados ficam salvos só naquele aparelho/navegador — não há servidor
  nem sincronização entre aparelhos. Use "Exportar backup" em Ajustes de
  vez em quando para não perder o histórico.

## Importante
As metas de peso, água e calorias são definidas por você dentro do app.
O aplicativo não recomenda nem calcula metas — para números seguros e
adequados ao seu caso, o ideal é buscar orientação de um nutricionista
ou médico.
