package com.phantask.authentication.entity;

import com.fasterxml.jackson.annotation.JsonManagedReference;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Lob;
import jakarta.persistence.MapsId;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Additional profile information for a {@link User}.
 *
 * <p>
 * This entity stores non-security personal information such as first name, last
 * name, phone number and other fields that are safe to display in the UI. Keep
 * profile data separated from authentication fields for better separation of
 * concerns.
 * </p>
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
	 * <p>
	 * Mapped as a bidirectional OneToOne with {@link User}. This field is typically
	 * the owning or inverse side depending on mapping; adjust {@code mappedBy} in
	 * User accordingly.
	 * </p>
	 */
	@OneToOne(fetch = FetchType.LAZY)
	@MapsId
	@JoinColumn(name = "uid")
	@JsonManagedReference
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

	@Lob
	@Column(name = "profile_pic", columnDefinition = "LONGBLOB")
	private byte[] profilePic;

	private String yearOfStudy;
}
