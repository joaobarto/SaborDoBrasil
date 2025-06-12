let usuario = JSON.parse(localStorage.getItem('usuario'));
window.onload = iniciar;

function iniciar(){
  atualizarUI();
  carregarPublicacoesGlobais();
  document.getElementById('btnNovaPub').onclick = adicionarPublicacao;
}

function atualizarUI(){
  usuario = JSON.parse(localStorage.getItem('usuario'));
  const authArea = document.getElementById('auth-area');
  const perfilContent = document.getElementById('perfil-content');
  const loginArea = document.getElementById('login-area');
  const logoutBtn = document.getElementById('btnLogout');

  if(usuario){
    authArea.style.display = 'none';
    perfilContent.style.display = '';
    loginArea.style.display = 'none';
    logoutBtn.style.display = '';
    document.getElementById('nomeUsuario').innerText = usuario.nickname;
    fetch(`/api/usuario/${usuario.id}/interacoes`)
      .then(r=>r.json()).then(data=>{
        document.getElementById('totalLikes').innerText = data.likes;
        document.getElementById('totalDislikes').innerText = data.dislikes;
      });
    carregarPublicacoesUsuario();
  } else {
    authArea.style.display = '';
    perfilContent.style.display = 'none';
    loginArea.style.display = '';
    logoutBtn.style.display = 'none';
    document.getElementById('nomeUsuario').innerText = 'Sabor do Brasil';
    document.getElementById('totalLikes').innerText = '0';
    document.getElementById('totalDislikes').innerText = '0';
  }
}

function logout(){
  localStorage.removeItem('usuario');
  iniciar();
}

async function logarUsuario(){
  const email = document.getElementById('usuarioInput').value;
  const senha = document.getElementById('senhaInput').value;
  const resp = await fetch('/api/usuario/login', {
    method:'POST', headers:{'Content-Type':'application/json'},
    body:JSON.stringify({email,senha})
  });
  if(resp.ok){
    usuario = await resp.json();
    localStorage.setItem('usuario', JSON.stringify(usuario));
    iniciar();
    bootstrap.Modal.getInstance(document.getElementById('loginModal')).hide();
  } else {
    alert('Login inválido!');
  }
}

async function cadastrarUsuario(){
  const nome = document.getElementById('cadastroUsuario').value;
  const email = document.getElementById('cadastroEmail').value;
  const senha = document.getElementById('cadastroSenha').value;
  const resp = await fetch('/api/usuario/cadastrar',{
    method:'POST', headers:{'Content-Type':'application/json'},
    body:JSON.stringify({nome,email,senha,nickname:nome})
  });
  if(resp.ok){
    alert('Cadastro realizado!');
    bootstrap.Modal.getInstance(document.getElementById('cadastroModal')).hide();
    logarUsuario();
  } else if(resp.status===409){
    alert('E-mail já cadastrado!');
  } else {
    alert('Erro no cadastro!');
  }
}

async function carregarPublicacoesGlobais(){
  const resp = await fetch('/api/publicacoes');
  const pubs = await resp.json();
  document.getElementById('publicacoesGlobais').innerHTML = pubs.map(pub=>`
    <div class="card mb-3">
      <img src="${pub.foto}" class="card-img-top">
      <div class="card-body">
        <h5 class="card-title">${pub.nome_prato}</h5>
        <p class="card-text">${pub.local} - ${pub.cidade}</p>
        <p><small>por ${pub.nickname}</small></p>
      </div>
    </div>
  `).join('');
}

async function carregarPublicacoesUsuario(){
  const resp = await fetch(`/api/publicacoes?usuario_id=${usuario.id}`);
  const pubs = await resp.json();
  document.getElementById('publicacoesUsuario').innerHTML = pubs.map(pub=>`
    <div class="card mb-3">
      <img src="${pub.foto}" class="card-img-top">
      <div class="card-body">
        <h5 class="card-title">${pub.nome_prato}</h5>
        <p class="card-text">${pub.local} - ${pub.cidade}</p>
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
