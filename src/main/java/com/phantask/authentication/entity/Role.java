package com.phantask.authentication.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Represents a security role or authority assigned to users.
 *
 * <p>Roles define granted authorities (for example "ADMIN", "STUDENT", "FACULTY") that
 * are used by Spring Security to authorize access to protected resources. Keep role names
 * stable and avoid changing them once they are in use.
 *
 * <p>This entity is intentionally simple; if your application needs permissions beyond
 * role names, consider adding a separate Permission entity or storing structured claims.
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
     * <p>Do not include the "ROLE_" prefix unless your security configuration expects it;
     * be consistent across the application.
     */
	@Column(unique=true)
	private String roleName; 
}


