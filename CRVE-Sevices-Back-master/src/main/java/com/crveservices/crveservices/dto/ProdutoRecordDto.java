package com.crveservices.crveservices.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record ProdutoRecordDto(
        @NotBlank String nmProduto,
        @NotNull double nuValorUnitario
) {}
