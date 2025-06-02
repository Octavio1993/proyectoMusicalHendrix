package com.example.instrumentos.repository;

import com.example.instrumentos.model.Rol;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RolRepository extends JpaRepository<Rol, Long> {
    Optional<Rol> findByDefinicion(String definicion);
    boolean existsByDefinicion(String definicion);
}
