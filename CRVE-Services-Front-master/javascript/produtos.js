document.getElementById('adicionar').addEventListener('click', function() {
  let nomeProduto = document.getElementById('nmProduto').value;
  let valorProduto = document.getElementById('vlProduto').value;
  let idProduto = document.getElementById('produtoId').value;

  if (!nomeProduto || !valorProduto) {
    alert("Todos os campos são obrigatórios!");
    return;
  }

  if (isNaN(valorProduto) || parseFloat(valorProduto) <= 0) {
    alert("O valor do produto deve ser numérico e maior que zero!");
    return;
  }

  const produtoData = {
    nmProduto: nomeProduto,
    nuValorUnitario: parseFloat(valorProduto)
  };

  const method = idProduto ? 'PUT' : 'POST';
  const url = idProduto 
    ? `http://localhost:8081/produto/${idProduto}` 
    : 'http://localhost:8081/produto';

  fetch(url, {
    method: method,
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(produtoData)
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Erro ao ' + (idProduto ? 'atualizar' : 'cadastrar') + ' produto');
    }
    return response.json();
  })
  .then(data => {
    alert("Produto " + (idProduto ? "atualizado" : "adicionado") + " com sucesso!");
    document.getElementById('nmProduto').value = '';
    document.getElementById('vlProduto').value = '';
    document.getElementById('produtoId').value = '';
    
    // Se estava editando, mudar o texto do botão de volta para Adicionar
    if (idProduto) {
      document.getElementById('adicionar').innerText = 'Adicionar Produto';
    }
    
    carregarProdutos();
  })
  .catch(error => {
    console.error('Erro:', error);
    alert("Erro ao " + (idProduto ? "atualizar" : "adicionar") + " produto: " + error.message);
  });
});

function carregarProdutos() {
  const loadingElement = document.getElementById("loading");
  if (loadingElement) {
    loadingElement.style.display = "block";
  }
  
  fetch("http://localhost:8081/produto")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Erro ao carregar produtos");
      }
      return response.json();
    })
    .then((data) => {
      let tabelaProdutos = document.getElementById("tabelaProdutos");
      tabelaProdutos.innerHTML = "";
      data.forEach((produto) => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${produto.id}</td>
          <td>${produto.nmProduto}</td>
          <td>R$ ${produto.nuValorUnitario.toFixed(2)}</td>
          <td>
            <button onclick="editarProduto(${produto.id})"><i class="fa-solid fa-pen"></i> Editar</button>
            <button class="btn-remover" onclick="removerProduto(${produto.id})"><i class="fa-solid fa-trash"></i> Remover</button>
          </td>
        `;
        tabelaProdutos.appendChild(row);
      });
      if (loadingElement) {
        loadingElement.style.display = "none";
      }
    })
    .catch((error) => {
      console.error("Erro ao carregar produtos:", error);
      if (loadingElement) {
        loadingElement.style.display = "none";
      }
      alert("Erro ao carregar produtos: " + error.message);
    });
}

function editarProduto(id) {
  fetch(`http://localhost:8081/produto/${id}`)
    .then(response => {
      if (!response.ok) {
        throw new Error('Erro ao carregar produto para edição');
      }
      return response.json();
    })
    .then(produto => {
      document.getElementById('nmProduto').value = produto.nmProduto;
      document.getElementById('vlProduto').value = produto.nuValorUnitario;
      document.getElementById('produtoId').value = produto.id;
      document.getElementById('adicionar').innerText = 'Atualizar Produto';
      
      // Rolar para o formulário
      document.querySelector('.form-produto').scrollIntoView({
        behavior: 'smooth'
      });
    })
    .catch(error => {
      console.error('Erro:', error);
      alert("Erro ao carregar produto para edição: " + error.message);
    });
}

function removerProduto(id) {
  if (confirm("Tem certeza que deseja remover este produto?")) {
    fetch(`http://localhost:8081/produto/${id}`, {
      method: 'DELETE'
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Erro ao remover produto');
      }
      return response.text();
    })
    .then(data => {
      alert("Produto removido com sucesso!");
      carregarProdutos();
    })
    .catch(error => {
      console.error('Erro:', error);
      alert("Erro ao remover produto: " + error.message);
    });
  }
}

window.onload = carregarProdutos;