/* ============================================================
   Página & Prosa — app.js
   Router simples baseado em hash + funções de renderização.
   ============================================================ */

let db = loadDB();

const root = document.getElementById("app-root");

/* ---------------- Utilidades ---------------- */

function currentUser() {
  return db.currentUser ? db.users[db.currentUser] : null;
}

function findBook(id) {
  return db.books.find((b) => b.id === id);
}

function fmtDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function toast(msg) {
  const el = document.createElement("div");
  el.className = "toast";
  el.textContent = msg;
  document.body.appendChild(el);
  requestAnimationFrame(() => el.classList.add("show"));
  setTimeout(() => {
    el.classList.remove("show");
    setTimeout(() => el.remove(), 300);
  }, 2200);
}

function go(hash) {
  window.location.hash = hash;
}

/* ---------------- Autenticação ---------------- */

function handleLogin(e) {
  e.preventDefault();
  const username = document.getElementById("login-user").value.trim();
  const password = document.getElementById("login-pass").value;
  const user = db.users[username];
  if (!user || user.password !== password) {
    document.getElementById("auth-error").textContent = "Usuário ou senha incorretos.";
    return;
  }
  db.currentUser = username;
  saveDB(db);
  render();
}

function handleRegister(e) {
  e.preventDefault();
  const username = document.getElementById("reg-user").value.trim().toLowerCase().replace(/\s+/g, "_");
  const displayName = document.getElementById("reg-name").value.trim();
  const password = document.getElementById("reg-pass").value;
  const avatarPick = document.querySelector('input[name="avatar"]:checked');
  const errEl = document.getElementById("auth-error");

  if (!username || !displayName || password.length < 4) {
    errEl.textContent = "Preencha nome, usuário e uma senha com 4+ caracteres.";
    return;
  }
  if (db.users[username]) {
    errEl.textContent = "Esse nome de usuário já existe. Escolha outro.";
    return;
  }
  db.users[username] = {
    username,
    password,
    displayName,
    avatar: avatarPick ? avatarPick.value : "📚",
    bio: "",
    xp: 0,
    readBooks: [],
    readingBooks: [],
    wantBooks: [],
    following: [],
    followers: [],
    createdAt: new Date().toISOString(),
  };
  db.currentUser = username;
  saveDB(db);
  render();
}

function logout() {
  db.currentUser = null;
  saveDB(db);
  go("#/login");
  render();
}

/* ---------------- Ações de leitura / XP ---------------- */

function setStatus(bookId, status) {
  const u = currentUser();
  if (!u) return;
  u.readBooks = u.readBooks.filter((id) => id !== bookId);
  u.readingBooks = u.readingBooks.filter((id) => id !== bookId);
  u.wantBooks = u.wantBooks.filter((id) => id !== bookId);
  if (status === "reading") u.readingBooks.push(bookId);
  if (status === "want") u.wantBooks.push(bookId);
  saveDB(db);
  render();
}

function finishBook(bookId) {
  const u = currentUser();
  const book = findBook(bookId);
  if (!u || !book) return;
  const already = u.readBooks.includes(bookId);
  u.readingBooks = u.readingBooks.filter((id) => id !== bookId);
  u.wantBooks = u.wantBooks.filter((id) => id !== bookId);
  if (!already) {
    u.readBooks.push(bookId);
    const before = getLevelInfo(u.xp).current.level;
    u.xp += book.xpReward;
    const after = getLevelInfo(u.xp).current.level;
    saveDB(db);
    if (after > before) {
      toast(`🎉 Nível ${after} desbloqueado: ${getLevelInfo(u.xp).current.name}!`);
    } else {
      toast(`+${book.xpReward} XP por terminar "${book.title}"`);
    }
  }
  saveDB(db);
  render();
}

/* ---------------- Ações sociais ---------------- */

function toggleFollow(username) {
  const u = currentUser();
  if (!u || u.username === username) return;
  const target = db.users[username];
  if (!target) return;
  const isFollowing = u.following.includes(username);
  if (isFollowing) {
    u.following = u.following.filter((n) => n !== username);
    target.followers = target.followers.filter((n) => n !== u.username);
  } else {
    u.following.push(username);
    target.followers.push(u.username);
  }
  saveDB(db);
  render();
}

function createPost(e) {
  e.preventDefault();
  const u = currentUser();
  const textEl = document.getElementById("post-text");
  const bookSel = document.getElementById("post-book");
  const text = textEl.value.trim();
  if (!text) return;
  db.posts.unshift({
    id: "p" + Date.now(),
    username: u.username,
    bookId: bookSel.value || null,
    text,
    likes: [],
    createdAt: new Date().toISOString(),
  });
  saveDB(db);
  textEl.value = "";
  render();
}

function toggleLike(postId) {
  const u = currentUser();
  const post = db.posts.find((p) => p.id === postId);
  if (!u || !post) return;
  if (post.likes.includes(u.username)) {
    post.likes = post.likes.filter((n) => n !== u.username);
  } else {
    post.likes.push(u.username);
  }
  saveDB(db);
  render();
}

/* ---------------- Publicar livro ---------------- */

function handlePublish(e) {
  e.preventDefault();
  const u = currentUser();
  const title = document.getElementById("pub-title").value.trim();
  const cover = document.getElementById("pub-cover").value.trim();
  const description = document.getElementById("pub-desc").value.trim();
  const content = document.getElementById("pub-content").value.trim();
  const genre = document.getElementById("pub-genre").value.trim() || "Geral";
  const errEl = document.getElementById("pub-error");

  if (!title || !description || !content) {
    errEl.textContent = "Preencha pelo menos título, sinopse e conteúdo.";
    return;
  }

  const id = "u" + Date.now();
  db.books.unshift({
    id,
    title,
    author: u.displayName,
    cover: cover || "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400&q=80",
    description,
    content,
    xpReward: Math.max(40, Math.min(150, Math.round(content.length / 20))),
    genre,
    pages: Math.max(1, Math.round(content.length / 1800)),
    publishedBy: u.username,
    createdAt: new Date().toISOString(),
  });
  saveDB(db);
  toast("📗 Livro publicado na biblioteca!");
  go("#/book/" + id);
}

/* ---------------- Componentes ---------------- */

function statusOfBook(u, bookId) {
  if (u.readBooks.includes(bookId)) return "read";
  if (u.readingBooks.includes(bookId)) return "reading";
  if (u.wantBooks.includes(bookId)) return "want";
  return "none";
}

function bookCard(book) {
  const u = currentUser();
  const status = u ? statusOfBook(u, book.id) : "none";
  const badge =
    status === "read" ? '<span class="chip chip-read">Lido</span>' :
    status === "reading" ? '<span class="chip chip-reading">Lendo</span>' :
    status === "want" ? '<span class="chip chip-want">Quero ler</span>' : "";
  return `
    <a class="book-card" href="#/book/${book.id}">
      <div class="book-cover" style="background-image:url('${escapeHtml(book.cover)}')">
        ${badge}
      </div>
      <div class="book-card-info">
        <p class="book-genre">${escapeHtml(book.genre || "Geral")}</p>
        <h3>${escapeHtml(book.title)}</h3>
        <p class="book-author">${escapeHtml(book.author)}</p>
      </div>
    </a>`;
}

function levelPathHTML(xp) {
  const info = getLevelInfo(xp);
  const nodes = LEVELS.map((lvl) => {
    const state = xp >= lvl.xp ? (lvl.level === info.current.level ? "current" : "done") : "locked";
    return `
      <div class="path-node ${state}">
        <div class="path-dot">${lvl.icon}</div>
        <div class="path-label">
          <strong>Nível ${lvl.level}</strong>
          <span>${escapeHtml(lvl.name)}</span>
        </div>
      </div>`;
  }).join('<div class="path-line"></div>');

  const nextText = info.next
    ? `Faltam <strong>${info.next.xp - xp}</strong> XP para "${info.next.name}"`
    : "Você alcançou o nível máximo! 🏆";

  return `
    <div class="level-card">
      <div class="level-headline">
        <div class="level-icon">${info.current.icon}</div>
        <div>
          <p class="level-eyebrow">Nível atual</p>
          <h3>${info.current.level} · ${escapeHtml(info.current.name)}</h3>
          <p class="xp-text">${xp} XP · ${nextText}</p>
        </div>
      </div>
      <div class="xp-bar"><div class="xp-bar-fill" style="width:${info.pct}%"></div></div>
      <div class="path-scroll">
        <div class="path-track">${nodes}</div>
      </div>
    </div>`;
}

function postCard(post) {
  const author = db.users[post.username];
  const book = post.bookId ? findBook(post.bookId) : null;
  const u = currentUser();
  const liked = u && post.likes.includes(u.username);
  return `
    <article class="post-card">
      <div class="post-head">
        <a class="post-avatar" href="#/profile/${author.username}">${author.avatar}</a>
        <div>
          <a class="post-name" href="#/profile/${author.username}">${escapeHtml(author.displayName)}</a>
          <p class="post-date">${fmtDate(post.createdAt)}</p>
        </div>
      </div>
      <p class="post-text">${escapeHtml(post.text)}</p>
      ${book ? `<a class="post-book" href="#/book/${book.id}">📖 ${escapeHtml(book.title)}</a>` : ""}
      <button class="like-btn ${liked ? "liked" : ""}" onclick="toggleLike('${post.id}')">
        ${liked ? "❤️" : "🤍"} <span>${post.likes.length}</span>
      </button>
    </article>`;
}

/* ---------------- Telas ---------------- */

function renderAuth() {
  const showRegister = window.location.hash === "#/register";
  root.innerHTML = `
    <div class="auth-screen">
      <div class="auth-hero">
        <div class="auth-hero-emoji">📚✨</div>
        <h1>Página &amp; Prosa</h1>
        <p>Leia, suba de nível e colecione recompensas a cada história terminada.</p>
      </div>
      <div class="auth-card">
        <div class="auth-tabs">
          <button class="${!showRegister ? "active" : ""}" onclick="go('#/login')">Entrar</button>
          <button class="${showRegister ? "active" : ""}" onclick="go('#/register')">Criar conta</button>
        </div>
        <p id="auth-error" class="auth-error"></p>
        ${showRegister ? registerFormHTML() : loginFormHTML()}
      </div>
    </div>`;
  document.getElementById(showRegister ? "register-form" : "login-form")
    .addEventListener("submit", showRegister ? handleRegister : handleLogin);
}

function loginFormHTML() {
  return `
    <form id="login-form">
      <label>Usuário
        <input id="login-user" type="text" placeholder="ana_leitora" autocomplete="username" required />
      </label>
      <label>Senha
        <input id="login-pass" type="password" placeholder="••••••" autocomplete="current-password" required />
      </label>
      <button class="btn-primary" type="submit">Entrar na biblioteca</button>
      <p class="auth-hint">Dica: usuário <b>ana_leitora</b>, senha <b>123456</b></p>
    </form>`;
}

function registerFormHTML() {
  const avatars = ["📚", "🦊", "🦉", "🐨", "🐙", "🦄"];
  return `
    <form id="register-form">
      <label>Nome de exibição
        <input id="reg-name" type="text" placeholder="Seu nome" required />
      </label>
      <label>Usuário
        <input id="reg-user" type="text" placeholder="apelido_sem_espaco" required />
      </label>
      <label>Senha
        <input id="reg-pass" type="password" placeholder="mínimo 4 caracteres" required />
      </label>
      <fieldset class="avatar-pick">
        <legend>Escolha um avatar</legend>
        ${avatars
          .map(
            (a, i) => `
          <label class="avatar-option">
            <input type="radio" name="avatar" value="${a}" ${i === 0 ? "checked" : ""} />
            <span>${a}</span>
          </label>`
          )
          .join("")}
      </fieldset>
      <button class="btn-primary" type="submit">Criar minha conta</button>
    </form>`;
}

function renderShellWrapper(innerHTML, activeTab) {
  const u = currentUser();
  const info = getLevelInfo(u.xp);
  root.innerHTML = `
    <div class="shell">
      <header class="topbar">
        <a class="brand" href="#/library">📚 Página &amp; Prosa</a>
        <nav class="tabs">
          <a class="${activeTab === "library" ? "active" : ""}" href="#/library">Biblioteca</a>
          <a class="${activeTab === "feed" ? "active" : ""}" href="#/feed">Comunidade</a>
          <a class="${activeTab === "publish" ? "active" : ""}" href="#/publish">Publicar</a>
          <a class="${activeTab === "profile" ? "active" : ""}" href="#/profile/${u.username}">Perfil</a>
        </nav>
        <div class="topbar-right">
          <span class="xp-pill" title="${info.current.name}">${info.current.icon} Nível ${info.current.level}</span>
          <button class="avatar-btn" onclick="go('#/profile/${u.username}')">${u.avatar}</button>
          <button class="logout-btn" onclick="logout()">Sair</button>
        </div>
      </header>
      <main class="content">${innerHTML}</main>
    </div>`;
}

function renderLibrary() {
  const q = (document.getElementById("lib-search")?.value || "").toLowerCase();
  const genre = document.getElementById("lib-genre")?.value || "all";
  let list = db.books;
  if (q) {
    list = list.filter(
      (b) => b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q)
    );
  }
  if (genre !== "all") list = list.filter((b) => (b.genre || "Geral") === genre);

  const genres = ["all", ...new Set(db.books.map((b) => b.genre || "Geral"))];

  const inner = `
    <section class="library-head">
      <div>
        <h1>Explorar a biblioteca</h1>
        <p>${db.books.length} livros disponíveis, incluindo obras publicadas pela comunidade.</p>
      </div>
      <div class="library-controls">
        <input id="lib-search" type="text" placeholder="Buscar por título ou autor..." value="${escapeHtml(q)}" oninput="renderLibrary()" />
        <select id="lib-genre" onchange="renderLibrary()">
          ${genres.map((g) => `<option value="${g}" ${g === genre ? "selected" : ""}>${g === "all" ? "Todos os gêneros" : g}</option>`).join("")}
        </select>
      </div>
    </section>
    <section class="book-grid">
      ${list.length ? list.map(bookCard).join("") : '<p class="empty-state">Nenhum livro encontrado. Tente outra busca.</p>'}
    </section>`;
  renderShellWrapper(inner, "library");
  document.getElementById("lib-search").focus();
  document.getElementById("lib-search").selectionStart = document.getElementById("lib-search").value.length;
}

function renderBook(bookId) {
  const book = findBook(bookId);
  const u = currentUser();
  if (!book) {
    renderShellWrapper('<p class="empty-state">Livro não encontrado.</p>', "library");
    return;
  }
  const status = statusOfBook(u, book.id);
  const inner = `
    <section class="book-detail">
      <div class="book-detail-cover" style="background-image:url('${escapeHtml(book.cover)}')"></div>
      <div class="book-detail-info">
        <p class="book-genre">${escapeHtml(book.genre || "Geral")} · ${book.pages} págs · +${book.xpReward} XP</p>
        <h1>${escapeHtml(book.title)}</h1>
        <p class="book-author">por ${escapeHtml(book.author)}${book.publishedBy ? " · publicado pela comunidade" : ""}</p>
        <p class="book-desc">${escapeHtml(book.description)}</p>
        <div class="status-actions">
          <button class="chip-btn ${status === "want" ? "active" : ""}" onclick="setStatus('${book.id}','want')">🔖 Quero ler</button>
          <button class="chip-btn ${status === "reading" ? "active" : ""}" onclick="setStatus('${book.id}','reading')">📖 Estou lendo</button>
          <button class="chip-btn ${status === "read" ? "active" : ""}" onclick="finishBook('${book.id}')">✅ Marcar como lido</button>
        </div>
      </div>
    </section>
    <section class="reader">
      <h2>Leitura</h2>
      <div class="reader-text">${escapeHtml(book.content).replace(/\n/g, "<br/>")}</div>
      ${status !== "read" ? `<button class="btn-primary" onclick="finishBook('${book.id}')">Terminei este livro (+${book.xpReward} XP)</button>` : `<p class="finished-note">✅ Você já concluiu este livro.</p>`}
    </section>`;
  renderShellWrapper(inner, "library");
}

function renderPublish() {
  const inner = `
    <section class="publish-screen">
      <h1>Publicar um livro</h1>
      <p>Compartilhe sua própria história com a comunidade da biblioteca.</p>
      <p id="pub-error" class="auth-error"></p>
      <form id="publish-form">
        <label>Título
          <input id="pub-title" type="text" placeholder="O nome da sua obra" required />
        </label>
        <label>Gênero
          <input id="pub-genre" type="text" placeholder="Ex: Fantasia, Romance, Terror..." />
        </label>
        <label>Capa (URL de imagem, opcional)
          <input id="pub-cover" type="url" placeholder="https://..." />
        </label>
        <label>Sinopse
          <textarea id="pub-desc" rows="3" placeholder="Um resumo curto e cativante" required></textarea>
        </label>
        <label>Conteúdo
          <textarea id="pub-content" rows="10" placeholder="Escreva ou cole o texto do seu livro aqui" required></textarea>
        </label>
        <button class="btn-primary" type="submit">Publicar na biblioteca</button>
      </form>
    </section>`;
  renderShellWrapper(inner, "publish");
  document.getElementById("publish-form").addEventListener("submit", handlePublish);
}

function renderFeed() {
  const u = currentUser();
  const others = Object.values(db.users).filter((usr) => usr.username !== u.username);
  const inner = `
    <section class="feed-layout">
      <div class="feed-main">
        <h1>Comunidade</h1>
        <form id="post-form" class="post-form">
          <textarea id="post-text" placeholder="O que você está lendo ou achou de um livro?" rows="2"></textarea>
          <div class="post-form-row">
            <select id="post-book">
              <option value="">Sem livro relacionado</option>
              ${db.books.map((b) => `<option value="${b.id}">${escapeHtml(b.title)}</option>`).join("")}
            </select>
            <button class="btn-primary btn-small" type="submit">Publicar</button>
          </div>
        </form>
        <div class="post-list">
          ${db.posts.length ? db.posts.map(postCard).join("") : '<p class="empty-state">Nenhuma publicação ainda.</p>'}
        </div>
      </div>
      <aside class="feed-side">
        <h2>Pessoas para seguir</h2>
        ${others
          .map((o) => {
            const isFollowing = u.following.includes(o.username);
            return `
            <div class="follow-row">
              <a href="#/profile/${o.username}" class="follow-info">
                <span class="follow-avatar">${o.avatar}</span>
                <span>
                  <strong>${escapeHtml(o.displayName)}</strong>
                  <small>${o.followers.length} seguidores</small>
                </span>
              </a>
              <button class="follow-btn ${isFollowing ? "following" : ""}" onclick="toggleFollow('${o.username}')">
                ${isFollowing ? "Seguindo" : "Seguir"}
              </button>
            </div>`;
          })
          .join("")}
      </aside>
    </section>`;
  renderShellWrapper(inner, "feed");
  document.getElementById("post-form").addEventListener("submit", createPost);
}

function renderProfile(username) {
  const viewer = currentUser();
  const profile = db.users[username];
  if (!profile) {
    renderShellWrapper('<p class="empty-state">Perfil não encontrado.</p>', "profile");
    return;
  }
  const isSelf = profile.username === viewer.username;
  const isFollowing = viewer.following.includes(profile.username);
  const myPosts = db.posts.filter((p) => p.username === profile.username);

  const listOf = (ids) => ids.map(findBook).filter(Boolean);

  const inner = `
    <section class="profile-head">
      <div class="profile-avatar-big">${profile.avatar}</div>
      <div class="profile-info">
        <h1>${escapeHtml(profile.displayName)}</h1>
        <p class="profile-username">@${profile.username}</p>
        ${profile.bio ? `<p class="profile-bio">${escapeHtml(profile.bio)}</p>` : ""}
        <div class="profile-stats">
          <span><strong>${profile.readBooks.length}</strong> lidos</span>
          <span><strong>${profile.followers.length}</strong> seguidores</span>
          <span><strong>${profile.following.length}</strong> seguindo</span>
        </div>
      </div>
      ${!isSelf ? `<button class="follow-btn ${isFollowing ? "following" : ""}" onclick="toggleFollow('${profile.username}')">${isFollowing ? "Seguindo" : "Seguir"}</button>` : ""}
    </section>

    ${levelPathHTML(profile.xp)}

    <section class="shelf-tabs">
      <div class="shelf">
        <h3>✅ Lidos <span>${profile.readBooks.length}</span></h3>
        <div class="shelf-row">${listOf(profile.readBooks).map(bookCard).join("") || emptyShelf("Nenhum livro concluído ainda.")}</div>
      </div>
      <div class="shelf">
        <h3>📖 Lendo agora <span>${profile.readingBooks.length}</span></h3>
        <div class="shelf-row">${listOf(profile.readingBooks).map(bookCard).join("") || emptyShelf("Nada em andamento.")}</div>
      </div>
      <div class="shelf">
        <h3>🔖 Quero ler <span>${profile.wantBooks.length}</span></h3>
        <div class="shelf-row">${listOf(profile.wantBooks).map(bookCard).join("") || emptyShelf("Nenhum livro salvo.")}</div>
      </div>
    </section>

    <section class="profile-posts">
      <h3>Publicações</h3>
      ${myPosts.length ? myPosts.map(postCard).join("") : emptyShelf("Ainda não publicou nada.")}
    </section>`;
  renderShellWrapper(inner, "profile");
}

function emptyShelf(msg) {
  return `<p class="empty-state small">${msg}</p>`;
}

/* ---------------- Router ---------------- */

function render() {
  db = loadDB();
  const hash = window.location.hash || "#/login";
  const u = currentUser();

  if (!u) {
    renderAuth();
    return;
  }
  if (hash === "#/login" || hash === "#/register") {
    go("#/library");
    return;
  }

  if (hash.startsWith("#/book/")) {
    renderBook(hash.replace("#/book/", ""));
  } else if (hash === "#/publish") {
    renderPublish();
  } else if (hash === "#/feed") {
    renderFeed();
  } else if (hash.startsWith("#/profile/")) {
    renderProfile(hash.replace("#/profile/", ""));
  } else {
    renderLibrary();
  }
}

window.addEventListener("hashchange", render);
window.addEventListener("DOMContentLoaded", render);
