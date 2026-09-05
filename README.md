# 🔧 CRVE Services

Sistema de gestão para prestação de serviços, com controle de **funcionários**, **produtos**, **estoque** e
**ordens de serviço**. O projeto é um monorepo com back-end em **Spring Boot** e front-end em **HTML, CSS e
JavaScript puro** consumindo a API REST.

> 🎓 **Este foi meu primeiro projeto utilizando Spring Boot.** Foi aqui que dei os primeiros passos com API REST
> em Java, Spring Data JPA, DTOs, relacionamentos entre entidades e regras de negócio no back-end — uma base
> muito importante para os projetos que vieram depois.

## ✨ Funcionalidades

- **Funcionários**: cadastro, listagem, edição, exclusão e login simples (usuário/senha).
- **Produtos**: cadastro de produtos com nome e valor unitário.
- **Estoque**: controle de quantidade por produto, com endpoints para **verificar disponibilidade** e
  **dar baixa** automaticamente quando um serviço é concluído.
- **Serviços (ordens de serviço)**: criação de serviços vinculados a um funcionário e a uma lista de produtos,
  com verificação automática de estoque antes de permitir a conclusão do serviço.
- **Front-end**: telas de login, página inicial (serviços recentes), gerenciamento de funcionários, produtos,
  estoque, serviços e perfil do usuário.

## 🗂️ Estrutura do repositório

Este repositório reúne dois projetos (front-end e back-end) em pastas separadas:

```
CRVE-Services/
├── CRVE-Sevices-Back-master/       # API REST em Spring Boot
│   └── src/main/java/com/crveservices/crveservices/
│       ├── controllers/            # Endpoints REST (Funcionario, Produto, Estoque, Servico)
│       ├── models/                 # Entidades JPA
│       ├── dto/                    # DTOs (records) usados nas requisições
│       └── repositories/           # Repositórios Spring Data JPA
└── CRVE-Services-Front-master/     # Front-end (HTML, CSS, JS)
    ├── html/                        # Páginas (login, produtos, estoque, serviços, funcionários, perfil)
    ├── css/                         # Estilos de cada página
    └── javascript/                  # Lógica de consumo da API
```

## 🛠️ Tecnologias utilizadas

**Back-end**
- **Java 23**
- **Spring Boot 3.4.4** (`Spring Web`, `Spring Data JPA`, `Spring Validation`)
- **MySQL** (via `mysql-connector-j`)
- **Lombok**
- **Maven**

**Front-end**
- **HTML5**, **CSS3**, **JavaScript (Vanilla)**
- Consumo da API via `fetch`

## 📐 Modelo de dados

- **Funcionario** — nome, e-mail e senha (usado no login).
- **Produto** — nome e valor unitário.
- **Estoque** — vinculado a um produto, com quantidade e unidade de medida (ex: unidade, kg, litro).
- **Servico** — descrição, status (`nao-iniciado`, `andamento`, `concluido`), data de entrega, valor de mão de
  obra, funcionário responsável e uma lista de produtos com suas respectivas quantidades utilizadas.

Quando um serviço é marcado como **concluído**, o back-end verifica automaticamente se há estoque suficiente
para todos os produtos vinculados e, se houver, dá baixa nas quantidades utilizadas.

## 🚀 Principais endpoints da API

| Recurso | Rota base | Observações |
| :--- | :--- | :--- |
| Funcionários | `/funcionario` | CRUD + `POST /funcionario/login` |
| Produtos | `/produto` | CRUD completo |
| Estoque | `/estoque` | CRUD + `POST /estoque/verificar` e `POST /estoque/baixar` |
| Serviços | `/servico` | CRUD com validação automática de estoque |

## ⚙️ Como executar

### Pré-requisitos
- Java 23+
- Maven (ou usar o wrapper `mvnw` incluído no projeto)
- MySQL rodando localmente

### 1. Configurar o banco de dados

Crie um banco MySQL chamado `crveservices` (o Spring cria as tabelas automaticamente via
`spring.jpa.hibernate.ddl-auto=update`). As credenciais padrão estão em
`CRVE-Sevices-Back-master/src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/crveservices
spring.datasource.username=root
spring.datasource.password=root
server.port=8081
```

> Ajuste usuário/senha conforme a configuração do seu MySQL local.

### 2. Rodar o back-end

```bash
cd CRVE-Sevices-Back-master
./mvnw spring-boot:run
```

A API ficará disponível em `http://localhost:8081`.

### 3. Rodar o front-end

O front-end é estático (HTML/CSS/JS), sem necessidade de build. Basta abrir o arquivo
`CRVE-Services-Front-master/html/login.html` no navegador (ou servir a pasta com uma extensão como o
*Live Server* do VS Code).

## 👤 Autor

Desenvolvido por [Victor Portugues](https://github.com/VictorPortugues07).
