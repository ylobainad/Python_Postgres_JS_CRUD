from flask import Flask, request, jsonify
from psycopg2 import connect, extras
from cryptography.fernet import Fernet

app = Flask(__name__)
key = Fernet.generate_key()

host = '192.168.2.149'
port = 5432
dbname = 'usersdb'
user = 'postgres'
password = 'password'


def get_connection():
    conn = connect(host=host, port=port, dbname=dbname,
                   user=user, password=password)
    return conn

# *************************************************************************************************************************************
# GET ALL USERS
# *************************************************************************************************************************************


@app.get('/api/users')
def get_users():
    conn = get_connection()
    cur = conn.cursor(cursor_factory=extras.RealDictCursor)

    cur.execute('SELECT * FROM users')
    users = cur.fetchall()

    return users

# *************************************************************************************************************************************
# CREATE USERS
# *************************************************************************************************************************************


@app.post('/api/users')
def create_users():
    new_user = request.get_json()
    username = new_user['username']
    email = new_user['email']
    password = Fernet(key).encrypt(bytes(new_user['password'], 'utf-8'))

    conn = get_connection()
    cur = conn.cursor(cursor_factory=extras.RealDictCursor)
    cur.execute("INSERT INTO users (username, email, password) VALUES (%s, %s, %s) RETURNING *", (
        username, email, password))
    new_created_user = cur.fetchone()
    print(new_created_user)
    conn.commit()
    cur.close()
    conn.close()
    return jsonify(new_created_user)

# *************************************************************************************************************************************
# DELETE USER
# *************************************************************************************************************************************


@app.delete('/api/users/<id>')
def delete_users(id):
    conn = get_connection()
    cur = conn.cursor(cursor_factory=extras.RealDictCursor)
    cur.execute("DELETE FROM users WHERE id = %s RETURNING * ", (id,))
    user = cur.fetchone()

    conn.commit()
    cur.close()
    conn.close()
    if user is None:
        return jsonify({'message': 'User not found'}), 404
    return jsonify(user)

# *************************************************************************************************************************************
# UPDATE USER
# *************************************************************************************************************************************


@app.put('/api/users/<id>')
def updating_users(id):
    new_user = request.get_json()
    username = new_user['username']
    email = new_user['email']
    password = Fernet(key).encrypt(bytes(new_user['password'], 'utf-8'))

    conn = get_connection()
    cur = conn.cursor(cursor_factory=extras.RealDictCursor)
    cur.execute("UPDATE users SET username = %s, email = %s, password = %s WHERE id = %s RETURNING *", (
        username, email, password, id))
    updated_user = cur.fetchone()

    conn.commit()
    cur.close()
    conn.close()

    if user is None:
        return jsonify({'message': 'User not found'}), 404
    return jsonify(updated_user)

# *************************************************************************************************************************************
# GET A USER
# *************************************************************************************************************************************


@app.get('/api/users/<id>')
def get_user(id):
    conn = get_connection()
    cur = conn.cursor(cursor_factory=extras.RealDictCursor)

    cur.execute("SELECT * FROM users WHERE id = %s", (id,))
    user = cur.fetchone()
    cur.close()
    conn.close()

    if user is None:
        return jsonify({'message': 'User not found'}), 404
    return jsonify(user)

# *************************************************************************************************************************************
#
# *************************************************************************************************************************************


if __name__ == '__main__':
    app.run(debug=True)
