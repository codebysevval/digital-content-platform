package com.example.demo.entity;
import jakarta.persistence.*;   //veritabanı işlemleri(JPA) için gerekli kütüphane
import lombok.*;  //Getter setter için gerekli kütüphane

@Entity //Bu sınıf bir veritabanı tablosu
@Table(name = "users")
@Data //Getter,setter metotlarını otomatik oluşturur.
@NoArgsConstructor //parametresiz (JPA için zorunludur)
@AllArgsConstructor

public class User {
    @Id
    @GeneratedValue(strategy=GenerationType.IDENTITY) //ID'nin otomatik arttırılmasını sağlar
    private Long id;

    @Column(unique=true,nullable=false) //özel ve boş bırakılamaz
    private String username;

    @Column(name = "password_hash", nullable=false)
    private String password;

    @Column(nullable=false)
    private String status;

}
