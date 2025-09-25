document.addEventListener('DOMContentLoaded', function() {
  carregarDadosPerfil();
});

function carregarDadosPerfil() {
  // Obter dados do funcionário logado do localStorage
  const userData = JSON.parse(localStorage.getItem('usuarioLogado'));
  
  if (!userData) {
    // Se não houver usuário logado, redirecionar para a página de login
    window.location.href = '../html/login.html';
    return;
  }
  
  // Preencher os campos do perfil com os dados do funcionário
  document.getElementById('nome').value = userData.nmFuncionario;
  document.getElementById('email').value = userData.dsEmail;
  document.getElementById('senha').value = userData.dsSenha;
  
  // Armazenar o ID para uso na atualização
  document.getElementById('funcionarioId').value = userData.id;
}

function habilitarEdicao() {
  document.querySelectorAll(".input-edit").forEach(input => input.removeAttribute("disabled"));
  document.getElementById("btnSalvar").style.display = "inline-block";
  document.getElementById("btnEditar").style.display = "none";
}

function salvarEdicao() {
  const idFuncionario = document.getElementById('funcionarioId').value;
  const nome = document.getElementById('nome').value;
  const email = document.getElementById('email').value;
  const senha = document.getElementById('senha').value;
  
  if (!nome || !email || !senha) {
    alert("Todos os campos são obrigatórios!");
    return;
  }
  
  const funcionarioData = {
    nmFuncionario: nome,
    dsEmail: email,
    dsSenha: senha
  };
  
  fetch(`http://localhost:8081/funcionario/${idFuncionario}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(funcionarioData)
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Erro ao atualizar dados');
    }
    return response.json();
  })
  .then(data => {
    // Atualizar os dados no localStorage
    localStorage.setItem('usuarioLogado', JSON.stringify(data));
    
    // Desabilitar edição
    document.querySelectorAll(".input-edit").forEach(input => input.setAttribute("disabled", true));
    document.getElementById("btnSalvar").style.display = "none";
    document.getElementById("btnEditar").style.display = "inline-block";
    
    alert("Dados atualizados com sucesso!");
  })
  .catch(error => {
    console.error('Erro:', error);
    alert("Erro ao atualizar dados: " + error.message);
  });
}