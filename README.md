# Estante de Leitura

Biblioteca pessoal de PDFs e EPUBs: leitor no navegador, página atual salva,
trechos destacados e organização por autor, tema e status. Funciona no notebook
e no celular, com tudo sincronizado pela sua conta no Supabase.

Site estático (HTML, CSS e JS puros, sem build). Os dados ficam no Supabase:

| O quê | Onde |
| --- | --- |
| Arquivos PDF/EPUB | Supabase Storage, bucket privado `books` |
| Livros, progresso e trechos | Tabela `items` no Postgres do Supabase |
| Login | Supabase Auth (e-mail e senha) |
| Cache para abrir rápido | IndexedDB do navegador de cada aparelho |

## 1. Preparar o Supabase (uma vez)

1. **Banco e armazenamento:** abra o projeto no Supabase → **SQL Editor** → *New query*,
   cole todo o conteúdo de `supabase/schema.sql` e clique em **Run**.
2. **Endereço do site para o login:** em **Authentication → URL Configuration**:
   - *Site URL*: o endereço que a Vercel der ao site (ex.: `https://estante.vercel.app`).
   - *Redirect URLs*: adicione o mesmo endereço e também `http://localhost:3000` para testes.
3. **Confirmação de e-mail (opcional):** em **Authentication → Sign In / Providers → Email**,
   desligue *Confirm email* se quiser entrar logo após criar a conta, sem clicar em link.
4. **Tamanho máximo por arquivo:** em **Storage → Settings**, o limite global por arquivo
   do plano gratuito é 50 MB. Livros maiores que isso não são enviados.

## 2. Publicar na Vercel

1. Em [vercel.com](https://vercel.com) → **Add New → Project** → importe este repositório.
2. *Framework Preset*: **Other**. Deixe *Build Command* e *Output Directory* vazios.
3. **Deploy.** Depois, volte ao passo 1.2 e coloque o endereço final como *Site URL*.

Cada `git push` na branch principal publica uma nova versão automaticamente.

## Testar no computador

```bash
npx serve -l 3000 .
```

Abra `http://localhost:3000`.

## Configuração

A URL do projeto e a chave *publishable* ficam em `config.js`. Essa chave é feita para
ficar no navegador; a proteção dos dados vem das regras de acesso (RLS) do `schema.sql`,
que permitem a cada conta ver e alterar apenas os próprios livros e trechos.
Nunca coloque a chave *secret* (`sb_secret_…`) neste projeto.

## Estrutura

```
index.html          estrutura da página
styles.css          visual (claro/escuro, notebook/celular)
app.js              estante, leitor de PDF (pdf.js) e EPUB (epub.js), sincronização
config.js           URL e chave pública do Supabase
supabase/schema.sql tabela, regras de acesso, tempo real e bucket
vercel.json         cabeçalhos e cache na Vercel
```
