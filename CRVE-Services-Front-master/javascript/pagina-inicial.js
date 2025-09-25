document.addEventListener('DOMContentLoaded', () => {
  // Obter usuário logado do localStorage
  const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));
  
  const nomeEl = document.getElementById('nmFuncionario');
  const emailEl = document.getElementById('dsEmail');

  if (usuarioLogado) {
    if (nomeEl) nomeEl.textContent = usuarioLogado.nmFuncionario;
    if (emailEl) emailEl.textContent = usuarioLogado.dsEmail;
  } else {
    const nome = localStorage.getItem('funcionarioNome');
    const email = localStorage.getItem('funcionarioEmail');
    
    if (nome && nomeEl) nomeEl.textContent = nome;
    if (email && emailEl) emailEl.textContent = email;
  }
  
  carregarServicosRecentes();
});

function carregarServicosRecentes() {
  const tabelaServicos = document.getElementById('tabelaServicos');

  if (!tabelaServicos) return;

  try {
    // Tentar buscar da API
    fetch('http://localhost:8081/servico')
      .then(response => {
        if (!response.ok) {
          throw new Error('Não foi possível carregar os serviços');
        }
        return response.json();
      })
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          preencherTabelaServicos(data, tabelaServicos);
        } else {
          exibirServicosPadrao(tabelaServicos);
        }
      })
      .catch(error => {
        console.error('Erro ao carregar serviços:', error);
        exibirServicosPadrao(tabelaServicos);
      });
  } catch (error) {
    console.error('Erro ao tentar conectar:', error);
    exibirServicosPadrao(tabelaServicos);
  }
}

function formatarStatus(status) {
  let statusIcon = '🔴';
  let statusText = 'Não Iniciado';
  
  if (status === 'andamento') {
    statusIcon = '🟡';
    statusText = 'Em Andamento';
  } else if (status === 'concluido') {
    statusIcon = '🟢';
    statusText = 'Concluído';
  }
  
  return `${statusIcon} ${statusText}`;
}

function formatarData(dataString) {
  if (!dataString) return 'Não definida';
  
  const data = new Date(dataString);
  return data.toLocaleDateString('pt-BR');
}

function preencherTabelaServicos(servicos, tabela) {
  tabela.innerHTML = '';

  const servicosRecentes = servicos.slice(0, 5);
  
  servicosRecentes.forEach(servico => {
    const row = document.createElement('tr');
    
    row.innerHTML = `
      <td>${servico.id}</td>
      <td>${servico.descricao}</td>
      <td>${formatarStatus(servico.status)}</td>
      <td>${formatarData(servico.dataEntrega)}</td>
    `;
    
    tabela.appendChild(row);
  });
}

function exibirServicosPadrao(tabela) {
  tabela.innerHTML = `
    <tr>
      <td>1</td>
      <td>Manutenção de Motor</td>
      <td>🟢 Concluído</td>
      <td>Hoje</td>
    </tr>
    <tr>
      <td>2</td>
      <td>Troca de Óleo</td>
      <td>🟡 Em andamento</td>
      <td>Hoje</td>
    </tr>
    <tr>
      <td>3</td>
      <td>Revisão Completa</td>
      <td>🔴 Não Iniciado</td>
      <td>Amanhã</td>
    </tr>
  `;
}