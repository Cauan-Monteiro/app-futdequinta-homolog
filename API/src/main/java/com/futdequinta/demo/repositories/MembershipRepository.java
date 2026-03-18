package com.futdequinta.demo.repositories;

import com.futdequinta.demo.entities.Membership;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface MembershipRepository extends JpaRepository<Membership,Long> {
    Optional<Membership> findByUsuarioIdAndTimeId(Long usuarioId, Long timeId);
}
