# PostgreSQL Authentication Setup Guide

This setup provides PostgreSQL 13 with pgcrypto module and pgAdmin admin dashboard for your authentication system.

## Prerequisites

- Docker and Docker Compose installed
- Ports 5432 (PostgreSQL) and 8080 (pgAdmin) available

## Quick Start

1. **Start the services:**
   ```bash
   docker-compose up -d
   ```

2. **Check service status:**
   ```bash
   docker-compose ps
   ```

3. **View logs:**
   ```bash
   docker-compose logs postgres
   docker-compose logs pgadmin
   ```

## Access Information

### PostgreSQL Database
- **Host:** localhost
- **Port:** 5432
- **Database:** authdb
- **Username:** postgres
- **Password:** postgres123

### pgAdmin Dashboard
- **URL:** http://localhost:8080
- **Email:** admin@example.com
- **Password:** admin123

## Connecting to pgAdmin

1. Open http://localhost:8080 in your browser
2. Login with admin@example.com / admin123
3. Add a new server:
   - **Name:** Local PostgreSQL
   - **Host:** postgres (use container name)
   - **Port:** 5432
   - **Database:** authdb
   - **Username:** postgres
   - **Password:** postgres123

## Testing the Authentication Functions

### Connect to PostgreSQL
```bash
docker exec -it postgres_auth psql -U postgres -d authdb
```

### Test Signup Function
```sql
-- Sign up a new user
SELECT signup(1, 'user@example.com', 'mypassword123');

-- Verify user was created
SELECT * FROM userAuth;
```

### Test Authentication Function
```sql
-- Authenticate the user
SELECT authenticate('user@example.com', 'mypassword123');

-- Try wrong password
SELECT authenticate('user@example.com', 'wrongpassword');
```

### Test User Details Function
```sql
-- Get user details
SELECT * FROM get_user_details('user@example.com');
```

## Database Schema

The `userAuth` table includes:
- `userId`: Auto-incrementing primary key
- `mail`: Unique email address
- `salt`: Random salt for password hashing
- `hashpass`: SHA256 hash of salt + password
- `created_at`: Timestamp of user creation
- `updated_at`: Timestamp of last update

## Security Features

- **Salt Generation:** Uses `gen_random_bytes(32)` for cryptographically secure random salts (32 bytes = 64 hex characters)
- **SHA256 Hashing:** Implements SHA256 hashing as requested (not PostgreSQL crypt)
- **Input Validation:** Functions include proper error handling and validation
- **Unique Constraints:** Email addresses must be unique
- **Automatic Timestamps:** Created and updated timestamps are automatically managed

## Stopping Services

```bash
# Stop and remove containers
docker-compose down

# Stop and remove containers + volumes (WARNING: This will delete all data)
docker-compose down -v
```

## Troubleshooting

### Port Already in Use
If ports 5432 or 8080 are already in use, modify the `docker-compose.yml` file:
```yaml
ports:
  - "5433:5432"  # Change 5432 to 5433
```

### Permission Issues
If you encounter permission issues, ensure your Docker user has proper permissions or run with sudo.

### Database Connection Issues
Check if the PostgreSQL container is healthy:
```bash
docker-compose ps
docker-compose logs postgres
```

## Customization

- **Change passwords:** Modify the environment variables in `docker-compose.yml`
- **Add more extensions:** Modify the `init.sql` file
- **Custom functions:** Add your own functions to `auth_functions.sql`
- **Port mapping:** Change the port mappings in `docker-compose.yml` as needed
