Use Case 1: Login (with first-login / password change check)
------------------------------------------------------------
Title: Force password change on first login

Actors:
------
 Primary Actor: Admin
 System: Authentication Service

Preconditions:
--------------
 1.User exists in the database
 2.User’s first_login flag is 1 (or true)

Flow:
-----
 1.User sends a POST /api/auth/login request with username & password.
 2.System authenticates the user.
 3.System checks first_login flag:
   If true, respond with requirePasswordChange: true
   If false, respond with JWT tokens and user roles.

Postconditions:
---------------
 User is either prompted to change password (first login) or successfully logged in.

Execute login request with curl:
curl -v -X POST http://localhost:8080/api/auth/login \
-H "Content-Type: application/json" \
-d '{
  "username": "admin",
  "password": "Admin@123"
}'

Output1:
-------
< HTTP/1.1 200 
< X-Content-Type-Options: nosniff
< X-XSS-Protection: 0
< Cache-Control: no-cache, no-store, max-age=0, must-revalidate
< Pragma: no-cache
< Expires: 0
< X-Frame-Options: DENY
< Content-Type: application/json
< Transfer-Encoding: chunked
< Date: Fri, 21 Nov 2025 23:42:07 GMT
 
{"requirePasswordChange":true,"message":"Password change required before login"}


Output2:
-------
{"role":["ADMIN"],
"refreshToken":"eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhZG1pbiIsImlhdCI6MTc2Mzc2MDI4MiwiZXhwIjoxNzY0MzY1MDgyfQ.FIwVWuwC_cd0R0fVr0E0BnUVyHz6IPjfJ8u0NfDQEiI",
"token":"eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhZG1pbiIsImlhdCI6MTc2Mzc2MDI4MiwiZXhwIjoxNzYzNzYzODgyfQ.3lu425aoyskgH5EO9y_HnoqfGckhLqiLT-s1A2N4xrE",
"requirePasswordChange":false
}


Use Case 2: Refresh JWT Access Token
------------------------------------
Title: Extend user session by refreshing access token using a refresh token.

Actors:
-------
 Primary Actor: Authenticated User (with valid refresh token)
 System: Authentication Service (Spring Boot + JWT)

Preconditions:
--------------
 1.User is already registered and exists in the database.
 2.User has a valid refresh token issued from a prior login.
 3.Refresh token has not expired.

Postconditions:
--------------
 1.A new access token is issued.
 2.Old refresh token remains valid (optional: can rotate refresh token if implemented).

Description / Flow:
------------------
 1.User sends a POST request to /api/auth/refresh-token with the refresh token.
 2.System extracts the username from the refresh token.
 3.System loads user details from the database.
 4.System validates the refresh token for integrity and expiration.
 5.System generates a new access token.
 6.System returns the new access token to the user.

Execute refresh-token request with curl:
curl -v -X POST http://localhost:8080/api/auth/refresh-token \
-H "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhZG1pbiIsImlhdCI6MTc2Mzc2MDI4MiwiZXhwIjoxNzY0MzY1MDgyfQ.FIwVWuwC_cd0R0fVr0E0BnUVyHz6IPjfJ8u0NfDQEiI"

Output:
------
{"token":"eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhZG1pbiIsImlhdCI6MTc2Mzc2Mjg0NSwiZXhwIjoxNzYzNzY2NDQ1fQ.ErpVHRGqpuVq0IiyIcHlYpQELX6mOU6OJxOjemtamQA"}

Exceptions / Alternate Flows:
-----------------------------
 1.Invalid token: System responds with 401 Unauthorized.

 2.Expired token: System responds with 401 Unauthorized and message “Refresh token expired. Please login again.”

 Execute refresh-token request with curl:
 curl -v -X POST http://localhost:8080/api/auth/refresh-token \
 -H "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhZG1pbiIsInJvbGVzIjpbIkFETUlOIl0sImlhdCI6MTc2Mzc2NTgyMywiZXhwIjoxNzYzNzY1ODUzfQ.wg-DFqu0OtTgmFTq89eVJa3SCtGNEbe0DTwyRkWGrNA"

 Output:
 -------
 < HTTP/1.1 401 
 < X-Content-Type-Options: nosniff
 < X-XSS-Protection: 0
 < Cache-Control: no-cache, no-store, max-age=0, must-revalidate
 < Pragma: no-cache
 < Expires: 0
 < X-Frame-Options: DENY
 < Content-Type: application/json
 < Transfer-Encoding: chunked
 < Date: Fri, 21 Nov 2025 23:23:28 GMT 
 * Connection #0 to host localhost left intact
 {"message":"Refresh token has expired"}

 3.User not found: System responds with 404 Not Found

