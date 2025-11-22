package com.phantask.authentication.entity;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

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
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Persistent representation of an application user.
 *
 * <p>This entity contains authentication-related fields (username, password, enabled) and
 * relationships to {@link Role} and {@link UserProfile}. Passwords must be stored hashed
 * (use a PasswordEncoder before persisting) and should never be returned in API responses.
 *
 * <p>Keep security flags such as {@code enabled} and {@code firstLogin} to support account
 * activation and forced password changes.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "users")
public class User implements UserDetails {

    private static final long serialVersionUID = 7198112427597480470L;

	/**
    * Database primary key for the user.
    */
	@Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long uid;

	/**
    * Unique username used to log in.
    */
    @Column(nullable = false, unique = true)
    private String username;

	/**
    * Encoded (hashed) password. Never store plain text.
    */
    @Column(nullable = false)
    private String password;  // ❗make sure password is NOT unique

	/**
    * Email address for the user. Usually unique.
    */
    @Column(nullable = false, unique = true)
    private String email;

	/**
    * Whether the user account is enabled. Use to disable accounts without deleting them.
    */
    private boolean enabled = true;


  /**
    * Flag to indicate the user must change their password on first login.
    */
    @Column(name = "first_login", columnDefinition = "BIT(1)")
    private boolean firstLogin = true;
    
    @Column(name = "password_changed_at")
    private LocalDateTime passwordChangedAt;

	/**
    * Roles assigned to the user. Use a Set to avoid duplicate roles.
    *
    * <p>Fetch type and cascading behavior should be chosen based on your access patterns.
    */
    @ManyToMany(fetch = FetchType.EAGER, cascade = CascadeType.MERGE)
    @JoinTable(
        name = "user_roles",
        joinColumns = @JoinColumn(name = "uid"),
        inverseJoinColumns = @JoinColumn(name = "rid")
    )
    private Set<Role> roles = new HashSet<>();

	/**
    * Optional one-to-one link to a richer user profile.
    *
    * <p>Cascade type is configurable; if you want the profile to be created/removed with the user,
    * enable appropriate cascade options.
    */
    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL)
    private UserProfile profile;

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return roles.stream()
            .map(role -> new SimpleGrantedAuthority(role.getRoleName()))
            .collect(Collectors.toSet());
    }

    @Override
    public boolean isAccountNonExpired() { return true; }

    @Override
    public boolean isAccountNonLocked() { return true; }

    @Override
    public boolean isCredentialsNonExpired() { return true; }

    @Override
    public boolean isEnabled() { return enabled; }
    
    @Override
    public String getUsername() {
        return username;
    }
    
    @Override
    public String getPassword() {
        return password;
    }

}
