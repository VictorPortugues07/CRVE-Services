package com.crveservices.crveservices.dto;

import jakarta.validation.constraints.*;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

public record ServicoRecordDto(
        @NotBlank String descricao,
        @NotBlank String status,
        LocalDate dataEntrega,
        @NotNull double valorMaoDeObra,
        @NotNull long funcionarioId,
        @NotNull List<Long> produtosIds,
        @NotNull Map<Long, Integer> produtosQuantidade
) {}