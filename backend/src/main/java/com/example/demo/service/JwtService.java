package com.example.demo.service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Service
public class JwtService {

    // 1. GİZLİ ANAHTAR (SECRET KEY):
    // Bu anahtar projenin namusudur. Sadece sunucu bilir.
    // Token bu anahtarla imzalanır, başkası taklit edemez.
    // (En az 256 bitlik rastgele bir string olmalı)
    private static final String SECRET_KEY = "QkNnU2pQMUJIQmppUW5xN0dYN2N0cW5JWVMzSklQNVVYd0N2a3VrdDdSYw==";

    /**
     * TOKEN ÜRETME (Generate Token):
     * Kullanıcı adı ve şifresiyle başarıyla giriş yaptığında ona bu anahtarı veririz.
     */
    public String generateToken(String username) {
        Map<String, Object> claims = new HashMap<>(); // Token içine extra bilgi koymak istersen buraya eklersin.

        return Jwts.builder()
                .setClaims(claims)
                .setSubject(username) // Token kimin için? (Kullanıcı adı)
                .setIssuedAt(new Date(System.currentTimeMillis())) // Ne zaman oluşturuldu?
                .setExpiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60 * 24)) // 24 saat geçerli olsun.
                .signWith(getSignInKey(), SignatureAlgorithm.HS256) // HS256 algoritmasıyla imzala.
                .compact(); // Hepsini birleştirip string yap.
    }

    /**
     * TOKEN DOĞRULAMA (Validate Token):
     * Gelen anahtarın süresi geçmiş mi veya ismi doğru mu?
     */
    public boolean isTokenValid(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        // Token'daki isim ile veritabanındaki isim aynı mı VE süresi geçmemiş mi?
        return (username.equals(userDetails.getUsername())) && !isTokenExpired(token);
    }

    /**
     * TOKEN İÇİNDEN KULLANICI ADINI ALMA:
     * Gelen karmaşık string'in içinden "Bu kimin anahtarı?" bilgisini söker alır.
     */
    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    // --- YARDIMCI METOTLAR (Sadece bu sınıf içinde kullanılır) ---

    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    private Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSignInKey()) // Bizim gizli anahtarımızla açmayı dene.
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    private Key getSignInKey() {
        byte[] keyBytes = Decoders.BASE64.decode(SECRET_KEY);
        return Keys.hmacShaKeyFor(keyBytes);
    }
}
