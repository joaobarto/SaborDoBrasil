let usuario = JSON.parse(localStorage.getItem('usuarioLogado'));
window.onload = iniciar;

function iniciar(){
  atualizarUI();
  carregarPublicacoesGlobais();
  document.getElementById('btnNovaPub').onclick = adicionarPublicacao;
}

function atualizarUI(){
  usuario = JSON.parse(localStorage.getItem('usuarioLogado'));
  const authArea = document.getElementById('auth-area');
  const perfilContent = document.getElementById('perfil-content');
  const loginArea = document.getElementById('login-area');
  const logoutBtn = document.getElementById('btnLogout');
  const imagemPerfil = document.getElementById('imagemPerfil');
  const nomeUsuario = document.getElementById('nomeUsuario');

  if(usuario){
    authArea.style.display = 'none';
    perfilContent.style.display = '';
    loginArea.style.display = 'none';
    logoutBtn.style.display = '';
    nomeUsuario.innerText = usuario.nome;
    if(usuario.foto){
      imagemPerfil.src = usuario.foto;
    } else {
      imagemPerfil.src = "img/logo_sabor_do_brasil.png";
    }
    // Atualiza likes e dislikes (simulação)
    document.getElementById('totalLikes').innerText = usuario.likes || 0;
    document.getElementById('totalDislikes').innerText = usuario.dislikes || 0;
    carregarPublicacoesUsuario();
  } else {
    authArea.style.display = '';
    perfilContent.style.display = 'none';
    loginArea.style.display = '';
    logoutBtn.style.display = 'none';
    nomeUsuario.innerText = 'Sabor do Brasil';
    imagemPerfil.src = "img/logo_sabor_do_brasil.png";
    document.getElementById('totalLikes').innerText = '0';
    document.getElementById('totalDislikes').innerText = '0';
  }
}

function logout(){
  localStorage.removeItem('usuario');
  iniciar();
}

function cadastrarUsuario() {
  const nome = document.getElementById('cadastroUsuario').value.trim();
  const email = document.getElementById('cadastroEmail').value.trim();
  const senha = document.getElementById('cadastroSenha').value.trim();
  const fotoInput = document.getElementById('cadastroFoto');
  const file = fotoInput.files[0];

  if (!nome || !email || !senha) {
    alert('Preencha todos os campos!');
    return;
  }

  let usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
  if (usuarios.find(u => u.email === email)) {
    alert('E-mail já cadastrado!');
    return;
  }

  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      const fotoBase64 = e.target.result;
      salvarUsuario({ nome, email, senha, foto: fotoBase64 });
    };
    reader.readAsDataURL(file);
  } else {
    salvarUsuario({ nome, email, senha, foto: null });
  }
}

function salvarUsuario(novoUsuario) {
  let usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
  usuarios.push(novoUsuario);
  localStorage.setItem('usuarios', JSON.stringify(usuarios));
  localStorage.setItem('usuarioLogado', JSON.stringify(novoUsuario));
  alert('Cadastro realizado com sucesso!');
  atualizarUI();
  // Fecha o modal de cadastro
  const cadastroModal = bootstrap.Modal.getInstance(document.getElementById('cadastroModal'));
  if (cadastroModal) cadastroModal.hide();
}

function logarUsuario() {
  const email = document.getElementById('usuarioInput').value.trim();
  const senha = document.getElementById('senhaInput').value.trim();

  let usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
  const usuario = usuarios.find(u => u.email === email && u.senha === senha);

  if (!usuario) {
    alert('E-mail ou senha incorretos!');
    return;
  }

  localStorage.setItem('usuarioLogado', JSON.stringify(usuario));
  alert('Login realizado com sucesso!');
  atualizarUI();
  // Fecha o modal de login
  const loginModal = bootstrap.Modal.getInstance(document.getElementById('loginModal'));
  if (loginModal) loginModal.hide();
}

async function carregarPublicacoesGlobais(){
  const resp = await fetch('/api/publicacoes');
  const pubs = await resp.json();
  const usuario = JSON.parse(localStorage.getItem('usuario'));
  document.getElementById('publicacoesGlobais').innerHTML = pubs.map(pub=>`
    <div class="card mb-3">
      <div class="card-body pb-0">
        <h5 class="card-title">${pub.nome_prato}</h5>
      </div>
      <img src="${pub.foto}" class="card-img-top">
      <div class="card-body pt-2 pb-0">
        <div class="d-flex justify-content-end">
          <span class="fw-bold small">${pub.local} - ${pub.cidade}</span>
        </div>
      </div>
      <div class="card-body pt-2">
        <p><small>por ${pub.nickname}</small></p>
        ${
          usuario ? `
          <div class="d-flex gap-2 justify-content-center mt-2">
            <button class="btn btn-outline-success btn-sm d-flex align-items-center" onclick="curtirPublicacao(${pub.id})">
              <img src="img/like.png" alt="Curtir" style="width:20px;height:20px;">
              <span class="ms-1" id="likeCount-${pub.id}">${pub.likes || 0}</span>
            </button>
            <button class="btn btn-outline-danger btn-sm d-flex align-items-center" onclick="discurtirPublicacao(${pub.id})">
              <img src="img/dislike.png" alt="Não Curtir" style="width:20px;height:20px;">
              <span class="ms-1" id="dislikeCount-${pub.id}">${pub.dislikes || 0}</span>
            </button>
          </div>
          ` : ''
        }
      </div>
    </div>
  `).join('');
}

async function carregarPublicacoesUsuario(){
  const resp = await fetch(`/api/publicacoes?usuario_id=${usuario.id}`);
  const pubs = await resp.json();
  document.getElementById('publicacoesUsuario').innerHTML = pubs.map(pub=>`
    <div class="card mb-3">
      <div class="card-body pb-0">
        <h5 class="card-title">${pub.nome_prato}</h5>
      </div>
      <img src="${pub.foto}" class="card-img-top">
      <div class="card-body pt-2 pb-0">
        <div class="d-flex justify-content-end">
          <span class="fw-bold small">${pub.local} - ${pub.cidade}</span>
        </div>
      </div>
      <div class="card-body pt-2">
      </div>
    </div>
  `).join('');
}

async function adicionarPublicacao(){
  const nome_prato=prompt("Nome do prato:");
  const local=prompt("Local:");
  const cidade=prompt("Cidade:");
  const foto=prompt("Arquivo da foto:");
  if(!nome_prato||!local||!cidade||!foto) return;
  await fetch('/api/publicacoes',{
    method:'POST',headers:{'Content-Type':'application/json'},
    body:JSON.stringify({nome_prato,local,cidade,foto:`img/${foto}`,usuario_id:usuario.id})
  });
  carregarPublicacoesUsuario();
}

function renderizarPublicacoes() {
  const container = document.getElementById('publicacoesGlobais');
  container.innerHTML = '';
  publicacoes.forEach(pub => {
    container.innerHTML += `
      <div class="card mb-3">
        <div class="card-body">
          <h5 class="card-title">${pub.titulo}</h5>
          ${pub.imagem ? `<img src="${pub.imagem}" alt="${pub.titulo}" class="img-fluid mb-2">` : ''}
          <p class="card-text">${pub.conteudo}</p>
          <div class="d-flex align-items-center gap-3 mt-2">
            <button class="btn btn-outline-success btn-sm" onclick="curtirPublicacao(${pub.id})">
              👍 <span id="likeCount-${pub.id}">${pub.likes}</span>
            </button>
            <button class="btn btn-outline-danger btn-sm" onclick="discurtirPublicacao(${pub.id})">
              👎 <span id="dislikeCount-${pub.id}">${pub.dislikes}</span>
            </button>
          </div>
        </div>
      </div>
    `;
  });
}
