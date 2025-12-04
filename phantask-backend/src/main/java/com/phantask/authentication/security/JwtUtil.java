package com.phantask.authentication.security;

import java.security.Key;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;

/*
 * JwtUtil handles everything related to JWT tokens in the application:
 *
 * 1. It creates two kinds of tokens:
 *      - ACCESS token: short-lived (15 min), contains username + roles.
 *      - REFRESH token: long-lived (12 hrs), contains only username.
 *
 * 2. ACCESS tokens include user roles because they are used for authorization
 *    on every API request.
 *    REFRESH tokens do NOT include roles for security reasons and are used
 *    only to fetch a new access token when it expires.
 *
 * 3. Both tokens include a custom "type" claim:
 *          "ACCESS"  → for normal authenticated requests
 *          "REFRESH" → for generating new access tokens
 *
 * 4. The utility can:
 *      - parse tokens and extract claims
 *      - get username, token type, roles, and expiration time
 *      - validate tokens and check if they are expired
 *
 * 5. The signing key comes from the `jwt.secret` property in application.properties.
 *    HS256 algorithm is used to sign the tokens.
 *
 * Overall flow:
 *      User logs in → UI receives access + refresh tokens → UI uses access token
 *      for API calls → When access token expires → UI calls /refresh-token with
 *      refresh token → server generates a new access token.
 */

@Component
public class JwtUtil {

    private final long ACCESS_TOKEN_EXP = 1000 * 60 * 5;          // 5 minutes for testing
    private final long REFRESH_TOKEN_EXP = 1000 * 60 * 60 * 12;   // 12 hours for testing

    @Value("${jwt.secret}")
    private String SECRET;

    private Key getSigningKey() {
        return Keys.hmacShaKeyFor(SECRET.getBytes());
    }

    // -------------------- Token Generation --------------------

    public String generateAccessToken(UserDetails userDetails) {
        return generateToken(userDetails, "ACCESS", ACCESS_TOKEN_EXP, true);
    }

    //modified refresh-token to not hold roles
    public String generateRefreshToken(UserDetails userDetails) {
        return generateToken(userDetails, "REFRESH", REFRESH_TOKEN_EXP, false);
    }

    private String generateToken(UserDetails userDetails, String type, long expMillis, boolean includeRoles) {
        Claims claims = Jwts.claims().setSubject(userDetails.getUsername());
        claims.put("type", type);
        
        if (includeRoles) {
            List<String> roles = userDetails.getAuthorities().stream()
                    .map(auth -> auth.getAuthority())
                    .collect(Collectors.toList());
            claims.put("roles", roles);
        }

        long now = System.currentTimeMillis();
        return Jwts.builder()
                .setClaims(claims)
                .setIssuedAt(new Date(now))
                .setExpiration(new Date(now + expMillis))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    public Claims getClaims(String token) throws JwtException {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    // -------------------- Token Parsing --------------------
    
    public String extractUsername(String token) throws JwtException {
        return getClaims(token).getSubject();
    }

    public String extractTokenType(String token) throws JwtException {
        return (String) getClaims(token).get("type");
    }

    @SuppressWarnings("unchecked")
    public List<String> extractRoles(String token) throws JwtException {
        Claims claims = getClaims(token);
        Object roles = claims.get("roles");
        return roles == null ? List.of() : (List<String>) roles;
    }

    public Date extractExpiration(String token) throws JwtException {
        return getClaims(token).getExpiration();
    }

    // -------------------- Token Validation --------------------

    public boolean isTokenExpired(String token) throws ExpiredJwtException {
        return extractExpiration(token).before(new Date());
    }

    public boolean isTokenValid(String token, UserDetails userDetails) throws JwtException {
        final String username = extractUsername(token);
        return username.equals(userDetails.getUsername()) && !isTokenExpired(token);
    }

    public boolean isRefreshToken(String token) throws JwtException {
        return "REFRESH".equals(extractTokenType(token));
    }

    public boolean isAccessToken(String token) throws JwtException {
        return "ACCESS".equals(extractTokenType(token));
    }
}
