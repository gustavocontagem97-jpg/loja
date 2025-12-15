// ===== DADOS DOS PRODUTOS =====
let produtos = JSON.parse(localStorage.getItem('produtos')) || [];

// ===== TEXTO DE DESTAQUES =====
const destaques = ["Itens em Promoção", "Descontos Especiais", "Achados do Dia"];
let indexDestaque = 0;

setInterval(() => {
  document.getElementById("destaque-texto").textContent = destaques[indexDestaque];
  indexDestaque = (indexDestaque + 1) % destaques.length;
}, 3000);

// ===== RENDERIZA PRODUTOS =====
function renderProdutos(categoria = "Todos") {
  const container = document.getElementById("produtos");
  if (!container) return;

  container.innerHTML = "";

  produtos
    .filter(p => categoria === "Todos" || p.categoria === categoria)
    .forEach(p => {
      container.innerHTML += `
        <div class="produto">
          <img src="${p.imagem}">
          <h3>${p.nome}</h3>
          <p><strong>${p.categoria}</strong></p>
          <p class="preco">${p.preco}</p>
          <a href="${p.link}" target="_blank">Comprar Agora</a>
        </div>
      `;
    });
}

renderProdutos();

// ===== FILTRO DE CATEGORIA =====
function filtrarCategoria(cat) {
  const container = document.getElementById("produtos");
  container.classList.add("fade-out");

  setTimeout(() => {
    renderProdutos(cat);
    container.classList.remove("fade-out");
  }, 400);
}

// ===== LOGIN ADMIN =====
function login() {
  const user = document.getElementById("username").value;
  const pass = document.getElementById("password").value;

  if (user === "Kaka" && pass === "Kakashi1") {
    document.getElementById("login-container").classList.add("hidden");
    document.getElementById("admin-panel").classList.remove("hidden");
    renderListaAdmin();
  } else {
    document.getElementById("login-error").textContent = "Usuário ou senha incorretos!";
  }
}

// ===== LISTA ADMIN =====
function renderListaAdmin() {
  const lista = document.getElementById("lista-produtos");
  lista.innerHTML = "";

  produtos.forEach((p, i) => {
    lista.innerHTML += `
      <li>${p.nome} - ${p.preco} (${p.categoria})
      <button onclick="removerProduto(${i})">Remover</button></li>
    `;
  });
}

// ===== CADASTRO DE PRODUTO =====
document.getElementById("produto-form")?.addEventListener("submit", function (e) {
  e.preventDefault();

  const nome = document.getElementById("produto-nome").value;
  const link = document.getElementById("produto-link").value;
  const imagem = document.getElementById("produto-imagem").value;
  const preco = document.getElementById("produto-preco").value;
  const categoria = document.getElementById("produto-categoria").value;

  produtos.push({ nome, link, imagem, preco, categoria });
  localStorage.setItem("produtos", JSON.stringify(produtos));

  renderProdutos();
  renderListaAdmin();
  this.reset();
});

// ===== REMOVER PRODUTO =====
function removerProduto(index) {
  produtos.splice(index, 1);
  localStorage.setItem("produtos", JSON.stringify(produtos));
  renderProdutos();
  renderListaAdmin();
}

// ===== MODO CELULAR =====
document.getElementById("toggle-mode")?.addEventListener("click", () => {
  document.body.classList.toggle("modo-celular");
  document.getElementById("toggle-mode").textContent =
    document.body.classList.contains("modo-celular")
      ? "Modo Computador"
      : "Modo Celular";
});
