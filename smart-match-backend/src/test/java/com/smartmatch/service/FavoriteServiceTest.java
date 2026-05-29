package com.smartmatch.service;

import com.smartmatch.exception.ConflictException;
import com.smartmatch.model.Offer;
import com.smartmatch.model.User;
import com.smartmatch.model.enums.OfferStatus;
import com.smartmatch.model.enums.Plan;
import com.smartmatch.model.enums.Role;
import com.smartmatch.repository.FavoriteRepository;
import com.smartmatch.repository.OfferRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class FavoriteServiceTest {
    @Mock
    private FavoriteRepository favoriteRepository;
    @Mock
    private OfferRepository offerRepository;
    @Mock
    private OfferService offerService;

    @InjectMocks
    private FavoriteService favoriteService;

    @AfterEach
    void tearDown() {
        TestSecurityContext.clear();
    }

    @Test
    void candidateCannotFavoriteSameOfferTwice() {
        User candidate = User.builder().id("candidate-1").role(Role.CANDIDATE).plan(Plan.FREE).active(true).build();
        TestSecurityContext.setCurrentUser(candidate);
        Offer offer = Offer.builder().id("offer-1").status(OfferStatus.PUBLISHED).build();

        when(offerRepository.findById("offer-1")).thenReturn(Optional.of(offer));
        when(favoriteRepository.existsByUserIdAndOfferId("candidate-1", "offer-1")).thenReturn(true);

        assertThatThrownBy(() -> favoriteService.addFavorite("offer-1"))
                .isInstanceOf(ConflictException.class)
                .hasMessageContaining("already in favorites");
    }
}
