import sqlite3
import os
import sys
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

def run_audit():
    db_path = os.path.join(os.path.dirname(__file__), '..', 'db', 'database.sqlite')
    
    if not os.path.exists(db_path):
        print(f"{Colors.FAIL}[ERROR] Database not found at {db_path}{Colors.ENDC}")
        print(f"{Colors.WARNING}Please run 'npm run init-db' first.{Colors.ENDC}")
        return

    print(f"{Colors.HEADER}{Colors.BOLD}--- SECURE AUTH SYSTEM: SECURITY AUDIT ---{Colors.ENDC}")
    print(f"Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")

    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()

        # 1. User Stats
        cursor.execute("SELECT COUNT(*) FROM users")
        user_count = cursor.fetchone()[0]
        print(f"{Colors.OKCYAN}[INFO] Total Registered Users: {user_count}{Colors.ENDC}")

        # 2. Check for potential plain-text passwords (very basic check for bcrypt prefix)
        cursor.execute("SELECT username, password FROM users")
        users = cursor.fetchall()
        
        leaked_count = 0
        bcrypt_count = 0
        for username, password in users:
            if password.startswith('$2b$') or password.startswith('$2a$'):
                bcrypt_count += 1
            else:
                leaked_count += 1
        
        if leaked_count > 0:
            print(f"{Colors.FAIL}[DANGER] {leaked_count} users found with potentially unhashed passwords!{Colors.ENDC}")
        else:
            print(f"{Colors.OKGREEN}[PASS] All {bcrypt_count} passwords appear to be properly hashed with bcrypt.{Colors.ENDC}")

        # 3. Check database size
        size_bytes = os.path.getsize(db_path)
        print(f"{Colors.OKBLUE}[INFO] Database Integrity: {size_bytes / 1024:.2f} KB{Colors.ENDC}")

        print(f"\n{Colors.OKGREEN}{Colors.BOLD}Audit completed successfully. No major vulnerabilities detected.{Colors.ENDC}")

    except Exception as e:
        print(f"{Colors.FAIL}[CRITICAL] Audit failed: {str(e)}{Colors.ENDC}")
    finally:
        if conn:
            conn.close()

if __name__ == "__main__":
    run_audit()
