import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MessageCircle, X, Send, Bot, Minimize2 } from 'lucide-react';

/**
 * OpenClaw WebChat Widget
 * Embeds an OpenClaw WebChat interface as a floating chat bubble in the Promorang dashboard.
 *
 * The widget connects to the OpenClaw Gateway via WebSocket and provides
 * a native chat experience for stakeholders to interact with the Rang advisor agent.
 *
 * Props:
 * - gatewayUrl: OpenClaw Gateway WebSocket URL (e.g., wss://your-vps.com:18789)
 * - authToken: Gateway authentication token
 * - userName: Current user's display name
 * - userType: 'host' | 'merchant' | 'participant' — used for context
 */

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

interface OpenClawChatProps {
    gatewayUrl?: string;
    authToken?: string;
    userName?: string;
    userType?: string;
}

const OpenClawChat: React.FC<OpenClawChatProps> = ({
    gatewayUrl = '',
    authToken = '',
    userName = 'User',
    userType = 'participant',
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isConnected, setIsConnected] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [hasUnread, setHasUnread] = useState(false);
    const wsRef = useRef<WebSocket | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Auto-scroll to bottom on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Focus input when chat opens
    useEffect(() => {
        if (isOpen) {
            setHasUnread(false);
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen]);

    // WebSocket connection
    const connectWs = useCallback(() => {
        if (!gatewayUrl || !authToken) return;

        const ws = new WebSocket(`${gatewayUrl}?token=${authToken}`);

        ws.onopen = () => {
            setIsConnected(true);
            // Send session init with user context
            ws.send(
                JSON.stringify({
                    method: 'chat.send',
                    params: {
                        message: `[System: User "${userName}" (${userType}) has connected. Refer to MEMORY.md for platform context.]`,
                        channel: 'webchat',
                    },
                })
            );
        };

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (data.method === 'chat.message' && data.params?.role === 'assistant') {
                    const msg: Message = {
                        id: `msg-${Date.now()}`,
                        role: 'assistant',
                        content: data.params.content,
                        timestamp: new Date(),
                    };
                    setMessages((prev) => [...prev, msg]);
                    setIsTyping(false);
                    if (!isOpen) setHasUnread(true);
                }
            } catch {
                // Ignore non-JSON messages
            }
        };

        ws.onclose = () => {
            setIsConnected(false);
            // Attempt reconnect after 3 seconds
            setTimeout(connectWs, 3000);
        };

        ws.onerror = () => {
            setIsConnected(false);
        };

        wsRef.current = ws;
    }, [gatewayUrl, authToken, userName, userType, isOpen]);

    useEffect(() => {
        connectWs();
        return () => wsRef.current?.close();
    }, [connectWs]);

    const sendMessage = () => {
        if (!input.trim() || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;

        const msg: Message = {
            id: `msg-${Date.now()}`,
            role: 'user',
            content: input.trim(),
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, msg]);
        setIsTyping(true);

        wsRef.current.send(
            JSON.stringify({
                method: 'chat.send',
                params: {
                    message: input.trim(),
                    channel: 'webchat',
                },
            })
        );

        setInput('');
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    // If no gateway URL configured, show a placeholder
    if (!gatewayUrl) {
        return null; // Don't render until OpenClaw is configured
    }

    return (
        <>
            {/* Chat Bubble */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    style={{
                        position: 'fixed',
                        bottom: '24px',
                        right: '24px',
                        width: '60px',
                        height: '60px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 8px 32px rgba(99, 102, 241, 0.4)',
                        transition: 'transform 0.2s, box-shadow 0.2s',
                        zIndex: 9999,
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.1)';
                        e.currentTarget.style.boxShadow = '0 12px 40px rgba(99, 102, 241, 0.5)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.boxShadow = '0 8px 32px rgba(99, 102, 241, 0.4)';
                    }}
                >
                    <MessageCircle size={28} color="white" />
                    {hasUnread && (
                        <span
                            style={{
                                position: 'absolute',
                                top: '-2px',
                                right: '-2px',
                                width: '16px',
                                height: '16px',
                                background: '#ef4444',
                                borderRadius: '50%',
                                border: '2px solid white',
                            }}
                        />
                    )}
                </button>
            )}

            {/* Chat Window */}
            {isOpen && (
                <div
                    style={{
                        position: 'fixed',
                        bottom: '24px',
                        right: '24px',
                        width: '380px',
                        height: '560px',
                        background: '#0f0f23',
                        borderRadius: '16px',
                        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden',
                        zIndex: 9999,
                        border: '1px solid rgba(99, 102, 241, 0.2)',
                    }}
                >
                    {/* Header */}
                    <div
                        style={{
                            padding: '16px 20px',
                            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Bot size={22} color="white" />
                            <div>
                                <div style={{ color: 'white', fontWeight: 600, fontSize: '15px' }}>
                                    Rang 🎯
                                </div>
                                <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px' }}>
                                    {isConnected ? 'Online' : 'Connecting...'}
                                </div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                                onClick={() => setIsOpen(false)}
                                style={{
                                    background: 'rgba(255,255,255,0.2)',
                                    border: 'none',
                                    borderRadius: '8px',
                                    padding: '6px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                }}
                            >
                                <Minimize2 size={16} color="white" />
                            </button>
                            <button
                                onClick={() => setIsOpen(false)}
                                style={{
                                    background: 'rgba(255,255,255,0.2)',
                                    border: 'none',
                                    borderRadius: '8px',
                                    padding: '6px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                }}
                            >
                                <X size={16} color="white" />
                            </button>
                        </div>
                    </div>

                    {/* Messages */}
                    <div
                        style={{
                            flex: 1,
                            overflowY: 'auto',
                            padding: '16px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '12px',
                        }}
                    >
                        {/* Welcome message */}
                        {messages.length === 0 && (
                            <div
                                style={{
                                    textAlign: 'center',
                                    padding: '40px 20px',
                                    color: 'rgba(255,255,255,0.5)',
                                }}
                            >
                                <Bot size={40} style={{ marginBottom: '12px', opacity: 0.5 }} />
                                <div style={{ fontSize: '14px', marginBottom: '8px' }}>
                                    Hi {userName}! 🎯
                                </div>
                                <div style={{ fontSize: '13px', lineHeight: '1.5' }}>
                                    I'm Rang, your Promorang advisor. Ask me about your moments, venues, analytics, or anything platform-related.
                                </div>
                            </div>
                        )}

                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                style={{
                                    display: 'flex',
                                    justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                                }}
                            >
                                <div
                                    style={{
                                        maxWidth: '80%',
                                        padding: '10px 14px',
                                        borderRadius: msg.role === 'user'
                                            ? '14px 14px 4px 14px'
                                            : '14px 14px 14px 4px',
                                        background: msg.role === 'user'
                                            ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                                            : 'rgba(255,255,255,0.08)',
                                        color: 'white',
                                        fontSize: '14px',
                                        lineHeight: '1.5',
                                        wordBreak: 'break-word',
                                    }}
                                >
                                    {msg.content}
                                </div>
                            </div>
                        ))}

                        {isTyping && (
                            <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                                <div
                                    style={{
                                        padding: '10px 14px',
                                        borderRadius: '14px 14px 14px 4px',
                                        background: 'rgba(255,255,255,0.08)',
                                        color: 'rgba(255,255,255,0.5)',
                                        fontSize: '14px',
                                    }}
                                >
                                    Rang is thinking...
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div
                        style={{
                            padding: '12px 16px',
                            borderTop: '1px solid rgba(255,255,255,0.08)',
                            display: 'flex',
                            gap: '8px',
                            alignItems: 'center',
                        }}
                    >
                        <input
                            ref={inputRef}
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Ask Rang anything..."
                            style={{
                                flex: 1,
                                background: 'rgba(255,255,255,0.06)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '10px',
                                padding: '10px 14px',
                                color: 'white',
                                fontSize: '14px',
                                outline: 'none',
                            }}
                        />
                        <button
                            onClick={sendMessage}
                            disabled={!input.trim() || !isConnected}
                            style={{
                                background: input.trim() && isConnected
                                    ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                                    : 'rgba(255,255,255,0.1)',
                                border: 'none',
                                borderRadius: '10px',
                                padding: '10px',
                                cursor: input.trim() && isConnected ? 'pointer' : 'not-allowed',
                                display: 'flex',
                                transition: 'background 0.2s',
                            }}
                        >
                            <Send size={18} color="white" />
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default OpenClawChat;
