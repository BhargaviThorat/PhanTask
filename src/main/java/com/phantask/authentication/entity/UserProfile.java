package com.phantask.authentication.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * Additional profile information for a {@link User}.
 *
 * <p>This entity stores non-security personal information such as first name, last name,
 * phone number and other fields that are safe to display in the UI. Keep profile data
 * separated from authentication fields for better separation of concerns.
 */
@Entity
@Table(name = "user_profiles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UserProfile {

    /**
     * Primary key for the profile.
     */
    @Id
    private Long userId; 

    /**
     * The user that owns this profile.
     *
     * <p>Mapped as a bidirectional OneToOne with {@link User}. This field is typically the owning
     * or inverse side depending on mapping; adjust {@code mappedBy} in User accordingly.
     */
    @OneToOne(fetch = FetchType.LAZY)
    @MapsId     
    @JoinColumn(name = "uid")
    private User user;

    /**
     * User's given name.
     */
    private String fullName;
    private String department;
    /**
     * Optional phone number for contact.
     */
    private String phone;
    private String photoUrl;
    private String yearOfStudy;
}
