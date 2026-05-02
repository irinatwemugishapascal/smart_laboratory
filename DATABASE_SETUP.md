# Database Setup Guide

Registration is failing because MySQL database is not set up. Here's how to fix it:

## Option 1: Install MySQL (Recommended)

### Windows
1. Download MySQL from: https://dev.mysql.com/downloads/mysql/
2. Install MySQL Community Server
3. During installation, set root password (remember it)

### After Installation
```bash
# Open MySQL Command Line Client
mysql -u root -p

# Create database
CREATE DATABASE smart_laboratory;

# Import schema
SOURCE c:/Users/Student/Pictures/prof/Smart/server/config/database.sql;

# Exit
EXIT;
```

### Update Password in .env
Edit `server/.env`:
```env
DB_PASSWORD=your_actual_mysql_password
```

## Option 2: Use XAMPP (Easier)

1. Download XAMPP from: https://www.apachefriends.org/
2. Install XAMPP
3. Start Apache and MySQL from XAMPP Control Panel
4. Open phpMyAdmin: http://localhost/phpmyadmin
5. Create database: `smart_laboratory`
6. Import: `server/config/database.sql`

## Option 3: Use Docker (Advanced)

```bash
# Start MySQL container
docker run -d -p 3306:3306 -e MYSQL_ROOT_PASSWORD=123456 -e MYSQL_DATABASE=smart_laboratory --name mysql-db mysql:8

# Import schema
docker exec -i mysql-db mysql -uroot -p123456 smart_laboratory < server/config/database.sql
```

## Quick Test

After setup, test the database:
```bash
# Check if database exists
mysql -u root -p -e "SHOW DATABASES;"

# Should see: smart_laboratory
```

## Restart Server

After database setup:
1. Stop the server (Ctrl+C in terminal)
2. Restart: `cd server && npm start`

## Demo Users

The database includes demo accounts:
- **Student**: student@example.com / password123
- **Teacher**: teacher@example.com / password123

## Troubleshooting

### "Access denied"
- Check MySQL username/password in .env
- Ensure MySQL service is running

### "Unknown database"
- Run the database creation commands above
- Import the schema file

### Port conflicts
- Make sure MySQL is running on port 3306
- Check no other services are using port 5000

Once database is set up, registration and login will work perfectly!
