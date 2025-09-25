// Espera o DOM carregar completamente antes de executar qualquer código
document.addEventListener("DOMContentLoaded", () => {
  // Carregar produtos ao iniciar
  carregarProdutos();
  
  // Adicionar listener para o botão de adicionar estoque
  document.getElementById("btnAdicionarEstoque").addEventListener("click", abrirModalEstoque);
  
  // Configurar o modal
  const modal = document.getElementById("estoqueModal");
  const span = document.getElementsByClassName("close")[0];
  
  // Quando o usuário clicar no X, fechar o modal
  span.onclick = function() {
    modal.style.display = "none";
  }
  
  // Quando o usuário clicar fora do modal, fechar
  window.onclick = function(event) {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  }
  
  // Listener para o botão de salvar no modal
  document.getElementById("salvarEstoque").addEventListener("click", salvarEstoque);
});

// Função para carregar a lista de produtos com seus estoques
function carregarProdutos() {
  document.getElementById("loading").style.display = "block";
  
  fetch("http://localhost:8081/produto")
    .then(response => {
      if (!response.ok) {
        throw new Error("Erro ao carregar produtos");
      }
      return response.json();
    })
    .then(produtos => {
      // Carregar informações de estoque para cada produto
      Promise.all(
        produtos.map(produto => 
          fetch(`http://localhost:8081/estoque/produto/${produto.id}`)
            .then(response => {
              if (response.ok) {
                return response.json();
              }
              return { produto: produto, quantidade: 0, unidade: "unidade" };
            })
            .catch(() => {
              return { produto: produto, quantidade: 0, unidade: "unidade" };
            })
        )
      ).then(resultados => {
        exibirProdutosComEstoque(produtos, resultados);
        document.getElementById("loading").style.display = "none";
      });
    })
    .catch(error => {
      console.error("Erro:", error);
      alert("Erro ao carregar produtos: " + error.message);
      document.getElementById("loading").style.display = "none";
    });
}

// Exibe os produtos com suas informações de estoque na tabela
function exibirProdutosComEstoque(produtos, resultadosEstoque) {
  const tabelaProdutos = document.getElementById("tabelaProdutos");
  tabelaProdutos.innerHTML = "";
  
  const estoqueMap = new Map();
  
  // Criar um mapa dos dados de estoque
  resultadosEstoque.forEach(estoque => {
    if (estoque && estoque.produto) {
      estoqueMap.set(estoque.produto.id, estoque);
    }
  });
  
  produtos.forEach(produto => {
    const tr = document.createElement("tr");
    
    // Buscar informações de estoque para este produto
    let estoqueInfo = estoqueMap.get(produto.id);
    let quantidade = 0;
    let unidade = "unidade";
    let estoqueId = null;
    
    if (estoqueInfo) {
      quantidade = estoqueInfo.quantidade || 0;
      unidade = estoqueInfo.unidade || "unidade";
      estoqueId = estoqueInfo.id || null;
    }
    
    tr.innerHTML = `
      <td>${produto.id}</td>
      <td>${produto.nmProduto}</td>
      <td>R$ ${produto.nuValorUnitario.toFixed(2)}</td>
      <td>${quantidade} ${unidade}</td>
      <td>
        <button class="btn-estoque" onclick="atualizarEstoque(${produto.id}, '${produto.nmProduto}', ${estoqueId}, ${quantidade}, '${unidade}')">
          <i class="fa-solid fa-boxes-stacked"></i> Atualizar Estoque
        </button>
      </td>
    `;
    
    tabelaProdutos.appendChild(tr);
  });
}

// Função para abrir o modal de atualização de estoque para um produto específico
function atualizarEstoque(produtoId, produtoNome, estoqueId, quantidadeAtual, unidadeAtual) {
  // Ocultar o campo de seleção de produto, já que estamos atualizando um produto específico
  document.getElementById("selecaoProdutoDiv").style.display = "none";
  
  // Preencher o modal com os dados do produto
  document.getElementById("produtoIdModal").value = produtoId;
  document.getElementById("estoqueIdModal").value = estoqueId || '';
  document.getElementById("produtoNomeModal").textContent = produtoNome;
  document.getElementById("quantidadeEstoque").value = quantidadeAtual;
  
  // Selecionar a unidade atual no combo
  const unidadeSelect = document.getElementById("unidadeEstoque");
  for (let i = 0; i < unidadeSelect.options.length; i++) {
    if (unidadeSelect.options[i].value === unidadeAtual) {
      unidadeSelect.selectedIndex = i;
      break;
    }
  }
  
  // Exibir o modal
  document.getElementById("estoqueModal").style.display = "block";
}

// Função para abrir o modal para adicionar estoque a um novo produto
function abrirModalEstoque() {
  // Mostrar o campo de seleção de produto
  document.getElementById("selecaoProdutoDiv").style.display = "block";
  
  // Carregar produtos no combo
  fetch("http://localhost:8081/produto")
    .then(response => response.json())
    .then(produtos => {
      const produtoSelect = document.getElementById("produtoSelect");
      produtoSelect.innerHTML = '<option value="">Selecione um produto</option>';
      
      produtos.forEach(produto => {
        produtoSelect.innerHTML += `<option value="${produto.id}">${produto.nmProduto}</option>`;
      });
      
      // Limpar outros campos
      document.getElementById("produtoIdModal").value = '';
      document.getElementById("estoqueIdModal").value = '';
      document.getElementById("produtoNomeModal").textContent = '';
      document.getElementById("quantidadeEstoque").value = '0';
      
      // Exibir o modal
      document.getElementById("estoqueModal").style.display = "block";
    })
    .catch(error => {
      console.error("Erro:", error);
      alert("Erro ao carregar lista de produtos");
    });
}

// Função para salvar as alterações no estoque
function salvarEstoque() {
  // Obter valores do formulário
  const estoqueId = document.getElementById("estoqueIdModal").value;
  let produtoId = document.getElementById("produtoIdModal").value;
  
  // Se não tiver produtoId, verificar se foi selecionado no combo
  if (!produtoId) {
    produtoId = document.getElementById("produtoSelect").value;
    if (!produtoId) {
      alert("Selecione um produto!");
      return;
    }
  }
  
  const quantidade = parseInt(document.getElementById("quantidadeEstoque").value);
  const unidade = document.getElementById("unidadeEstoque").value;
  
  // Validar dados
  if (isNaN(quantidade) || quantidade < 0) {
    alert("Informe uma quantidade válida!");
    return;
  }
  
  // Preparar dados para envio
  const estoqueData = {
    produtoId: parseInt(produtoId),
    quantidade: quantidade,
    unidade: unidade
  };
  
  console.log("Enviando dados de estoque:", estoqueData);
  
  // Enviar para a API
  fetch("http://localhost:8081/estoque", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(estoqueData)
  })
  .then(response => {
    if (!response.ok) {
      throw new Error("Erro ao salvar estoque");
    }
    return response.json();
  })
  .then(data => {
    alert("Estoque atualizado com sucesso!");
    document.getElementById("estoqueModal").style.display = "none";
    carregarProdutos(); // Recarregar a tabela
  })
  .catch(error => {
    console.error("Erro:", error);
    alert("Erro ao atualizar estoque: " + error.message);
  });
}

// Função auxiliar para quando um produto é selecionado no combo
function produtoSelecionado() {
  const produtoId = document.getElementById("produtoSelect").value;
  if (produtoId) {
    document.getElementById("produtoIdModal").value = produtoId;
    
    // Buscar nome do produto
    fetch(`http://localhost:8081/produto/${produtoId}`)
      .then(response => response.json())
      .then(produto => {
        document.getElementById("produtoNomeModal").textContent = produto.nmProduto;
      })
      .catch(error => {
        console.error("Erro:", error);
      });
    
    // Verificar se já existe estoque para este produto
    fetch(`http://localhost:8081/estoque/produto/${produtoId}`)
      .then(response => {
        if (response.ok) {
          return response.json();
        }
        return null;
      })
      .then(estoque => {
        if (estoque) {
          document.getElementById("estoqueIdModal").value = estoque.id;
          document.getElementById("quantidadeEstoque").value = estoque.quantidade;
          
          // Selecionar a unidade no combo
          const unidadeSelect = document.getElementById("unidadeEstoque");
          for (let i = 0; i < unidadeSelect.options.length; i++) {
            if (unidadeSelect.options[i].value === estoque.unidade) {
              unidadeSelect.selectedIndex = i;
              break;
            }
          }
        } else {
          document.getElementById("estoqueIdModal").value = '';
          document.getElementById("quantidadeEstoque").value = '0';
        }
      })
      .catch(error => {
        console.error("Erro:", error);
        document.getElementById("estoqueIdModal").value = '';
        document.getElementById("quantidadeEstoque").value = '0';
      });
  }
}

// Expor as funções necessárias globalmente para que possam ser chamadas a partir de atributos onclick
window.atualizarEstoque = atualizarEstoque;
window.produtoSelecionado = produtoSelecionado;