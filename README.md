# Página & Prosa — Biblioteca Virtual com Recompensas

Projeto de faculdade: uma biblioteca virtual gamificada em HTML, CSS e JavaScript puro.

## Como abrir
Basta abrir o arquivo `index.html` em qualquer navegador (duplo clique, ou clique com o botão direito → "Abrir com" → navegador). Não precisa de servidor nem de instalar nada.

## Login de teste
- Usuário: `ana_leitora` | senha: `123456`
- Usuário: `gustavo_livros` | senha: `123456`

Ou clique em "Criar conta" para gerar seu próprio usuário.

## O "banco de dados"
Como é um projeto 100% front-end (sem back-end), os dados ficam salvos no **localStorage** do navegador — ou seja, funcionam como um banco de dados real: persistem entre acessos, mas apenas *nesse* navegador/computador. Os arquivos:

- `db.js` — define as "tabelas" (livros, usuários, publicações), os dados iniciais (seed) e as funções de leitura/gravação (`loadDB`, `saveDB`).
- `app.js` — todas as regras do app: login/cadastro, marcar livros como lidos/lendo/quero ler, ganhar XP e subir de nível, seguir usuários, publicar livros e posts, curtir.
- `style.css` — toda a identidade visual.

Se quiser "zerar" os dados de teste, abra o console do navegador (F12) e rode `resetDB()`.

## Funcionalidades implementadas
- Cadastro e login de usuário (com avatar escolhido)
- Biblioteca com busca e filtro por gênero
- Página de leitura de cada livro, com sinopse e conteúdo
- Botões para marcar um livro como **Quero ler / Lendo / Lido**
- Sistema de **XP e 10 níveis**, com um "caminho de recompensas" visual no perfil
- Publicar seus próprios livros na biblioteca
- Perfil com prateleiras de livros lidos / lendo / quero ler
- Seguir outros perfis, feed de publicações da comunidade e curtidas

## Próximos passos sugeridos (para a versão em app)
Quando quiserem migrar para um app de verdade, a estrutura em `db.js` (funções `loadDB`/`saveDB`) já está isolada — é só trocar essas duas funções por chamadas a uma API real (ex: Firebase, Supabase ou um back-end em Node/Express + banco de dados), sem precisar reescrever `app.js` inteiro.
