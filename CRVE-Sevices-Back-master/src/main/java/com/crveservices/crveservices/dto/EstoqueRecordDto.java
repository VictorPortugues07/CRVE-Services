package com.crveservices.crveservices.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record EstoqueRecordDto(
        @NotNull Long produtoId,
        @NotNull @Min(0) Integer quantidade,
        @NotBlank String unidade
) {}
