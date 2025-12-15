/* ---------- UTILIDADES ---------- */
const LS_PREFIX = 'garimpos_v1_';
function lsGet(key, fallback){ try { const v = localStorage.getItem(LS_PREFIX + key); return v ? JSON.parse(v) : fallback; } catch(e){ return fallback; } }
function lsSet(key, value){ localStorage.setItem(LS_PREFIX + key, JSON.stringify(value)); }

/* ---------- TEMA (claro / escuro) - usa atributo no <body> ---------- */
(function themeInit(){
  // suporta botões com ids diferentes nas páginas
  const btns = Array.from(document.querySelectorAll('#toggle-theme, #themeToggle')).filter(Boolean);
  // ler tema salvo (fallback 'light')
  const saved = lsGet('theme', 'light');
  document.body.setAttribute('data-theme', saved);
  btns.forEach(btn=>{
    btn.textContent = saved === 'dark' ? '☀️' : '🌙';
    btn.addEventListener('click', ()=>{
      const current = document.body.getAttribute('data-theme') || 'light';
      const next = current === 'dark' ? 'light' : 'dark';
      document.body.setAttribute('data-theme', next);
      lsSet('theme', next);
      btns.forEach(b=>b.textContent = next === 'dark' ? '☀️' : '🌙');
    });
  });
})();

/* ---------- MODO CELULAR (simulado) ---------- */
(function modeInit(){
  const btn = document.getElementById('toggle-mode');
  const saved = lsGet('modoCelular', false);
  if(saved) document.body.classList.add('modo-celular');
  if(btn){
    const updateText = () => { btn.textContent = document.body.classList.contains('modo-celular') ? '🖥️ Modo PC' : '📱 Modo Celular'; };
    updateText();
    btn.addEventListener('click', ()=>{
      document.body.classList.toggle('modo-celular');
      const ativo = document.body.classList.contains('modo-celular');
      lsSet('modoCelular', ativo);
      updateText();
    });
  }
})();

/* ---------- CARROSSEL DE PROMOÇÕES ---------- */
let carouselIndex = 0; let carouselTimer = null;
function renderCarousel(){
  const container = document.getElementById('carousel-container');
  const dots = document.getElementById('carousel-dots');
  if(!container || !dots) return;
  const promos = lsGet('promocoes', null) || [
    {titulo:'Promoção 1', imagem:'https://via.placeholder.com/1200x350?text=Promo+1', link:'#'},
    {titulo:'Promoção 2', imagem:'https://via.placeholder.com/1200x350?text=Promo+2', link:'#'},
    {titulo:'Promoção 3', imagem:'https://via.placeholder.com/1200x350?text=Promo+3', link:'#'}
  ];

  container.innerHTML = '';
  dots.innerHTML = '';

  promos.forEach((p,i)=>{
    const item = document.createElement('div');
    item.className = 'carousel-item';
    item.innerHTML = `<a href="${p.link||'#'}" target="_blank" rel="noopener noreferrer"><img src="${p.imagem}" alt="${p.titulo}"></a><div class="carousel-caption"><h3>${p.titulo}</h3></div>`;
    container.appendChild(item);

    const dot = document.createElement('button');
    dot.className = 'carousel-dot';
    dot.setAttribute('aria-label', `Ir para promoção ${i+1}`);
    dot.addEventListener('click', ()=>{ goToSlide(i); resetAutoPlay(); });
    dots.appendChild(dot);
  });

  updateCarousel();
}
function updateCarousel(){
  const container = document.getElementById('carousel-container');
  const dots = document.querySelectorAll('.carousel-dot');
  if(!container) return;
  const slides = container.children.length;
  if(slides === 0) return;
  if(carouselIndex >= slides) carouselIndex = 0;
  if(carouselIndex < 0) carouselIndex = slides - 1;
  container.style.transform = `translateX(-${carouselIndex*100}%)`;
  dots.forEach((d,i)=> d.classList.toggle('active', i === carouselIndex));
}
function goToSlide(i){ carouselIndex = i; updateCarousel(); }
function nextSlide(){ carouselIndex++; updateCarousel(); }
function resetAutoPlay(){ clearInterval(carouselTimer); carouselTimer = setInterval(nextSlide, 4000); }

/* ---------- PROMOÇÕES - ADMIN ---------- */
function carregarPromocoesAdmin(){
  const lista = document.getElementById('lista-promocoes');
  if(!lista) return;
  const promos = lsGet('promocoes', []);
  lista.innerHTML = '';
  promos.forEach((p, idx)=>{
    const li = document.createElement('li');
    li.innerHTML = `<div><strong>${p.titulo}</strong><br/><small>${p.link||''}</small></div>
      <div style="display:flex;gap:6px">
        <button onclick="editarPromocao(${idx})">Editar</button>
        <button onclick="removerPromocao(${idx})" class="small-ghost">Remover</button>
      </div>`;
    lista.appendChild(li);
  });
}
function adicionarPromocao(){
  const titulo = document.getElementById('promo-titulo').value.trim();
  const imagem = document.getElementById('promo-imagem').value.trim();
  const link = document.getElementById('promo-link').value.trim();
  if(!titulo || !imagem){ alert('Preencha título e imagem'); return; }
  const promos = lsGet('promocoes', []);
  promos.push({titulo, imagem, link});
  lsSet('promocoes', promos);
  carregarPromocoesAdmin(); renderCarousel(); resetAutoPlay();
  document.getElementById('promo-titulo').value=''; document.getElementById('promo-imagem').value=''; document.getElementById('promo-link').value='';
}
function editarPromocao(idx){
  const promos = lsGet('promocoes', []);
  const p = promos[idx];
  if(!p) return;
  document.getElementById('promo-titulo').value = p.titulo;
  document.getElementById('promo-imagem').value = p.imagem;
  document.getElementById('promo-link').value = p.link || '';
  promos.splice(idx,1);
  lsSet('promocoes', promos);
  carregarPromocoesAdmin();
}
function removerPromocao(idx){
  if(!confirm('Remover promoção?')) return;
  const promos = lsGet('promocoes', []);
  promos.splice(idx,1);
  lsSet('promocoes', promos);
  carregarPromocoesAdmin(); renderCarousel();
}

/* ---------- LOGIN / ADMIN PANEL (simples) ---------- */
function login(){
  const user = document.getElementById('username')?.value.trim();
  const pass = document.getElementById('password')?.value.trim();
  const stored = lsGet('admin_login', {user:'admin', pass:'1234'});
  if(user === stored.user && pass === stored.pass){
    document.getElementById('login-container')?.classList.add('hidden');
    document.getElementById('admin-panel')?.classList.remove('hidden');
    carregarAdmins(); carregarPromocoesAdmin();
    renderProdutos();
  } else {
    const err = document.getElementById('login-error');
    if(err){ err.textContent = 'Usuário ou senha incorretos'; setTimeout(()=>err.textContent='',2500); }
  }
}
function carregarAdmins(){
  const lista = document.getElementById('lista-admins');
  if(!lista) return;
  const admins = lsGet('admins', ['admin']);
  lista.innerHTML = '';
  admins.forEach((a,i)=>{
    const li = document.createElement('li');
    li.innerHTML = `${a} <button onclick="removerAdmin(${i})" class="small-ghost">Remover</button>`;
    lista.appendChild(li);
  });
}
function removerAdmin(i){
  const admins = lsGet('admins', []);
  admins.splice(i,1);
  lsSet('admins', admins);
  carregarAdmins();
}
document.getElementById('admin-form')?.addEventListener('submit',(e)=>{
  e.preventDefault();
  const nome = document.getElementById('adm-nome').value.trim();
  const senha = document.getElementById('adm-senha').value.trim();
  if(!nome||!senha) return alert('Preencha nome e senha');
  const admins = lsGet('admins', []);
  admins.push(nome);
  lsSet('admins', admins);
  carregarAdmins();
  document.getElementById('adm-nome').value=''; document.getElementById('adm-senha').value='';
});
function atualizarLogin(){
  const novo = document.getElementById('novo-usuario').value.trim();
  const nova = document.getElementById('nova-senha').value.trim();
  if(!novo || !nova) return alert('Preencha novo usuário e nova senha');
  lsSet('admin_login', {user:novo, pass:nova});
  const msg = document.getElementById('atualizar-msg');
  if(msg){ msg.textContent = 'Login atualizado com sucesso'; setTimeout(()=>msg.textContent='',2500); }
}
function logout(){ location.href='index.html'; }

/* ---------- PRODUTOS (básico, localStorage) ---------- */
(function produtosInit(){
  const form = document.getElementById('produto-form');
  if(form){
    form.addEventListener('submit', (e)=>{ e.preventDefault(); adicionarProduto(); });
  }
})();
function adicionarProduto(){
  const nome = document.getElementById('produto-nome').value.trim();
  const link = document.getElementById('produto-link').value.trim();
  const imagem = document.getElementById('produto-imagem').value.trim();
  const preco = document.getElementById('produto-preco').value.trim();
  const categoria = document.getElementById('produto-categoria').value;
  if(!nome||!link) return alert('Nome e link obrigatórios');
  const produtos = lsGet('produtos', []);
  produtos.push({nome,link,imagem,preco,categoria});
  lsSet('produtos', produtos);
  limparFormProduto();
  renderProdutos();
}
function limparFormProduto(){ ['produto-nome','produto-link','produto-imagem','produto-preco'].forEach(id=>{ const el=document.getElementById(id); if(el) el.value=''; }); }
function renderProdutos(){
  const container = document.getElementById('produtos');
  if(!container) return;
  const produtos = lsGet('produtos', []);
  container.innerHTML = produtos.map(p=>`
    <article class="produto">
      <img src="${p.imagem||'https://via.placeholder.com/400x300?text=Sem+imagem'}" alt="${p.nome}">
      <h3>${p.nome}</h3>
      <div class="preco">${p.preco||''}</div>
      <a href="${p.link}" target="_blank" rel="noopener noreferrer">Ver</a>
    </article>
  `).join('');
}

/* ---------- Inicialização geral ---------- */
window.addEventListener('load', ()=>{
  renderProdutos();
  renderCarousel();
  carregarPromocoesAdmin();
  carregarAdmins();
  resetAutoPlay();
});
