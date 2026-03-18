package com.futdequinta.demo.controllers;

import com.futdequinta.demo.entities.Partida;
import com.futdequinta.demo.repositories.PartidaRepository;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/partidas")
public class PartidaController {

    private final PartidaRepository repo;

    public PartidaController(PartidaRepository repo) {
        this.repo = repo;
    }

    @GetMapping
    public List<Partida> listar() {
        return repo.findAll();
    }

    @PostMapping
    public Partida criar(@RequestBody Partida partida) {
        partida.setData(LocalDateTime.now());
        return repo.save(partida);
    }

    @PutMapping("/{id}")
    public Partida atualizar(@PathVariable Long id, @RequestBody Partida atualizado) {
        return repo.findById(id)
                .map(p -> {
                    p.setGolsAzul(atualizado.getGolsAzul());
                    p.setGolsVermelho(atualizado.getGolsVermelho());
                    p.setVencedor(atualizado.getVencedor());
                    return repo.save(p);
                })
                .orElseThrow(() -> new RuntimeException("Partida não encontrada"));
    }
}