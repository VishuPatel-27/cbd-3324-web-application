import mysql.connector
import os
from dotenv import load_dotenv


# Function to load .env dynamically
def load_environment():

    # Check for .env file locally
    if os.path.exists("/app/secrets/.env"):
        print("Loading .env from Docker secret")
        load_dotenv("/app/secrets/.env")  # Load from Docker Swarm secret
    else:
        # loading the env file dynamically
        load_dotenv()

# Establish connection to MySQL database
def create_connection():

    load_environment()

    host = os.getenv('MYSQL_HOST')
    db_user = os.getenv('MYSQL_USER')
    password = os.getenv('MYSQL_PASSWORD')
    database = os.getenv('MYSQL_DB')

    try:
        connection = mysql.connector.connect(
            host=host,
            user=db_user,
            password=password,
            database=database
        )
        return connection
    except mysql.connector.Error as err:
        print(f"Error: {err}")
        return None

# Register a new user
def register_user(name,email, user_password):
    connection = create_connection()
    if connection.is_connected():
        cursor = connection.cursor()
        try:
            insert_query = "INSERT INTO users (name, email, user_password) VALUES (%s, %s, %s)"
            cursor.execute(insert_query, (name,email,user_password))
            connection.commit()
            return True
        except mysql.connector.Error as err:
            print(f"Error: {err}")
            return False
        finally:
            if connection.is_connected():
                cursor.close()
                connection.close()

# Get user details (for login)
def get_user(email, user_password):
    connection = create_connection()
    if connection.is_connected():
        cursor = connection.cursor(dictionary=True)
        try:
            select_query = "SELECT * FROM users WHERE email = %s AND user_password = %s"
            cursor.execute(select_query, (email, user_password))
            user = cursor.fetchone()
            return user
        except mysql.connector.Error as err:
            print(f"Error: {err}")
            return None
        finally:
            if connection.is_connected():
                cursor.close()
                connection.close()

def check_user_credentials(email, user_password):
    load_environment()

    try:
        connection = mysql.connector.connect(
            host=os.getenv('MYSQL_HOST'),
            user=os.getenv('MYSQL_USER'),
            password=os.getenv('MYSQL_PASSWORD'),
            database=os.getenv('MYSQL_DB')
        )
        cursor = connection.cursor()
        cursor.execute("SELECT * FROM users WHERE email=%s AND user_password=%s", (email, user_password))
        user = cursor.fetchone()

        cursor.close()
        connection.close()

        if user:
            return True
        else:
            return False
    except mysql.connector.Error as err:
        print(f"Error: {err}")
        return False
