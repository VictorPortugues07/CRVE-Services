package com.crveservices.crveservices.dto;


import jakarta.validation.constraints.NotNull;

public record FuncionarioRecordDto(@NotNull String nmFuncionario, @NotNull String dsEmail, @NotNull String dsSenha) {

}
