// frontend/hooks/useVoiceWebSocket.ts
import { useEffect, useRef, useState, useCallback } from 'react';

export function useVoiceWebSocket(url: string = 'ws://localhost:9999/ws/voice') {
    const ws = useRef<WebSocket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const reconnectTimeout = useRef<NodeJS.Timeout>();
    const messageHandlers = useRef<Map<string, (data: any) => void>>(new Map());
    
    const connect = useCallback(() => {
        try {
            ws.current = new WebSocket(url);
            
            ws.current.onopen = () => {
                console.log('WebSocket connected');
                setIsConnected(true);
                if (reconnectTimeout.current) {
                    clearTimeout(reconnectTimeout.current);
                }
            };
            
            ws.current.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    const handler = messageHandlers.current.get(data.type);
                    if (handler) {
                        handler(data);
                    }
                } catch (error) {
                    console.error('Error parsing message:', error);
                }
            };
            
            ws.current.onclose = () => {
                console.log('WebSocket disconnected');
                setIsConnected(false);
                
                // Auto-reconnect after 3 seconds
                reconnectTimeout.current = setTimeout(() => {
                    connect();
                }, 3000);
            };
            
            ws.current.onerror = (error) => {
                console.error('WebSocket error:', error);
            };
            
        } catch (error) {
            console.error('Failed to connect:', error);
        }
    }, [url]);
    
    useEffect(() => {
        connect();
        
        return () => {
            if (reconnectTimeout.current) {
                clearTimeout(reconnectTimeout.current);
            }
            if (ws.current) {
                ws.current.close();
            }
        };
    }, [connect]);
    
    const sendMessage = useCallback((type: string, payload?: any) => {
        if (ws.current && ws.current.readyState === WebSocket.OPEN) {
            ws.current.send(JSON.stringify({ type, ...payload }));
        }
    }, []);
    
    const onMessage = useCallback((type: string, handler: (data: any) => void) => {
        messageHandlers.current.set(type, handler);
    }, []);
    
    const sendVoiceCommand = useCallback((data: any) => {
        sendMessage('voice_command', { payload: data });
    }, [sendMessage]);
    
    return {
        isConnected,
        sendMessage,
        sendVoiceCommand,
        onMessage,
        ws: ws.current
    };
}