package com.crveservices.crveservices.repositories;

import com.crveservices.crveservices.models.FuncionarioModel;
import com.crveservices.crveservices.models.ProdutoModel;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ProdutoRepository extends JpaRepository<ProdutoModel, Long> {
    Optional<ProdutoModel> findById(long id);

    Optional<ProdutoModel> findAllById(long id);
}
