package com.smartmatch.controller;

import com.smartmatch.dto.favorite.FavoriteResponse;
import com.smartmatch.service.FavoriteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/favorites")
@RequiredArgsConstructor
@PreAuthorize("hasRole('CANDIDATE')")
public class FavoriteController {
    private final FavoriteService favoriteService;

    @PostMapping("/{offerId}")
    public ResponseEntity<FavoriteResponse> addFavorite(@PathVariable String offerId) {
        return ResponseEntity.status(HttpStatus.CREATED).body(favoriteService.addFavorite(offerId));
    }

    @DeleteMapping("/{offerId}")
    public ResponseEntity<Void> removeFavorite(@PathVariable String offerId) {
        favoriteService.removeFavorite(offerId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/me")
    public ResponseEntity<List<FavoriteResponse>> getMyFavorites() {
        return ResponseEntity.ok(favoriteService.getCurrentCandidateFavorites());
    }
}
