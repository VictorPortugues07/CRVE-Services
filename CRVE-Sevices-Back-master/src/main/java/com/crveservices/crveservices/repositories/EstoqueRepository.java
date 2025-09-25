package com.crveservices.crveservices.repositories;

import com.crveservices.crveservices.models.EstoqueModel;
import com.crveservices.crveservices.models.ProdutoModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EstoqueRepository extends JpaRepository<EstoqueModel, Long> {
    Optional<EstoqueModel> findByProduto(ProdutoModel produto);
    Optional<EstoqueModel> findByProdutoId(long produtoId);
}
