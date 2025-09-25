package com.crveservices.crveservices.controllers;

import com.crveservices.crveservices.dto.EstoqueRecordDto;
import com.crveservices.crveservices.models.EstoqueModel;
import com.crveservices.crveservices.models.ProdutoModel;
import com.crveservices.crveservices.repositories.EstoqueRepository;
import com.crveservices.crveservices.repositories.ProdutoRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/estoque")
public class EstoqueController {

    @Autowired
    EstoqueRepository estoqueRepository;

    @Autowired
    ProdutoRepository produtoRepository;

    @PostMapping
    public ResponseEntity<Object> saveEstoque(@RequestBody @Valid EstoqueRecordDto dto) {
        Optional<ProdutoModel> produtoOpt = produtoRepository.findById(dto.produtoId());
        if (produtoOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Produto não encontrado");
        }

        // Verificar se já existe um registro para este produto
        Optional<EstoqueModel> estoqueExistente = estoqueRepository.findByProdutoId(dto.produtoId());

        EstoqueModel estoqueModel;
        if (estoqueExistente.isPresent()) {
            // Atualizar estoque existente
            estoqueModel = estoqueExistente.get();
            estoqueModel.setQuantidade(dto.quantidade());
            estoqueModel.setUnidade(dto.unidade());
        } else {
            // Criar novo registro de estoque
            estoqueModel = new EstoqueModel();
            estoqueModel.setProduto(produtoOpt.get());
            estoqueModel.setQuantidade(dto.quantidade());
            estoqueModel.setUnidade(dto.unidade());
        }

        return ResponseEntity.status(HttpStatus.CREATED).body(estoqueRepository.save(estoqueModel));
    }

    @GetMapping
    public ResponseEntity<List<EstoqueModel>> getAllEstoque() {
        return ResponseEntity.ok(estoqueRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Object> getEstoque(@PathVariable Long id) {
        Optional<EstoqueModel> estoqueOpt = estoqueRepository.findById(id);
        return estoqueOpt.<ResponseEntity<Object>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).body("Estoque não encontrado"));
    }

    @GetMapping("/produto/{produtoId}")
    public ResponseEntity<Object> getEstoquePorProduto(@PathVariable Long produtoId) {
        Optional<EstoqueModel> estoqueOpt = estoqueRepository.findByProdutoId(produtoId);
        return estoqueOpt.<ResponseEntity<Object>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).body("Estoque não encontrado para este produto"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Object> updateEstoque(@PathVariable Long id, @RequestBody @Valid EstoqueRecordDto dto) {
        Optional<EstoqueModel> estoqueOpt = estoqueRepository.findById(id);
        if (estoqueOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Estoque não encontrado");
        }

        Optional<ProdutoModel> produtoOpt = produtoRepository.findById(dto.produtoId());
        if (produtoOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Produto não encontrado");
        }

        EstoqueModel estoqueModel = estoqueOpt.get();
        estoqueModel.setProduto(produtoOpt.get());
        estoqueModel.setQuantidade(dto.quantidade());
        estoqueModel.setUnidade(dto.unidade());

        return ResponseEntity.status(HttpStatus.OK).body(estoqueRepository.save(estoqueModel));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Object> deleteEstoque(@PathVariable Long id) {
        Optional<EstoqueModel> estoqueOpt = estoqueRepository.findById(id);
        if (estoqueOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Estoque não encontrado");
        }
        estoqueRepository.delete(estoqueOpt.get());
        return ResponseEntity.status(HttpStatus.OK).body("Estoque excluído com sucesso!");
    }

    // Endpoint para verificar disponibilidade no estoque
    @PostMapping("/verificar")
    public ResponseEntity<Object> verificarEstoque(@RequestBody Map<String, Object> requestBody) {
        try {
            Long produtoId = Long.parseLong(requestBody.get("produtoId").toString());
            Integer quantidadeNecessaria = Integer.parseInt(requestBody.get("quantidade").toString());

            Optional<EstoqueModel> estoqueOpt = estoqueRepository.findByProdutoId(produtoId);
            if (estoqueOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("disponivel", false, "mensagem", "Produto não encontrado no estoque"));
            }

            EstoqueModel estoque = estoqueOpt.get();
            boolean disponivel = estoque.getQuantidade() >= quantidadeNecessaria;

            Map<String, Object> response = new HashMap<>();
            response.put("disponivel", disponivel);
            response.put("estoqueAtual", estoque.getQuantidade());
            response.put("unidade", estoque.getUnidade());

            if (!disponivel) {
                response.put("mensagem", "Quantidade insuficiente no estoque");
            }

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("disponivel", false, "mensagem", "Erro ao verificar estoque: " + e.getMessage()));
        }
    }

    // Endpoint para baixar estoque (quando um serviço é confirmado)
    @PostMapping("/baixar")
    public ResponseEntity<Object> baixarEstoque(@RequestBody Map<String, Object> requestBody) {
        try {
            Long produtoId = Long.parseLong(requestBody.get("produtoId").toString());
            Integer quantidadeUsada = Integer.parseInt(requestBody.get("quantidade").toString());

            Optional<EstoqueModel> estoqueOpt = estoqueRepository.findByProdutoId(produtoId);
            if (estoqueOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("sucesso", false, "mensagem", "Produto não encontrado no estoque"));
            }

            EstoqueModel estoque = estoqueOpt.get();
            if (estoque.getQuantidade() < quantidadeUsada) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("sucesso", false, "mensagem", "Quantidade insuficiente no estoque"));
            }

            // Baixar a quantidade do estoque
            estoque.setQuantidade(estoque.getQuantidade() - quantidadeUsada);
            estoqueRepository.save(estoque);

            return ResponseEntity.ok(Map.of(
                    "sucesso", true,
                    "estoqueAtual", estoque.getQuantidade(),
                    "mensagem", "Estoque atualizado com sucesso"
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("sucesso", false, "mensagem", "Erro ao baixar estoque: " + e.getMessage()));
        }
    }
}