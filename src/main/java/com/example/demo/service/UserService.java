package com.example.demo.service;
import com.example.demo.entity.User;
import com.example.demo.repository.UserRepository;
import lombok.RequiredArgsConstructor; //Final olan değişkenleri otomatik enjekte eder
import org.springframework.stereotype.Service;//Spring'e bu sınıfın bir servis olduğunu belirtir

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository; //userRepository tanımladık

    public List<User> getAllUsers(){
        return userRepository.findAll(); //Aranan kullanıcıyı bulur ve geri döner
    }
    public User saveUser(User user){
        return userRepository.save(user);
    }

    public User findByUsername(String username){
        return  userRepository.findByUsername(username)
                .orElseThrow(()->new RuntimeException("Kullanıcı bulunamadı:"+username));
    }
}
