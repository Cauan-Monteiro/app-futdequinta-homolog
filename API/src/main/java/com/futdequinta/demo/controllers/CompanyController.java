package com.futdequinta.demo.controllers;

import com.futdequinta.demo.entities.Company;
import com.futdequinta.demo.repositories.CompanyRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/company")
public class CompanyController {
    private CompanyRepository repo;

    public CompanyController(CompanyRepository repo) {
        this.repo = repo;
    }

    @GetMapping
    public List<Company> listar() {
        return repo.findAll();
    }

    @PostMapping
    public Company salvar(@RequestBody Company company) {
        return repo.save(company);
    }

}
