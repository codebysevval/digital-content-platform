package com.example.demo.controller;
import com.example.demo.eninty.User;
import com.example.demo.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/users") //Bu controller'daki tüm uçlar  "/api/users" ile başlayacak
@RequiredArgsConstructor

public class UserController {
    private final UserService userService;
    @GetMapping
    public List <User> getAllUsers(){
        return userService.getAllUsers();
    }
    @PostMapping
    public User createUser(@RequestBody User user){
        return userService.saveUser(user);
    }
    @GetMapping("/{username}")
    public User getUserByUsername(@PathVariable String username){
        return userService.findByUsername(username);
    }

}
