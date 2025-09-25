package com.crveservices.crveservices.repositories;

import com.crveservices.crveservices.models.ProdutoModel;
import com.crveservices.crveservices.models.ServicoModel;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ServicoRepository extends JpaRepository<ServicoModel, Long> {
    Optional<ServicoModel> findById(long id);
    Optional<ServicoModel> findAllById(long id);
}
