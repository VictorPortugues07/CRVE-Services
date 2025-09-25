package com.crveservices.crveservices.controllers;

import com.crveservices.crveservices.models.FuncionarioModel;
import com.crveservices.crveservices.dto.FuncionarioRecordDto;
import com.crveservices.crveservices.repositories.FuncionarioRepository;
import jakarta.validation.Valid;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/funcionario")
public class FuncionarioController {

    @Autowired
    FuncionarioRepository funcionarioRepository;

    @PostMapping("/login")
    public ResponseEntity<Object> loginFuncionario(@RequestBody Map<String, String> credentials) {
        String nmFuncionario = credentials.get("nmFuncionario");
        String dsSenha = credentials.get("dsSenha");

        if (nmFuncionario == null || dsSenha == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Nome de usuário e senha são obrigatórios"));
        }

        Optional<FuncionarioModel> funcionario = funcionarioRepository.findByNmFuncionario(nmFuncionario);

        if (funcionario.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Usuário não encontrado"));
        }

        if (!funcionario.get().getDsSenha().equals(dsSenha)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Senha incorreta"));
        }

        String token = UUID.randomUUID().toString();

        FuncionarioModel funcionarioResponse = new FuncionarioModel();
        funcionarioResponse.setId(funcionario.get().getId());
        funcionarioResponse.setNmFuncionario(funcionario.get().getNmFuncionario());
        funcionarioResponse.setDsEmail(funcionario.get().getDsEmail());
        funcionarioResponse.setDsSenha(funcionario.get().getDsSenha());

        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        response.put("funcionario", funcionarioResponse);

        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<FuncionarioModel> saveFuncionario(@RequestBody @Valid FuncionarioRecordDto funcionarioRecordDto) {
        var funcionarioModel = new FuncionarioModel();
        BeanUtils.copyProperties(funcionarioRecordDto, funcionarioModel);
        return ResponseEntity.status(HttpStatus.CREATED).body(funcionarioRepository.save(funcionarioModel));
    }

    @GetMapping
    public ResponseEntity<List<FuncionarioModel>> getAllFuncionarios() {
        List<FuncionarioModel> funcionarios = funcionarioRepository.findAll();
        // Por segurança, não queremos retornar as senhas dos funcionários
        funcionarios.forEach(f -> f.setDsSenha(""));
        return ResponseEntity.status(HttpStatus.OK).body(funcionarios);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Object> getOneFuncionario(@PathVariable(value="id") Long id) {
        Optional<FuncionarioModel> funcionario = funcionarioRepository.findById(id);
        if(funcionario.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Funcionário não encontrado");
        }
        // Por segurança, não queremos retornar a senha
        FuncionarioModel funcionarioResponse = funcionario.get();
        funcionarioResponse.setDsSenha("");
        return ResponseEntity.status(HttpStatus.OK).body(funcionarioResponse);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Object> updateFuncionario(@PathVariable(value = "id") Long id,
                                                    @RequestBody @Valid FuncionarioRecordDto funcionarioRecordDto) {
        Optional<FuncionarioModel> funcionarioOpt = funcionarioRepository.findById(id);
        if(funcionarioOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Funcionário não encontrado");
        }
        var funcionarioModel = funcionarioOpt.get();
        BeanUtils.copyProperties(funcionarioRecordDto, funcionarioModel);
        return ResponseEntity.status(HttpStatus.OK).body(funcionarioRepository.save(funcionarioModel));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Object> deleteFuncionario(@PathVariable(value = "id") Long id) {
        Optional<FuncionarioModel> funcionarioOpt = funcionarioRepository.findById(id);
        if (funcionarioOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Funcionário não encontrado");
        }
        funcionarioRepository.delete(funcionarioOpt.get());
        return ResponseEntity.status(HttpStatus.OK).body("Funcionário excluído com sucesso!");
    }
}