import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: User authentication and registration API
    Args: event - dict with httpMethod, body, queryStringParameters
          context - object with attributes: request_id, function_name
    Returns: HTTP response dict with user data or error
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Auth-Token',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    database_url = os.environ.get('DATABASE_URL')
    if not database_url:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Database not configured'})
        }
    
    conn = psycopg2.connect(database_url)
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        if method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            action = body_data.get('action')
            
            if action == 'register':
                username = body_data.get('username')
                email = body_data.get('email')
                password = body_data.get('password')
                first_name = body_data.get('first_name', '')
                last_name = body_data.get('last_name', '')
                phone = body_data.get('phone', '')
                birth_year = body_data.get('birth_year')
                
                if not username or not email or not password or not first_name or not last_name or not phone or not birth_year:
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Missing required fields'})
                    }
                
                cursor.execute(
                    "SELECT id FROM users WHERE username = %s OR email = %s OR phone = %s",
                    (username, email, phone)
                )
                existing_user = cursor.fetchone()
                
                if existing_user:
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'User already exists'})
                    }
                
                cursor.execute(
                    """INSERT INTO users (username, email, password_hash, first_name, last_name, phone, birth_year, is_admin) 
                       VALUES (%s, %s, %s, %s, %s, %s, %s, %s) 
                       RETURNING id, username, email, first_name, last_name, phone, birth_year, is_admin""",
                    (username, email, password, first_name, last_name, phone, birth_year, False)
                )
                new_user = cursor.fetchone()
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'isBase64Encoded': False,
                    'body': json.dumps({
                        'success': True,
                        'user': dict(new_user)
                    })
                }
            
            elif action == 'login':
                username = body_data.get('username')
                password = body_data.get('password')
                
                if not username or not password:
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Missing credentials'})
                    }
                
                cursor.execute(
                    """SELECT id, username, email, full_name, is_admin 
                       FROM users 
                       WHERE (username = %s OR email = %s) AND password_hash = %s""",
                    (username, username, password)
                )
                user = cursor.fetchone()
                
                if not user:
                    return {
                        'statusCode': 401,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Invalid credentials'})
                    }
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'isBase64Encoded': False,
                    'body': json.dumps({
                        'success': True,
                        'user': dict(user)
                    })
                }
        
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    finally:
        cursor.close()
        conn.close()