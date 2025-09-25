document.addEventListener('DOMContentLoaded', function() {
    // Limpar qualquer sessão anterior
    localStorage.removeItem('usuarioLogado');
    
    document.getElementById('btnLogin').addEventListener('click', realizarLogin);
    
    // Permitir login ao pressionar Enter nos campos de input
    document.getElementById('usuario').addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        realizarLogin();
      }
    });
    
    document.getElementById('senha').addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        realizarLogin();
      }
    });
    
    // Criar usuário admin se não existir 
    fetch('http://localhost:8081/funcionario')
      .then(response => response.json())
      .then(data => {
        // Verificar se admin já existe
        const adminExists = data.some(func => func.nmFuncionario === 'admin');
        
        if (!adminExists) {
          // Criar usuário admin
          const adminData = {
            nmFuncionario: 'admin',
            dsEmail: 'admin@gmail.com',
            dsSenha: 'admin'
          };
          
          fetch('http://localhost:8081/funcionario', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(adminData)
          })
          .then(response => {
            if (!response.ok) {
              console.error('Erro ao criar usuário admin');
            }
          })
          .catch(error => {
            console.error('Erro:', error);
          });
        }
      })
      .catch(error => {
        console.error('Erro ao verificar usuários:', error);
      });
  });
  
  function realizarLogin() {
    const usuario = document.getElementById('usuario').value;
    const senha = document.getElementById('senha').value;
    const errorMessage = document.getElementById('errorMessage');
    
    if (!usuario || !senha) {
      errorMessage.textContent = 'Preencha todos os campos!';
      errorMessage.style.display = 'block';
      return;
    }
    
    // Credenciais para a API
    const credentials = {
      nmFuncionario: usuario,
      dsSenha: senha
    };
    
    fetch('http://localhost:8081/funcionario/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(credentials)
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Credenciais inválidas');
      }
      return response.json();
    })
    .then(data => {
      // Salvar dados do usuário no localStorage
      localStorage.setItem('usuarioLogado', JSON.stringify(data.funcionario));
      localStorage.setItem('token', data.token);
      
      // Redirecionar para a página inicial
      window.location.href = '../html/pagina-inicial.html';
    })
    .catch(error => {
      console.error('Erro:', error);
      errorMessage.textContent = 'Usuário ou senha incorretos!';
      errorMessage.style.display = 'block';
    });
  }