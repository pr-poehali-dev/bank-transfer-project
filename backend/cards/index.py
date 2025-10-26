import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor
from typing import Dict, Any
import random

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Card management API for users
    Args: event - dict with httpMethod, body, headers
          context - object with attributes: request_id, function_name
    Returns: HTTP response dict with card data
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
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
        headers = event.get('headers', {})
        user_id = headers.get('X-User-Id') or headers.get('x-user-id')
        
        if not user_id:
            return {
                'statusCode': 401,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Unauthorized'})
            }
        
        if method == 'GET':
            action = event.get('queryStringParameters', {}).get('action', 'list')
            
            if action == 'list':
                cursor.execute(
                    """SELECT c.*, u.first_name, u.last_name 
                       FROM cards c 
                       JOIN users u ON c.user_id = u.id 
                       WHERE c.user_id = %s AND c.is_active = TRUE 
                       ORDER BY c.created_at DESC""",
                    (user_id,)
                )
                cards = cursor.fetchall()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'isBase64Encoded': False,
                    'body': json.dumps({'cards': [dict(card) for card in cards]}, default=str)
                }
            
            elif action == 'requests':
                cursor.execute(
                    """SELECT * FROM card_requests 
                       WHERE user_id = %s 
                       ORDER BY created_at DESC""",
                    (user_id,)
                )
                requests = cursor.fetchall()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'isBase64Encoded': False,
                    'body': json.dumps({'requests': [dict(req) for req in requests]}, default=str)
                }
        
        elif method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            action = body_data.get('action')
            
            if action == 'request_card':
                card_category = body_data.get('card_category')
                
                if card_category not in ['debit', 'credit']:
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Invalid card category'})
                    }
                
                cursor.execute(
                    """INSERT INTO card_requests (user_id, card_category, status) 
                       VALUES (%s, %s, 'pending') 
                       RETURNING id, card_category, status, created_at""",
                    (user_id, card_category)
                )
                new_request = cursor.fetchone()
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'isBase64Encoded': False,
                    'body': json.dumps({'success': True, 'request': dict(new_request)}, default=str)
                }
            
            elif action == 'transfer':
                from_card_id = body_data.get('from_card_id')
                to_identifier = body_data.get('to_identifier')
                amount = float(body_data.get('amount', 0))
                
                if not from_card_id or not to_identifier or amount <= 0:
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Invalid transfer data'})
                    }
                
                cursor.execute(
                    "SELECT * FROM cards WHERE id = %s AND user_id = %s AND status = 'active'",
                    (from_card_id, user_id)
                )
                from_card = cursor.fetchone()
                
                if not from_card or float(from_card['balance']) < amount:
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Insufficient funds or invalid card'})
                    }
                
                if to_identifier.startswith('+'):
                    cursor.execute(
                        """SELECT c.* FROM cards c 
                           JOIN users u ON c.user_id = u.id 
                           WHERE u.phone = %s AND c.status = 'active' 
                           LIMIT 1""",
                        (to_identifier,)
                    )
                else:
                    cursor.execute(
                        "SELECT * FROM cards WHERE card_number = %s AND status = 'active' LIMIT 1",
                        (to_identifier.replace(' ', '').replace('•', ''),)
                    )
                
                to_card = cursor.fetchone()
                
                if not to_card:
                    return {
                        'statusCode': 404,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Recipient not found'})
                    }
                
                cursor.execute(
                    "UPDATE cards SET balance = balance - %s WHERE id = %s",
                    (amount, from_card_id)
                )
                cursor.execute(
                    "UPDATE cards SET balance = balance + %s WHERE id = %s",
                    (amount, to_card['id'])
                )
                
                cursor.execute(
                    """INSERT INTO transactions (card_id, user_id, transaction_type, amount, recipient, status) 
                       VALUES (%s, %s, 'outgoing', %s, %s, 'completed')""",
                    (from_card_id, user_id, amount, to_identifier)
                )
                cursor.execute(
                    """INSERT INTO transactions (card_id, user_id, transaction_type, amount, recipient, status) 
                       VALUES (%s, %s, 'incoming', %s, %s, 'completed')""",
                    (to_card['id'], to_card['user_id'], amount, from_card['masked_number'])
                )
                
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'isBase64Encoded': False,
                    'body': json.dumps({'success': True, 'message': 'Transfer completed'})
                }
            
            elif action == 'transactions':
                cursor.execute(
                    """SELECT t.* FROM transactions t 
                       JOIN cards c ON t.card_id = c.id 
                       WHERE c.user_id = %s 
                       ORDER BY t.created_at DESC 
                       LIMIT 50""",
                    (user_id,)
                )
                transactions = cursor.fetchall()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'isBase64Encoded': False,
                    'body': json.dumps({'transactions': [dict(t) for t in transactions]}, default=str)
                }
        
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    finally:
        cursor.close()
        conn.close()
