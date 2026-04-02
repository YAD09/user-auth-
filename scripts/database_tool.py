import sqlite3
import os
import sys
import argparse
from datetime import datetime

# ANSI Colors for beautiful terminal output
class Colors:
    HEADER = '\033[95m'
    OKBLUE = '\033[94m'
    OKCYAN = '\033[96m'
    OKGREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'

def get_db_connection():
    db_path = os.path.join(os.path.dirname(__file__), '..', 'db', 'database.sqlite')
    if not os.path.exists(db_path):
        print(f"{Colors.FAIL}[ERROR] Database not found at {db_path}{Colors.ENDC}")
        sys.exit(1)
    return sqlite3.connect(db_path)

def list_users():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id, username, email, created_at FROM users")
    users = cursor.fetchall()
    
    print(f"\n{Colors.HEADER}{Colors.BOLD}--- REGISTERED USERS ---{Colors.ENDC}")
    print(f"{Colors.BOLD}{'ID':<5} {'Username':<20} {'Email':<30} {'Created At'}{Colors.ENDC}")
    print("-" * 75)
    
    for user in users:
        print(f"{user[0]:<5} {user[1]:<20} {user[2]:<30} {user[3]}")
    
    print(f"\n{Colors.OKBLUE}Total users: {len(users)}{Colors.ENDC}")
    conn.close()

def search_user(query):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id, username, email, created_at FROM users WHERE username LIKE ? OR email LIKE ?", (f'%{query}%', f'%{query}%'))
    users = cursor.fetchall()
    
    if not users:
        print(f"{Colors.WARNING}No users found matching '{query}'{Colors.ENDC}")
        return

    print(f"\n{Colors.OKCYAN}{Colors.BOLD}Search Results for '{query}':{Colors.ENDC}")
    for user in users:
        print(f"{Colors.OKGREEN}ID: {user[0]} | Username: {user[1]} | Email: {user[2]} | Joined: {user[3]}{Colors.ENDC}")
    conn.close()

def delete_user(username):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Check if user exists
    cursor.execute("SELECT id FROM users WHERE username = ?", (username,))
    if not cursor.fetchone():
        print(f"{Colors.FAIL}[ERROR] User '{username}' not found.{Colors.ENDC}")
        return

    confirm = input(f"{Colors.WARNING}Are you sure you want to delete user '{username}'? (y/N): {Colors.ENDC}")
    if confirm.lower() == 'y':
        cursor.execute("DELETE FROM users WHERE username = ?", (username,))
        conn.commit()
        print(f"{Colors.OKGREEN}[SUCCESS] User '{username}' has been deleted.{Colors.ENDC}")
    else:
        print("Operation cancelled.")
    conn.close()

def db_stats():
    db_path = os.path.join(os.path.dirname(__file__), '..', 'db', 'database.sqlite')
    size_kb = os.path.getsize(db_path) / 1024
    
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) FROM users")
    user_count = cursor.fetchone()[0]
    
    print(f"\n{Colors.HEADER}{Colors.BOLD}--- DATABASE STATISTICS ---{Colors.ENDC}")
    print(f"File Path: {os.path.abspath(db_path)}")
    print(f"Size:      {size_kb:.2f} KB")
    print(f"Users:     {user_count}")
    print(f"Status:    {Colors.OKGREEN}Healthy{Colors.ENDC}")
    conn.close()

def main():
    parser = argparse.ArgumentParser(description="Secure Auth System - Database Management Tool")
    parser.add_argument("--list", action="store_true", help="List all registered users")
    parser.add_argument("--search", type=str, help="Search for a user by username or email")
    parser.add_argument("--delete", type=str, help="Delete a user by username")
    parser.add_argument("--stats", action="store_true", help="Show database statistics")

    if len(sys.argv) == 1:
        parser.print_help()
        sys.exit(0)

    args = parser.parse_args()

    if args.list:
        list_users()
    elif args.search:
        search_user(args.search)
    elif args.delete:
        delete_user(args.delete)
    elif args.stats:
        db_stats()

if __name__ == "__main__":
    main()
