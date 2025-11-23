Use Case 1: Login (with first-login / password change check)
------------------------------------------------------------
Title: Force password change on first login

Actors:
------
 Primary Actor: User(whose account is created)
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


Use Case 3: Change Password on First Login
------------------------------------------
Title: Force a user to update their temporary password on first login.

Actors:
-------
Primary Actor: Student / Admin (with temporary password)

Preconditions:
--------------
1.User account exists in the database.
2.User has firstLogin = true.
3.User knows the temporary password assigned by the admin.

Postconditions:
--------------
1.User password is updated in the database (BCrypt encoded).
2.firstLogin flag is set to false.
3.User can log in with the new password.

Description / Flow:
-------------------
1.User sends a POST request to /api/users/change-password-first-login with their username, old password, and new password.
2.System retrieves the user from the database by username.
3.System validates the old password against the stored encoded password.
4.System validates the new password against security rules (minimum 8 characters, at least 1 uppercase, 1 lowercase, 1 digit).
5.System ensures the new password is different from the old password.
6.System encodes the new password using BCrypt and updates the user record.
7.System sets firstLogin = false and records the password change timestamp.
8.System returns a success message to the user.

Execute request with curl:
curl -v -X POST http://localhost:8080/api/users/change-password-first-login \
-H "Content-Type: application/json" \
-d '{
  "username": "admin",
  "oldPassword": "Admin@123",
  "newPassword": "User@1234"
}'

Output:
------
"Password changed successfully"

Use Case 4: Create Account
-----------------------------------
Title: Admin creates a new student account with a temporary password.

Actors:
-------
Primary Actor: Admin

Preconditions:
--------------
1.Admin is already registered and logged in.
2.Admin has the required privileges to create student accounts.
3.Role STUDENT exists in the database.

Postconditions:
---------------
1.A new student account is created in the database.
2.The account has a temporary password (Temp@123).
3.firstLogin flag is set to true for the student.

Description / Flow:
-------------------
1.Admin sends a POST request to /api/users/create-account with the student’s email.
2.System checks if the username already exists.
3.System creates a new User entity with:
  1.username from request
  2.Password set to Temp@123 (BCrypt encoded)
  3.enabled = true
  4.firstLogin = true
4.System assigns the role STUDENT to the new user.
5.System saves the user in the database.
6.System returns a success message along with the temporary password.

Execute request with curl:
curl -v -X POST http://localhost:8080/api/users/create-student \
-H "Content-Type: application/json" \
-H "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9..." \
-d '{ "email": "student01@example.com" }'

Output:
-------
"Student account created successfully. Username: student01, Temporary password: Temp@123"

Use Case 5: Get User's Profile
------------------------------
Title : User wants to see his/her profile

Actors:
-------
Primary Actor: Authenticated User

Preconditions:
--------------
1.User is logged in with a valid JWT token.
2.UserProfile may or may not exist in the database.

Postconditions:
--------------
1.If profile exists → existing profile data is returned.
2.If profile does NOT exist → system creates an empty profile row and returns default values.
3.API returns a well-structured UserProfileResponse object.

Description / Flow:
-------------------
1.User sends a GET request to /api/users/profile with the JWT token.
2.System extracts the username from Authentication object.
3.System checks if the user exists in the users table.
4.If profile does not exist:
  1.System creates a new empty UserProfile
  2.Sets default values ("") for all profile fields
5.System converts the data into a UserProfileResponse DTO.
6.System returns:
  1.Basic user info (id, username, email, roles)
  2.Profile info (name, phone, department, yearOfStudy, photoUrl)

Execute request with curl:
curl -v -X GET http://localhost:8080/api/profile \
-H "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9..."

Output1:
--------
{
  "userId": 2,
  "username": "monika",
  "email": "monika@gmail.com",
  "role": "STUDENT",
  "fullName": "Monika Pati",
  "department": "IT",
  "phone": "475767877",
  "photoUrl": "",
  "yearOfStudy": ""
}

Output2:
--------
{
  "userId": 2,
  "username": "monika",
  "email": "monika@gmail.com",
  "role": "STUDENT",
  "fullName": "",
  "department": "",
  "phone": "",
  "photoUrl": "",
  "yearOfStudy": ""
}
