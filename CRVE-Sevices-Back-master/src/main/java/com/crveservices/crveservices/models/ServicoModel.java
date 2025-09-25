package com.crveservices.crveservices.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
public class ServicoModel implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    private String descricao;

    private String status; // "nao-iniciado", "andamento", "concluido"

    private LocalDate dataEntrega;

    private double valorMaoDeObra;

    @ManyToOne
    @JoinColumn(name = "funcionario_id")
    private FuncionarioModel funcionario;

    @ManyToMany
    @JoinTable(
            name = "servico_produto",
            joinColumns = @JoinColumn(name = "servico_id"),
            inverseJoinColumns = @JoinColumn(name = "produto_id")
    )
    private List<ProdutoModel> produtos;

    // Para armazenar a quantidade de cada produto
    @ElementCollection
    @CollectionTable(name = "servico_produto_quantidade",
            joinColumns = @JoinColumn(name = "servico_id"))
    @MapKeyColumn(name = "produto_id")
    @Column(name = "quantidade")
    private Map<Long, Integer> produtosQuantidade;
}