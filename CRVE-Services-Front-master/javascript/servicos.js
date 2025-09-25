document.addEventListener('DOMContentLoaded', function() {
  // Inicializar o ID do serviço para edição
  document.getElementById('servicoId').value = '';
  
  // Carregar serviços existentes
  carregarServicos();
  
  // Carregar funcionários para o combobox
  carregarFuncionarios();
  
  // Carregar produtos para seleção múltipla
  carregarProdutos();
  
  // Adicionar listeners para os botões
  document.getElementById('addServiceBtn').addEventListener('click', adicionarOuAtualizarServico);
  document.getElementById('valorMaoDeObra').addEventListener('input', atualizarProdutosSelecionados);
  
  // Inicializar o datepicker com data de hoje
  document.getElementById('dataServico').valueAsDate = new Date();
  
  // Inicializar área de produtos selecionados
  document.getElementById('produtosSelecionados').innerHTML = '<p>Nenhum produto selecionado.</p>';
});

function carregarServicos() {
  fetch("http://localhost:8081/servico")
    .then(response => {
      if (!response.ok) {
        if (response.status === 204) { // No Content
          return [];
        }
        throw new Error("Erro ao carregar serviços");
      }
      return response.json();
    })
    .then(servicos => {
      const tabelaServicos = document.getElementById("tabelaServicos");
      tabelaServicos.innerHTML = "";
      
      if (!servicos || servicos.length === 0) {
        tabelaServicos.innerHTML = '<tr><td colspan="5" style="text-align: center;">Nenhum serviço encontrado</td></tr>';
        return;
      }
      
      servicos.forEach(servico => {
        const dataFormatada = servico.dataEntrega ? new Date(servico.dataEntrega).toLocaleDateString() : 'Não definida';
        let statusIcon = '🔴';
        
        if (servico.status === 'andamento') {
          statusIcon = '🟡';
        } else if (servico.status === 'concluido') {
          statusIcon = '🟢';
        }
        
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${servico.id}</td>
          <td>${servico.descricao}</td>
          <td>${statusIcon} ${formatarStatus(servico.status)}</td>
          <td>${dataFormatada}</td>
          <td>
            <button class="btn-editar" onclick="editarServico(${servico.id})"><i class="fas fa-edit"></i></button>
            <button class="btn-remover" onclick="removerServico(${servico.id})"><i class="fas fa-trash"></i></button>
          </td>
        `;
        tabelaServicos.appendChild(row);
      });
    })
    .catch(error => {
      console.error("Erro:", error);
      alert("Erro ao carregar serviços: " + error.message);
    });
}

function formatarStatus(status) {
  switch(status) {
    case 'nao-iniciado': return 'Não Iniciado';
    case 'andamento': return 'Em Andamento';
    case 'concluido': return 'Concluído';
    default: return status;
  }
}

function carregarFuncionarios() {
  fetch("http://localhost:8081/funcionario")
    .then(response => {
      if (!response.ok) {
        throw new Error("Erro ao carregar funcionários");
      }
      return response.json();
    })
    .then(funcionarios => {
      const funcionarioSelect = document.getElementById("funcionarioId");
      funcionarioSelect.innerHTML = '<option value="">Selecione um funcionário</option>';
      
      funcionarios.forEach(funcionario => {
        funcionarioSelect.innerHTML += `<option value="${funcionario.id}">${funcionario.nmFuncionario}</option>`;
      });
    })
    .catch(error => {
      console.error("Erro:", error);
      alert("Erro ao carregar funcionários: " + error.message);
    });
}

function carregarProdutos() {
  fetch("http://localhost:8081/produto")
    .then(response => {
      if (!response.ok) {
        throw new Error("Erro ao carregar produtos");
      }
      return response.json();
    })
    .then(produtos => {
      const produtosDiv = document.getElementById("produtosDisponiveis");
      produtosDiv.innerHTML = "";
      
      produtos.forEach(produto => {
        // Verificar o estoque deste produto
        fetch(`http://localhost:8081/estoque/produto/${produto.id}`)
          .then(response => {
            if (response.ok) {
              return response.json();
            }
            return { quantidade: 0, unidade: "unidade" };
          })
          .then(estoque => {
            const div = document.createElement("div");
            div.className = "produto-item";
            div.innerHTML = `
              <input type="checkbox" id="produto_${produto.id}" class="produto-checkbox" data-id="${produto.id}" data-nome="${produto.nmProduto}" data-preco="${produto.nuValorUnitario}">
              <label for="produto_${produto.id}">${produto.nmProduto} - R$ ${produto.nuValorUnitario.toFixed(2)} (Estoque: ${estoque.quantidade} ${estoque.unidade})</label>
              <div class="quantidade-container" style="display: none;">
                <label for="qtd_${produto.id}">Quantidade:</label>
                <input type="number" id="qtd_${produto.id}" class="produto-quantidade" min="1" max="${estoque.quantidade}" value="1">
                <span class="unidade">${estoque.unidade}</span>
              </div>
            `;
            produtosDiv.appendChild(div);
            
            // Adicionar listener para exibir campo de quantidade ao selecionar o produto
            document.getElementById(`produto_${produto.id}`).addEventListener('change', function() {
              const quantidadeContainer = this.parentElement.querySelector('.quantidade-container');
              if (this.checked) {
                quantidadeContainer.style.display = 'block';
              } else {
                quantidadeContainer.style.display = 'none';
              }
              atualizarProdutosSelecionados();
            });
            
            // Adicionar listener para atualizar total ao mudar quantidade
            document.getElementById(`qtd_${produto.id}`).addEventListener('change', function() {
              atualizarProdutosSelecionados();
            });
          });
      });
    })
    .catch(error => {
      console.error("Erro:", error);
      alert("Erro ao carregar produtos: " + error.message);
    });
}

function atualizarProdutosSelecionados() {
  const produtosSelecionados = document.getElementById("produtosSelecionados");
  const checkboxes = document.querySelectorAll('.produto-checkbox:checked');
  
  if (checkboxes.length === 0) {
    produtosSelecionados.innerHTML = '<p>Nenhum produto selecionado.</p>';
    document.getElementById('valorTotal').textContent = 'R$ 0,00';
    return;
  }
  
  let total = 0;
  let html = '<ul>';
  
  checkboxes.forEach(checkbox => {
    const produtoId = checkbox.getAttribute('data-id');
    const produtoNome = checkbox.getAttribute('data-nome');
    const produtoPreco = parseFloat(checkbox.getAttribute('data-preco'));
    const quantidade = parseInt(document.getElementById(`qtd_${produtoId}`).value);
    const subtotal = produtoPreco * quantidade;
    
    total += subtotal;
    
    html += `<li>${produtoNome} - ${quantidade} x R$ ${produtoPreco.toFixed(2)} = R$ ${subtotal.toFixed(2)}</li>`;
  });
  
  html += '</ul>';
  produtosSelecionados.innerHTML = html;
  
  // Adicionar valor de mão de obra
  const valorMaoDeObra = parseFloat(document.getElementById('valorMaoDeObra').value) || 0;
  total += valorMaoDeObra;
  
  document.getElementById('valorTotal').textContent = `R$ ${total.toFixed(2)}`;
}

function adicionarOuAtualizarServico() {
  const servicoId = document.getElementById('servicoId').value;
  const descricao = document.getElementById('descricao').value;
  const status = document.getElementById('status').value;
  const dataEntrega = document.getElementById('dataServico').value;
  const funcionarioId = document.getElementById('funcionarioId').value;
  const valorMaoDeObra = parseFloat(document.getElementById('valorMaoDeObra').value) || 0;
  
  // Validar campos obrigatórios
  if (!descricao || !status || !dataEntrega || !funcionarioId) {
    alert('Preencha todos os campos obrigatórios!');
    return;
  }
  
  // Obter produtos selecionados
  const checkboxes = document.querySelectorAll('.produto-checkbox:checked');
  if (checkboxes.length === 0) {
    alert('Selecione pelo menos um produto!');
    return;
  }
  
  const produtosIds = [];
  const produtosQuantidade = {};
  
  checkboxes.forEach(checkbox => {
    const produtoId = parseInt(checkbox.getAttribute('data-id'));
    const quantidade = parseInt(document.getElementById(`qtd_${produtoId}`).value);
    
    produtosIds.push(produtoId);
    produtosQuantidade[produtoId] = quantidade;
  });
  
  // Preparar dados para envio
  const servicoData = {
    descricao: descricao,
    status: status,
    dataEntrega: dataEntrega,
    valorMaoDeObra: valorMaoDeObra,
    funcionarioId: parseInt(funcionarioId),
    produtosIds: produtosIds,
    produtosQuantidade: produtosQuantidade
  };
  
  // Determinar método e URL com base em ser adição ou edição
  const method = servicoId ? 'PUT' : 'POST';
  const url = servicoId ? `http://localhost:8081/servico/${servicoId}` : 'http://localhost:8081/servico';
  
  fetch(url, {
    method: method,
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(servicoData)
  })
  .then(response => {
    if (!response.ok) {
      return response.json().then(errorData => {
        throw new Error(JSON.stringify(errorData));
      });
    }
    return response.json();
  })
  .then(data => {
    alert(servicoId ? 'Serviço atualizado com sucesso!' : 'Serviço adicionado com sucesso!');
    limparFormulario();
    carregarServicos();
  })
  .catch(error => {
    console.error("Erro:", error);
    try {
      const errorObj = JSON.parse(error.message);
      if (errorObj.mensagem && errorObj.produtos) {
        let mensagem = errorObj.mensagem + "\n\n";
        errorObj.produtos.forEach(p => {
          mensagem += `- ${p.nome}: Necessário ${p.quantidadeNecessaria}, Disponível: ${p.estoqueDisponivel}\n`;
        });
        alert(mensagem);
      } else {
        alert("Erro ao salvar serviço: " + error.message);
      }
    } catch (e) {
      alert("Erro ao salvar serviço: " + error.message);
    }
  });
}

function editarServico(id) {
  fetch(`http://localhost:8081/servico/${id}`)
    .then(response => {
      if (!response.ok) {
        throw new Error("Erro ao carregar serviço");
      }
      return response.json();
    })
    .then(servico => {
      // Preencher o formulário com os dados do serviço
      document.getElementById('servicoId').value = servico.id;
      document.getElementById('descricao').value = servico.descricao;
      document.getElementById('status').value = servico.status;
      document.getElementById('valorMaoDeObra').value = servico.valorMaoDeObra;
      document.getElementById('funcionarioId').value = servico.funcionario.id;
      
      // Formatar a data para o formato do input date
      if (servico.dataEntrega) {
        const dataEntrega = new Date(servico.dataEntrega);
        const formattedDate = dataEntrega.toISOString().split('T')[0];
        document.getElementById('dataServico').value = formattedDate;
      }
      
      // Aguardar os produtos serem carregados antes de selecioná-los
      setTimeout(() => {
        // Desmarcar todos os produtos primeiro
        document.querySelectorAll('.produto-checkbox').forEach(checkbox => {
          checkbox.checked = false;
          const quantidadeContainer = checkbox.parentElement.querySelector('.quantidade-container');
          if (quantidadeContainer) {
            quantidadeContainer.style.display = 'none';
          }
        });
        
        // Marcar os produtos utilizados
        servico.produtos.forEach(produto => {
          const checkbox = document.getElementById(`produto_${produto.id}`);
          if (checkbox) {
            checkbox.checked = true;
            
            // Exibir campo de quantidade
            const quantidadeContainer = checkbox.parentElement.querySelector('.quantidade-container');
            if (quantidadeContainer) {
              quantidadeContainer.style.display = 'block';
            }
            
            // Preencher a quantidade
            const quantidadeInput = document.getElementById(`qtd_${produto.id}`);
            if (quantidadeInput && servico.produtosQuantidade) {
              const quantidade = servico.produtosQuantidade[produto.id];
              if (quantidade) {
                quantidadeInput.value = quantidade;
              }
            }
          }
        });
        
        // Atualizar os produtos selecionados e o total
        atualizarProdutosSelecionados();
      }, 500); // Esperar 500ms para garantir que os produtos foram carregados
      
      // Mudar o texto do botão
      document.getElementById('addServiceBtn').textContent = 'Atualizar Serviço';
      
      // Rolar para o formulário
      document.getElementById('descricao').scrollIntoView({ behavior: 'smooth' });
    })
    .catch(error => {
      console.error("Erro:", error);
      alert("Erro ao carregar serviço: " + error.message);
    });
}

function removerServico(id) {
  if (confirm('Tem certeza que deseja remover este serviço?')) {
    fetch(`http://localhost:8081/servico/${id}`, {
      method: 'DELETE'
    })
    .then(response => {
      if (!response.ok) {
        throw new Error("Erro ao remover serviço");
      }
      return response.text();
    })
    .then(data => {
      alert('Serviço removido com sucesso!');
      carregarServicos();
    })
    .catch(error => {
      console.error("Erro:", error);
      alert("Erro ao remover serviço: " + error.message);
    });
  }
}

function limparFormulario() {
  document.getElementById('servicoId').value = '';
  document.getElementById('descricao').value = '';
  document.getElementById('status').value = 'nao-iniciado';
  document.getElementById('dataServico').valueAsDate = new Date();
  document.getElementById('funcionarioId').value = '';
  document.getElementById('valorMaoDeObra').value = '';
  
  // Desmarcar todos os produtos
  document.querySelectorAll('.produto-checkbox').forEach(checkbox => {
    checkbox.checked = false;
    const quantidadeContainer = checkbox.parentElement.querySelector('.quantidade-container');
    if (quantidadeContainer) {
      quantidadeContainer.style.display = 'none';
    }
  });
  
  // Limpar produtos selecionados
  document.getElementById('produtosSelecionados').innerHTML = '<p>Nenhum produto selecionado.</p>';
  document.getElementById('valorTotal').textContent = 'R$ 0,00';
  
  // Restaurar o texto do botão
  document.getElementById('addServiceBtn').textContent = 'Adicionar Serviço';
}