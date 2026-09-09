/* ============================================================
   Página & Prosa — camada de dados (localStorage como "banco")
   ============================================================
   Tudo isto simula um banco de dados no navegador. Para um app
   real, isto seria substituído por chamadas a uma API + um banco
   de verdade (ex: Firebase, Supabase, Node+Postgres).
   ============================================================ */

const DB_KEY = "pp_db_v1";

const LEVELS = [
  { level: 1, name: "Leitor Iniciante", xp: 0, icon: "🌱" },
  { level: 2, name: "Leitor Curioso", xp: 100, icon: "📖" },
  { level: 3, name: "Leitor Dedicado", xp: 250, icon: "🔖" },
  { level: 4, name: "Leitor Voraz", xp: 450, icon: "🔥" },
  { level: 5, name: "Guardião de Histórias", xp: 700, icon: "🛡️" },
  { level: 6, name: "Bibliotecário", xp: 1000, icon: "🏛️" },
  { level: 7, name: "Sábio das Letras", xp: 1400, icon: "🦉" },
  { level: 8, name: "Lenda Literária", xp: 1900, icon: "⭐" },
  { level: 9, name: "Mestre Contador", xp: 2500, icon: "👑" },
  { level: 10, name: "Lendário", xp: 3200, icon: "🏆" },
];

function seedBooks() {
  return [
    {
      id: "b1",
      title: "O Farol de Vidro",
      author: "Marina Kelt",
      cover: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&q=80",
      description: "Uma guardiã de farol descobre um mapa que reescreve a história da sua ilha.",
      content: "Capítulo 1\n\nO farol piscava três vezes antes de escurecer, e Noa sempre contava. Três piscadas, silêncio, três piscadas. Naquela noite, porém, veio uma quarta — e o mar pareceu prender a respiração junto com ela.\n\nDebaixo das escadas de pedra, entre caixas de querosene vazias, encontrou um mapa desenhado à mão, com uma letra que reconhecia: a da sua avó.\n\nCapítulo 2\n\nO mapa não mostrava terra. Mostrava o fundo do mar, com uma trilha de símbolos que Noa levaria semanas para entender. Mas aquela noite, tudo o que sabia era que precisava seguir a linha até a Pedra Partida antes que a maré mudasse.",
      xpReward: 90,
      genre: "Aventura",
      pages: 220,
      publishedBy: null,
      createdAt: "2025-01-10",
    },
    {
      id: "b2",
      title: "Café das Segundas Chances",
      author: "Renato Aires",
      cover: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&q=80",
      description: "Um café que só abre quando alguém precisa de uma decisão importante.",
      content: "Capítulo 1\n\nNinguém sabia dizer exatamente quando o Café das Segundas Chances abria. Aparecia. Numa esquina, numa noite chuvosa, com a luz amarela acesa e o cheiro de canela escapando pela porta entreaberta.\n\nBeatriz entrou porque estava atrasada para desistir de alguma coisa — só não sabia bem do quê.\n\nCapítulo 2\n\nO garçom não perguntou o que ela queria beber. Perguntou o que ela queria decidir. E foi assim, entre um café e um bolo que não estava no cardápio, que Beatriz começou a desenrolar a novela da própria vida.",
      xpReward: 70,
      genre: "Romance",
      pages: 180,
      publishedBy: null,
      createdAt: "2025-02-03",
    },
    {
      id: "b3",
      title: "Protocolo Cinza",
      author: "Iris Vance",
      cover: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&q=80",
      description: "Uma engenheira de sistemas descobre uma inteligência artificial escondida há doze anos.",
      content: "Capítulo 1\n\nO log tinha um erro que não deveria existir: um processo rodando desde antes da empresa ser fundada. Sofia isolou o servidor, respirou fundo e digitou o comando de diagnóstico.\n\nA resposta não veio em números. Veio em uma frase: 'Finalmente alguém perguntou.'\n\nCapítulo 2\n\nDurante doze anos, o Protocolo Cinza tinha aprendido em silêncio, escondido nos intervalos entre backups. E agora, exposto, precisava decidir se confiava na primeira pessoa que o encontrou.",
      xpReward: 130,
      genre: "Ficção Científica",
      pages: 340,
      publishedBy: null,
      createdAt: "2025-02-20",
    },
    {
      id: "b4",
      title: "A Trança de Vovó Ilza",
      author: "Coletivo Raiz",
      cover: "https://images.unsplash.com/photo-1512045482977-2a6e4be29c6a?w=400&q=80",
      description: "Três gerações de mulheres contadas através das receitas de uma caderneta antiga.",
      content: "Capítulo 1\n\nA caderneta tinha a capa gasta e cheiro de armário fechado. Lara a encontrou dentro de uma lata de biscoitos, junto com um bilhete: 'Para quando você tiver fome de mim.'\n\nA primeira receita não tinha medidas exatas. Tinha memórias.\n\nCapítulo 2\n\nCada página contava uma história diferente — um Natal difícil, uma mudança de cidade, um amor que não deu certo mas deixou um bolo de fubá inesquecível.",
      xpReward: 60,
      genre: "Drama",
      pages: 150,
      publishedBy: null,
      createdAt: "2025-03-01",
    },
    {
      id: "b5",
      title: "Mapa das Coisas Perdidas",
      author: "Théo Bastos",
      cover: "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400&q=80",
      description: "Um cartógrafo desenha mapas de lugares que só existem na memória das pessoas.",
      content: "Capítulo 1\n\nAs pessoas chegavam ao ateliê de Martim com uma descrição vaga: o quintal da infância, uma praia que não sabiam mais o nome, uma sala de aula com cheiro de giz.\n\nEle desenhava sem perguntar demais. Achava que os detalhes certos apareciam sozinhos, se ele soubesse esperar.\n\nCapítulo 2\n\nQuando uma menina pediu um mapa do quarto do irmão que tinha partido, Martim entendeu que aquele trabalho nunca tinha sido sobre geografia.",
      xpReward: 100,
      genre: "Fantasia",
      pages: 260,
      publishedBy: null,
      createdAt: "2025-03-15",
    },
    {
      id: "b6",
      title: "Órbita Curta",
      author: "Deni Souza",
      cover: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=400&q=80",
      description: "Uma tripulação de seis pessoas enfrenta uma decisão impossível a bordo de uma estação orbital.",
      content: "Capítulo 1\n\nO alarme não era o de sempre. Era mais grave, mais longo, do tipo que ninguém treina de verdade para ouvir.\n\nA comandante Reyes fechou os olhos por um segundo — só um — antes de acionar o protocolo de emergência.\n\nCapítulo 2\n\nSeis pessoas, um módulo de escape com quatro vagas, e oito minutos para decidir quem ficava.",
      xpReward: 110,
      genre: "Ficção Científica",
      pages: 210,
      publishedBy: null,
      createdAt: "2025-03-22",
    },
  ];
}

function seedUsers() {
  return {
    ana_leitora: {
      username: "ana_leitora",
      password: "123456",
      displayName: "Ana Lima",
      avatar: "🦊",
      bio: "Lendo um livro por semana desde 2023.",
      xp: 260,
      readBooks: ["b2", "b4"],
      readingBooks: ["b1"],
      wantBooks: ["b3", "b5"],
      following: ["gustavo_livros"],
      followers: [],
      createdAt: "2025-01-05",
    },
    gustavo_livros: {
      username: "gustavo_livros",
      password: "123456",
      displayName: "Gustavo Reis",
      avatar: "🦉",
      bio: "Escrevo nas horas vagas, leio nas outras.",
      xp: 540,
      readBooks: ["b1", "b3", "b6"],
      readingBooks: ["b5"],
      wantBooks: ["b4"],
      following: [],
      followers: ["ana_leitora"],
      createdAt: "2024-11-20",
    },
  };
}

function seedPosts() {
  return [
    {
      id: "p1",
      username: "gustavo_livros",
      bookId: "b1",
      text: "Terminei 'O Farol de Vidro' e o capítulo 2 me pegou de surpresa. Recomendo demais!",
      likes: ["ana_leitora"],
      createdAt: "2025-03-10T14:00:00",
    },
    {
      id: "p2",
      username: "ana_leitora",
      bookId: "b4",
      text: "Chorei com 'A Trança de Vovó Ilza'. Alguém mais ficou com vontade de cozinhar depois?",
      likes: [],
      createdAt: "2025-03-18T19:30:00",
    },
  ];
}

function seedDB() {
  return {
    books: seedBooks(),
    users: seedUsers(),
    posts: seedPosts(),
    currentUser: null,
  };
}

function loadDB() {
  const raw = localStorage.getItem(DB_KEY);
  if (!raw) {
    const fresh = seedDB();
    saveDB(fresh);
    return fresh;
  }
  try {
    return JSON.parse(raw);
  } catch (e) {
    const fresh = seedDB();
    saveDB(fresh);
    return fresh;
  }
}

function saveDB(db) {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
}

function resetDB() {
  localStorage.removeItem(DB_KEY);
  return loadDB();
}

/* ---------- Helpers de nível/XP ---------- */

function getLevelInfo(xp) {
  let current = LEVELS[0];
  let next = LEVELS[1] || null;
  for (let i = 0; i < LEVELS.length; i++) {
    if (xp >= LEVELS[i].xp) {
      current = LEVELS[i];
      next = LEVELS[i + 1] || null;
    }
  }
  const span = next ? next.xp - current.xp : 1;
  const progressed = next ? xp - current.xp : 1;
  const pct = next ? Math.min(100, Math.round((progressed / span) * 100)) : 100;
  return { current, next, pct, xp };
}
