package com.example.demo.repository;
import com.example.demo.entity.User;
import org.springframework.data.jpa.repository.JpaRepository; //Hazır metotlar için
import org.springframework.stereotype.Repository;//Spring'e bu sınıfın görevini bildirir
import java.util.Optional;

@Repository   //Bu interface veritabanı işlemlerinden sorumlu
public interface UserRepository extends JpaRepository<User, Long> { //User tablosu ile çalışacağım ve ID tipi Long
    Optional<User> findByUsername(String username);  //Kullanıcı bulunabilir de bulunmayabilir de
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
}
