package com.sochen.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

/**
 * Resolves {@code upload.dir} to an absolute path so uploads stay under
 * {@code sochen-backend/data/uploads} whether the JVM is started from the repo root
 * or from the {@code sochen-backend} module directory.
 */
@Configuration
public class UploadDirectoryConfiguration {

    private static final Logger log = LoggerFactory.getLogger(UploadDirectoryConfiguration.class);

    @Bean
    public Path uploadRoot(@Value("${upload.dir}") String configured) throws IOException {
        Path p = Paths.get(configured.trim());
        if (!p.isAbsolute()) {
            Path cwd = Paths.get(System.getProperty("user.dir", ".")).toAbsolutePath().normalize();
            Path nestedBackend = cwd.resolve("sochen-backend");
            if (Files.isDirectory(nestedBackend) && Files.exists(nestedBackend.resolve("pom.xml"))) {
                cwd = nestedBackend;
            }
            p = cwd.resolve(p).normalize();
        }
        Files.createDirectories(p);
        log.info("Upload directory (absolute): {}", p);
        return p;
    }
}
