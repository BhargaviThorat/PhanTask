package com.phantask.authentication.entity;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Persistent representation of an application user.
 *
 * <p>
 * This entity contains authentication-related fields (username, password,
 * enabled) and relationships to {@link Role} and {@link UserProfile}. Passwords
 * must be stored hashed (use a PasswordEncoder before persisting) and should
 * never be returned in API responses.
 * </p>
 *
 * <p>
 * Keep security flags such as {@code enabled} and {@code firstLogin} to support
 * account activation and forced password changes.
 * </p>
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "users")
public class User implements UserDetails {

	private static final long serialVersionUID = 7198112427597480470L;

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long uid;

	@NotBlank
	@Column(nullable = false, unique = true)
	private String username;

	@Column(nullable = false)
	@JsonIgnore
	private String password;

	@Email
	@Column(nullable = false, unique = true)
	private String email;

	//Using soft-delete
	private boolean enabled = true;

	@Column(name = "first_login", columnDefinition = "BIT(1)")
	private boolean firstLogin = true;

	@Column(name = "password_changed_at")
	private LocalDateTime passwordChangedAt;

	// added audit fields
	@Column(name = "created_at")
	private LocalDateTime createdAt;

	@Column(name = "updated_at")
	private LocalDateTime updatedAt;

	@Column(name = "deactivated_at")
	private LocalDateTime deactivatedAt;
	
	@PrePersist
	protected void onCreate() {
		this.createdAt = LocalDateTime.now();
		this.updatedAt = LocalDateTime.now();
	}

	@PreUpdate
	protected void onUpdate() {
		this.updatedAt = LocalDateTime.now();
	}

	/*This user entity has a many-to-many relationship with roles, meaning a user can have multiple roles and each role can 
	 * be assigned to multiple users.The relationship is stored in a separate join table (user_roles) that links users and roles.
	 * Roles are loaded eagerly so that authorization information is available immediately during authentication.
	 * A Set is used to ensure that the same role is not assigned more than once to a user.*/	
	@ManyToMany(fetch = FetchType.EAGER, cascade = CascadeType.MERGE)
	@JoinTable(name = "user_roles", joinColumns = @JoinColumn(name = "uid"), inverseJoinColumns = @JoinColumn(name = "rid"))
	private Set<Role> roles = new HashSet<>();

	/*Each user can have one associated profile containing additional personal information.
	 * This is a one-to-one relationship where the profile depends on the user.
	 * All operations on the user (create, update, delete) are automatically cascaded to the profile.
	 * JSON back-referencing is used to prevent infinite recursion during API responses.*/	
	@OneToOne(mappedBy = "user", cascade = CascadeType.ALL)
	@JsonBackReference
	private UserProfile profile;

	// Helper methods
	public void setProfile(UserProfile profile) {
		this.profile = profile;
		if (profile != null) {
			profile.setUser(this);
		}
	}

	public void addRole(Role role) {
		this.roles.add(role);
		role.getUsers().add(this);
	}

	public void removeRole(Role role) {
		this.roles.remove(role);
		role.getUsers().remove(this);
	}

	@Override
	public Collection<? extends GrantedAuthority> getAuthorities() {
		return roles.stream().map(role -> new SimpleGrantedAuthority(role.getRoleName())).collect(Collectors.toSet());
	}

	//Temporary contractor access
	@Override
	public boolean isAccountNonExpired() {
		return true;
	}

	@Override
	public boolean isAccountNonLocked() {
		return true;
	}

	@Override
	public boolean isCredentialsNonExpired() {
		return true;
	}

	//required
	@Override
	public boolean isEnabled() {
		return enabled;
	}

	@Override
	public String getUsername() {
		return username;
	}

	@Override
	public String getPassword() {
		return password;
	}
}
