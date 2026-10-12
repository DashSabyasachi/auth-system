# Register & Login System (Spring Boot + MySQL)

## Run
1. Install Java 17+ and MySQL. Start MySQL.
2. Edit `src/main/resources/application.properties` -> set your MySQL username/password.
   (The `auth_db` database is created automatically.)
3. From this folder: `mvn spring-boot:run`
   (or import as an existing Maven project in Eclipse/STS and run `AuthApplication`).
4. Open http://localhost:8080

## Structure
controller -> service -> repository -> entity (MySQL `users` table)
dto + validation: RegisterRequest, LoginRequest, @PasswordMatches
exception: GlobalExceptionHandler returns JSON {message, fieldErrors}
static: login.html, register.html, home.html, css/style.css, js/auth.js

## API
POST /api/auth/register  {name,email,password,confirmPassword} -> 201
POST /api/auth/login     {email,password} -> 200 {id,name,email}

Passwords are stored in plain text ONLY because this is a local learning exercise.
Next step to learn: BCryptPasswordEncoder from spring-security-crypto.
