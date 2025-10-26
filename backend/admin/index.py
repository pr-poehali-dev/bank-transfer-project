import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor
from typing import Dict, Any
import random

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Admin panel API for managing users and cards
    Args: event - dict with httpMethod, body, headers
          context - object with attributes: request_id, function_name
    Returns: HTTP response dict with admin data
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Is-Admin',
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
    
    headers = event.get('headers', {})
    is_admin = headers.get('X-Is-Admin') or headers.get('x-is-admin')
    
    if is_admin != 'true':
        return {
            'statusCode': 403,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Access denied'})
        }
    
    conn = psycopg2.connect(database_url)
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        if method == 'GET':
            action = event.get('queryStringParameters', {}).get('action', 'users')
            
            if action == 'users':
                cursor.execute(
                    """SELECT id, username, email, first_name, last_name, phone, birth_year, is_admin, created_at 
                       FROM users 
                       ORDER BY created_at DESC"""
                )
                users = cursor.fetchall()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'isBase64Encoded': False,
                    'body': json.dumps({'users': [dict(u) for u in users]}, default=str)
                }
            
            elif action == 'card_requests':
                cursor.execute(
                    """SELECT cr.*, u.username, u.first_name, u.last_name, u.phone 
                       FROM card_requests cr 
                       JOIN users u ON cr.user_id = u.id 
                       ORDER BY cr.created_at DESC"""
                )
                requests = cursor.fetchall()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'isBase64Encoded': False,
                    'body': json.dumps({'requests': [dict(r) for r in requests]}, default=str)
                }
            
            elif action == 'all_cards':
                cursor.execute(
                    """SELECT c.*, u.username, u.first_name, u.last_name 
                       FROM cards c 
                       JOIN users u ON c.user_id = u.id 
                       ORDER BY c.created_at DESC"""
                )
                cards = cursor.fetchall()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'isBase64Encoded': False,
                    'body': json.dumps({'cards': [dict(c) for c in cards]}, default=str)
                }
        
        elif method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            action = body_data.get('action')
            
            if action == 'approve_card':
                request_id = body_data.get('request_id')
                card_number = body_data.get('card_number')
                
                if not request_id or not card_number:
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Missing required fields'})
                    }
                
                cursor.execute("SELECT * FROM card_requests WHERE id = %s", (request_id,))
                request = cursor.fetchone()
                
                if not request:
                    return {
                        'statusCode': 404,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Request not found'})
                    }
                
                cursor.execute("SELECT first_name, last_name FROM users WHERE id = %s", (request['user_id'],))
                user = cursor.fetchone()
                owner_name = f"{user['first_name']} {user['last_name']}"
                
                masked = f"{card_number[:4]} •••• •••• {card_number[-4:]}"
                colors = ['from-purple-500 to-pink-500', 'from-blue-500 to-cyan-500', 
                          'from-orange-500 to-red-500', 'from-green-500 to-emerald-500']
                
                cursor.execute(
                    """INSERT INTO cards (user_id, card_number, masked_number, card_type, card_category, balance, color_scheme, status) 
                       VALUES (%s, %s, %s, 'virtual', %s, 0, %s, 'active')""",
                    (request['user_id'], card_number, masked, request['card_category'], random.choice(colors))
                )
                
                cursor.execute(
                    "UPDATE card_requests SET status = 'approved', processed_at = CURRENT_TIMESTAMP WHERE id = %s",
                    (request_id,)
                )
                
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'isBase64Encoded': False,
                    'body': json.dumps({'success': True, 'message': 'Card approved and issued'})
                }
            
            elif action == 'reject_card':
                request_id = body_data.get('request_id')
                comment = body_data.get('comment', '')
                
                cursor.execute(
                    """UPDATE card_requests 
                       SET status = 'rejected', admin_comment = %s, processed_at = CURRENT_TIMESTAMP 
                       WHERE id = %s""",
                    (comment, request_id)
                )
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'isBase64Encoded': False,
                    'body': json.dumps({'success': True, 'message': 'Card request rejected'})
                }
            
            elif action == 'update_card_status':
                card_id = body_data.get('card_id')
                status = body_data.get('status')
                
                if status not in ['active', 'blocked', 'frozen']:
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Invalid status'})
                    }
                
                cursor.execute("UPDATE cards SET status = %s WHERE id = %s", (status, card_id))
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'isBase64Encoded': False,
                    'body': json.dumps({'success': True, 'message': f'Card {status}'})
                }
            
            elif action == 'add_balance':
                card_id = body_data.get('card_id')
                amount = float(body_data.get('amount', 0))
                
                cursor.execute(
                    "UPDATE cards SET balance = balance + %s WHERE id = %s",
                    (amount, card_id)
                )
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'isBase64Encoded': False,
                    'body': json.dumps({'success': True, 'message': 'Balance updated'})
                }
            
            elif action == 'update_user':
                user_id = body_data.get('user_id')
                updates = body_data.get('updates', {})
                
                allowed_fields = ['first_name', 'last_name', 'phone', 'email', 'birth_year']
                update_parts = []
                values = []
                
                for field, value in updates.items():
                    if field in allowed_fields:
                        update_parts.append(f"{field} = %s")
                        values.append(value)
                
                if update_parts:
                    values.append(user_id)
                    query = f"UPDATE users SET {', '.join(update_parts)} WHERE id = %s"
                    cursor.execute(query, values)
                    conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'isBase64Encoded': False,
                    'body': json.dumps({'success': True, 'message': 'User updated'})
                }
        
        elif method == 'DELETE':
            body_data = json.loads(event.get('body', '{}'))
            action = body_data.get('action')
            
            if action == 'delete_card':
                card_id = body_data.get('card_id')
                cursor.execute("UPDATE cards SET is_active = FALSE WHERE id = %s", (card_id,))
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'isBase64Encoded': False,
                    'body': json.dumps({'success': True, 'message': 'Card deleted'})
                }
        
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    finally:
        cursor.close()
        conn.close()
