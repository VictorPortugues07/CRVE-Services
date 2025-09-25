// Verificar se o usuário logado é admin ao carregar a página
document.addEventListener('DOMContentLoaded', function() {
  const userData = JSON.parse(localStorage.getItem('usuarioLogado'));
  
  // Se não há usuário logado ou não é admin, redireciona para login
  if (!userData || userData.nmFuncionario !== 'admin') {
    document.getElementById('adicionarFuncionario').style.display = 'none';
    
    // Esconder os botões de remover quando não for admin
    const observer = new MutationObserver(function(mutations) {
      document.querySelectorAll('.btn-remover').forEach(btn => {
        btn.style.display = 'none';
      });
    });
    
    observer.observe(document.getElementById('tabelaFuncionarios'), {
      childList: true,
      subtree: true
    });
  }
});

document.getElementById('adicionarFuncionario').addEventListener('click', function() {
  let nome = document.getElementById('nomeFuncionario').value;
  let email = document.getElementById('emailFuncionario').value;
  let senha = document.getElementById('senhaFuncionario').value;
  let confirmarSenha = document.getElementById('confirmarSenhaFuncionario').value;

  if (!nome || !email || !senha || !confirmarSenha) {
    alert("Todos os campos são obrigatórios!");
    return;
  }

  if (senha !== confirmarSenha) {
    alert("As senhas não coincidem!");
    return;
  }

  const funcionarioData = {
    nmFuncionario: nome,
    dsEmail: email,
    dsSenha: senha
  };

  fetch('http://localhost:8081/funcionario', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(funcionarioData)
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Erro ao cadastrar funcionário');
    }
    return response.json();
  })
  .then(data => {
    alert("Funcionário adicionado com sucesso!");
    document.getElementById('nomeFuncionario').value = '';
    document.getElementById('emailFuncionario').value = '';
    document.getElementById('senhaFuncionario').value = '';
    document.getElementById('confirmarSenhaFuncionario').value = '';
    
    carregarFuncionarios();
  })
  .catch(error => {
    console.error('Erro:', error);
    alert("Erro ao cadastrar funcionário: " + error.message);
  });
});

function carregarFuncionarios() {
  const loadingElement = document.getElementById("loading");
  if (loadingElement) {
    loadingElement.style.display = "block";
  }
  
  fetch("http://localhost:8081/funcionario")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Erro ao carregar funcionários");
      }
      return response.json();
    })
    .then((data) => {
      let tabelaFuncionarios = document.getElementById("tabelaFuncionarios");
      tabelaFuncionarios.innerHTML = "";
      
      const userData = JSON.parse(localStorage.getItem('usuarioLogado'));
      const isAdmin = userData && userData.nmFuncionario === 'admin';
      
      data.forEach((funcionario) => {
        const row = document.createElement("tr");
        
        // Condicional para o botão de remover baseado se é admin
        const btnRemover = isAdmin 
          ? `<button class="btn-remover" onclick="removerFuncionario(${funcionario.id})"><i class="fa-solid fa-trash"></i> Remover</button>`
          : '';
          
        row.innerHTML = `
          <td>${funcionario.id}</td>
          <td>${funcionario.nmFuncionario}</td>
          <td>${funcionario.dsEmail}</td>
          <td>${btnRemover}</td>
        `;
        tabelaFuncionarios.appendChild(row);
      });
      
      if (loadingElement) {
        loadingElement.style.display = "none";
      }
    })
    .catch((error) => {
      console.error("Erro ao carregar funcionários:", error);
      if (loadingElement) {
        loadingElement.style.display = "none";
      }
      alert("Erro ao carregar funcionários: " + error.message);
    });
}

function removerFuncionario(id) {
  // Verificar se o usuário é admin antes de permitir a exclusão
  const userData = JSON.parse(localStorage.getItem('usuarioLogado'));
  if (!userData || userData.nmFuncionario !== 'admin') {
    alert("Apenas o administrador pode remover funcionários!");
    return;
  }
  
  if (confirm("Tem certeza que deseja remover este funcionário?")) {
    fetch(`http://localhost:8081/funcionario/${id}`, {
      method: 'DELETE'
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Erro ao remover funcionário');
      }
      return response.text();
    })
    .then(data => {
      alert("Funcionário removido com sucesso!");
      carregarFuncionarios();
    })
    .catch(error => {
      console.error('Erro:', error);
      alert("Erro ao remover funcionário: " + error.message);
    });
  }
}

window.onload = carregarFuncionarios;