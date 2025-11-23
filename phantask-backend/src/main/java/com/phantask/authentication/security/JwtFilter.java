package com.phantask.authentication.security;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.phantask.authentication.service.api.IUserService;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.io.IOException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

/**
 * Servlet filter that inspects incoming HTTP requests for JWT tokens and sets authentication.
 *
 * <p>This filter:
 * <ol>
 *   <li>Extracts the token from the Authorization header (typically "Bearer &lt;token&gt;")</li>
 *   <li>Validates the token using {@link JwtUtils}</li>
 *   <li>If valid, loads user details and sets the Spring Security {@code Authentication} in the context</li>
 * </ol>
 *
 * <p>Implement as a OncePerRequestFilter so the token is processed exactly once per request.
 */
@Component
@RequiredArgsConstructor
public class JwtFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final IUserService userService;

	/**
     * Extract and validate token from the request, and populate SecurityContext on success.
     *
     * @param request the incoming HTTP request
     * @param response the HTTP response
     * @param filterChain the remaining filter chain
     * @throws ServletException on general servlet error
     * @throws IOException on I/O error
     */
	@Override
    protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res, FilterChain chain)
        throws ServletException, IOException, java.io.IOException {

		String path = req.getServletPath();
	    if (path.startsWith("/api/auth/")) {
	        chain.doFilter(req, res);
	        return;
	    }
	    
        String header = req.getHeader("Authorization");
        String username = null;
        String token = null;

        if (header != null && header.startsWith("Bearer ")) {
            token = header.substring(7);
            try {
            	username = jwtUtil.extractUsername(token);           	
            }catch(ExpiredJwtException e)
            {
            	res.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                res.getWriter().write("Token expired, please login again");
                return;
            }
            
        }

        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            UserDetails userDetails = userService.loadUserByUsername(username);
            if (jwtUtil.isTokenValid(token, userDetails)) {
                UsernamePasswordAuthenticationToken authToken =
                        new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(req));
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }
        chain.doFilter(req, res);
    }
}


