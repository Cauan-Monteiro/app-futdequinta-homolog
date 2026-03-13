package com.futdequinta.demo.controllers;


import com.futdequinta.demo.entities.Usuario;
import com.futdequinta.demo.repositories.UsuarioRepository;
import com.futdequinta.demo.security.TokenService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/usuarios")
@CrossOrigin(origins = "http://localhost")
public class UsuarioController {
    private UsuarioRepository repo;

    @Autowired
    TokenService tokenService;

    public UsuarioController(UsuarioRepository usuarioRepository) {
        this.repo = usuarioRepository;
    }

    @GetMapping
    public List<Usuario> findAll() {
        return repo.findAll();
    }

    @PostMapping
    public Usuario save(@RequestBody Usuario usuario) {
        return repo.save(usuario);
    }

    @PutMapping("/{id}")
    public Usuario atualizar(@PathVariable Long id, @RequestBody Usuario atualizado) {
        return repo.findById(id)
                .map(u -> {
                    u.setNome(atualizado.getNome());
                    u.setEmail(atualizado.getEmail());
                    u.setSenha(atualizado.getSenha());
                    u.setIdJogador(atualizado.getIdJogador());
                    return repo.save(u);
                })
                .orElseThrow(() -> new RuntimeException("Usuario não encontrado"));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Usuario user) {
        Usuario usuarioEncontrado = repo.findByEmail(user.getEmail());

        if (usuarioEncontrado == null) {
            return ResponseEntity.status(404).body("Não Encontrado");
        }
        if (!(usuarioEncontrado.getSenha().equals(user.getSenha()))) {
            return ResponseEntity.status(401).body("Login Invalido");
        }

        String token = tokenService.gerarToken(usuarioEncontrado);


        return ResponseEntity.status(200).body(token);
    }
}
