package com.phantask.authentication.entity;

import java.util.HashSet;
import java.util.Set;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Represents a security role or authority assigned to users.
 *
 * <p>
 * Roles define granted authorities (for example "ADMIN", "STUDENT", "FACULTY")
 * that are used by Spring Security to authorize access to protected resources.
 * Keep role names stable and avoid changing them once they are in use.
 * </p>
 *
 * <p>
 * This entity is intentionally simple; if your application needs permissions
 * beyond role names, consider adding a separate Permission entity or storing
 * structured claims.
 * </p>
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "roles")
public class Role {

    /**
     * Database primary key for the role.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long rid;

    /**
     * The unique name of the role (for example "STUDENT", "ADMIN").
     *
     * <p>
     * Do not include the "ROLE_" prefix unless your security configuration expects
     * it; be consistent across the application.
     * </p>
     */
    @Column(nullable = false, unique = true)
    private String roleName;
    
    @ManyToMany(mappedBy = "roles")
    @JsonIgnore
    private Set<User> users = new HashSet<>();
    
    //DEBUG
    @Override
    public String toString() {
        return "Role{id=" + rid + ", name='" + roleName + "'}";
    }

    //If you need to fetch users from roles
    public void addUser(User user) {
        this.users.add(user);
        user.getRoles().add(this);
    }


}
