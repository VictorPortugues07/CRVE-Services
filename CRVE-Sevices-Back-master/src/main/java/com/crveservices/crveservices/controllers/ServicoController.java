package com.crveservices.crveservices.controllers;

import com.crveservices.crveservices.dto.ServicoRecordDto;
import com.crveservices.crveservices.models.EstoqueModel;
import com.crveservices.crveservices.models.FuncionarioModel;
import com.crveservices.crveservices.models.ProdutoModel;
import com.crveservices.crveservices.models.ServicoModel;
import com.crveservices.crveservices.repositories.EstoqueRepository;
import com.crveservices.crveservices.repositories.FuncionarioRepository;
import com.crveservices.crveservices.repositories.ProdutoRepository;
import com.crveservices.crveservices.repositories.ServicoRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/servico")
public class ServicoController {

    @Autowired
    ServicoRepository servicoRepository;

    @Autowired
    FuncionarioRepository funcionarioRepository;

    @Autowired
    ProdutoRepository produtoRepository;

    @Autowired
    EstoqueRepository estoqueRepository;

    @PostMapping
    public ResponseEntity<Object> saveServico(@RequestBody @Valid ServicoRecordDto dto) {
        // Verificar funcionário
        Optional<FuncionarioModel> funcionarioOpt = funcionarioRepository.findById(dto.funcionarioId());
        if (funcionarioOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Funcionário não encontrado");
        }

        // Verificar produtos
        List<ProdutoModel> produtos = produtoRepository.findAllById(dto.produtosIds());
        if (produtos.isEmpty() || produtos.size() != dto.produtosIds().size()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Produtos inválidos informados");
        }

        // Verificar estoque para cada produto
        Map<String, Object> estoqueInsuficiente = new HashMap<>();
        estoqueInsuficiente.put("mensagem", "Estoque insuficiente para os seguintes produtos:");
        List<Map<String, Object>> produtosInsuficientes = new ArrayList<>();

        boolean todosProdutosDisponiveis = true;

        for (ProdutoModel produto : produtos) {
            Long produtoId = produto.getId();
            Integer quantidadeNecessaria = dto.produtosQuantidade().getOrDefault(produtoId, 0);

            if (quantidadeNecessaria > 0) {
                Optional<EstoqueModel> estoqueOpt = estoqueRepository.findByProdutoId(produtoId);

                if (estoqueOpt.isEmpty() || estoqueOpt.get().getQuantidade() < quantidadeNecessaria) {
                    todosProdutosDisponiveis = false;

                    Map<String, Object> prodInfo = new HashMap<>();
                    prodInfo.put("id", produtoId);
                    prodInfo.put("nome", produto.getNmProduto());
                    prodInfo.put("quantidadeNecessaria", quantidadeNecessaria);
                    prodInfo.put("estoqueDisponivel", estoqueOpt.isPresent() ? estoqueOpt.get().getQuantidade() : 0);

                    produtosInsuficientes.add(prodInfo);
                }
            }
        }

        if (!todosProdutosDisponiveis) {
            estoqueInsuficiente.put("produtos", produtosInsuficientes);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(estoqueInsuficiente);
        }

        // Criar e salvar o serviço
        ServicoModel servicoModel = new ServicoModel();
        servicoModel.setDescricao(dto.descricao());
        servicoModel.setStatus(dto.status());
        servicoModel.setDataEntrega(dto.dataEntrega());
        servicoModel.setValorMaoDeObra(dto.valorMaoDeObra());
        servicoModel.setFuncionario(funcionarioOpt.get());
        servicoModel.setProdutos(produtos);
        servicoModel.setProdutosQuantidade(dto.produtosQuantidade());

        ServicoModel servicoSalvo = servicoRepository.save(servicoModel);

        // Baixar estoque se o status for "concluido"
        if ("concluido".equals(dto.status())) {
            baixarEstoqueDeProdutos(dto.produtosQuantidade());
        }

        return ResponseEntity.status(HttpStatus.CREATED).body(servicoSalvo);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Object> getServico(@PathVariable Long id) {
        Optional<ServicoModel> servicoOpt = servicoRepository.findById(id);
        if (servicoOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Serviço não encontrado");
        }
        return ResponseEntity.ok(servicoOpt.get());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Object> updateServico(@PathVariable Long id, @RequestBody @Valid ServicoRecordDto dto) {
        Optional<ServicoModel> servicoOpt = servicoRepository.findById(id);
        if (servicoOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Serviço não encontrado");
        }

        Optional<FuncionarioModel> funcionarioOpt = funcionarioRepository.findById(dto.funcionarioId());
        if (funcionarioOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Funcionário não encontrado");
        }

        List<ProdutoModel> produtos = produtoRepository.findAllById(dto.produtosIds());
        if (produtos.isEmpty() || produtos.size() != dto.produtosIds().size()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Produtos inválidos informados");
        }

        // Verificar estoque se o status mudar para "concluido"
        ServicoModel servicoAntigo = servicoOpt.get();
        boolean finalizandoServico = !"concluido".equals(servicoAntigo.getStatus()) && "concluido".equals(dto.status());

        if (finalizandoServico) {
            // Verificar estoque para cada produto
            Map<String, Object> estoqueInsuficiente = new HashMap<>();
            estoqueInsuficiente.put("mensagem", "Estoque insuficiente para os seguintes produtos:");
            List<Map<String, Object>> produtosInsuficientes = new ArrayList<>();

            boolean todosProdutosDisponiveis = true;

            for (ProdutoModel produto : produtos) {
                Long produtoId = produto.getId();
                Integer quantidadeNecessaria = dto.produtosQuantidade().getOrDefault(produtoId, 0);

                if (quantidadeNecessaria > 0) {
                    Optional<EstoqueModel> estoqueOpt = estoqueRepository.findByProdutoId(produtoId);

                    if (estoqueOpt.isEmpty() || estoqueOpt.get().getQuantidade() < quantidadeNecessaria) {
                        todosProdutosDisponiveis = false;

                        Map<String, Object> prodInfo = new HashMap<>();
                        prodInfo.put("id", produtoId);
                        prodInfo.put("nome", produto.getNmProduto());
                        prodInfo.put("quantidadeNecessaria", quantidadeNecessaria);
                        prodInfo.put("estoqueDisponivel", estoqueOpt.isPresent() ? estoqueOpt.get().getQuantidade() : 0);

                        produtosInsuficientes.add(prodInfo);
                    }
                }
            }

            if (!todosProdutosDisponiveis) {
                estoqueInsuficiente.put("produtos", produtosInsuficientes);
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(estoqueInsuficiente);
            }
        }

        ServicoModel servico = servicoOpt.get();
        servico.setDescricao(dto.descricao());
        servico.setStatus(dto.status());
        servico.setDataEntrega(dto.dataEntrega());
        servico.setValorMaoDeObra(dto.valorMaoDeObra());
        servico.setFuncionario(funcionarioOpt.get());
        servico.setProdutos(produtos);
        servico.setProdutosQuantidade(dto.produtosQuantidade());

        ServicoModel servicoSalvo = servicoRepository.save(servico);

        // Baixar estoque se o status mudar para "concluido"
        if (finalizandoServico) {
            baixarEstoqueDeProdutos(dto.produtosQuantidade());
        }

        return ResponseEntity.status(HttpStatus.OK).body(servicoSalvo);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Object> deleteServico(@PathVariable Long id) {
        Optional<ServicoModel> servicoOpt = servicoRepository.findById(id);
        if (servicoOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Serviço não encontrado");
        }
        servicoRepository.delete(servicoOpt.get());
        return ResponseEntity.status(HttpStatus.OK).body("Serviço excluído com sucesso!");
    }

    @GetMapping
    public ResponseEntity<Object> getAllServicos() {
        List<ServicoModel> servicos = servicoRepository.findAll();
        if (servicos.isEmpty()) {
            // Retornar uma lista vazia em vez de um objeto com mensagem
            return ResponseEntity.ok(Collections.emptyList());
        }
        return ResponseEntity.ok(servicos);
    }

    // Método privado para baixar estoque
    private void baixarEstoqueDeProdutos(Map<Long, Integer> produtosQuantidade) {
        for (Map.Entry<Long, Integer> entry : produtosQuantidade.entrySet()) {
            Long produtoId = entry.getKey();
            Integer quantidade = entry.getValue();

            if (quantidade > 0) {
                Optional<EstoqueModel> estoqueOpt = estoqueRepository.findByProdutoId(produtoId);

                if (estoqueOpt.isPresent()) {
                    EstoqueModel estoque = estoqueOpt.get();
                    estoque.setQuantidade(Math.max(0, estoque.getQuantidade() - quantidade));
                    estoqueRepository.save(estoque);
                }
            }
        }
    }
}