package com.crveservices.crveservices.controllers;

import com.crveservices.crveservices.dto.ProdutoRecordDto;
import com.crveservices.crveservices.models.ProdutoModel;
import com.crveservices.crveservices.repositories.ProdutoRepository;
import jakarta.validation.Valid;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/produto")
public class ProdutoController {

    @Autowired
    ProdutoRepository produtoRepository;

    @PostMapping
    public ResponseEntity<ProdutoModel> saveProduto(@RequestBody @Valid ProdutoRecordDto dto) {
        var model = new ProdutoModel();
        BeanUtils.copyProperties(dto, model);
        return ResponseEntity.status(HttpStatus.CREATED).body(produtoRepository.save(model));
    }

    @GetMapping
    public ResponseEntity<List<ProdutoModel>> getAllProdutos() {
        return ResponseEntity.ok(produtoRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Object> getProduto(@PathVariable Long id) {
        Optional<ProdutoModel> produto = produtoRepository.findById(id);
        return produto.<ResponseEntity<Object>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).body("Produto não encontrado"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Object> updateProduto(@PathVariable Long id, @RequestBody @Valid ProdutoRecordDto dto) {
        Optional<ProdutoModel> produtoOpt = produtoRepository.findById(id);
        if (produtoOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Produto não encontrado");
        }

        ProdutoModel produtoModel = produtoOpt.get();
        produtoModel.setNmProduto(dto.nmProduto());
        produtoModel.setNuValorUnitario(dto.nuValorUnitario());

        return ResponseEntity.status(HttpStatus.OK).body(produtoRepository.save(produtoModel));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Object> deleteProduto(@PathVariable Long id) {
        Optional<ProdutoModel> produtoOpt = produtoRepository.findById(id);
        if (produtoOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Produto não encontrado");
        }
        produtoRepository.delete(produtoOpt.get());
        return ResponseEntity.status(HttpStatus.OK).body("Produto excluído com sucesso!");
    }
}