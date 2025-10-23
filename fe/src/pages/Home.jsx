import React, { useEffect, useState, useRef } from 'react';
import conversationsApi from '../services/conversationsApi';
import Spinner from '../components/Spinner';

import ChatWindow from '../components/ChatWindow';

export default function Home() {
    const [loading, setLoading] = useState(false);
    const [conversationId, setConversationId] = useState(
        localStorage.getItem('conversation_id') || null
    );
    const [userId, setUserId] = useState(
        localStorage.getItem('userId') || null
    );
    const [displayName, setDisplayName] = useState(
        localStorage.getItem('displayName') || ''
    );

    useEffect(() => {
        const name = localStorage.getItem('displayName') || '';
        setDisplayName(name);
    }, []);

    const handleStartConversation = async () => {
        try {
            setLoading(true);
            const now = new Date();
            const title = `conversation - ${now.toLocaleString()}`;
            const payload = { title };
            const res = await conversationsApi.create(payload);
            const id = res?.data?.id || res?.data?._id || res?.data;
            if (!id) throw new Error('No conversation id returned from server');
            localStorage.setItem('conversation_id', id);
            setConversationId(id);
        } catch (err) {
            console.error('Failed to create conversation', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <Spinner />;

    return (
        <div className="min-h-screen flex items-start justify-center p-4 bg-[var(--mainBg)]">
            <div className="w-full max-w-3xl">
                {!conversationId ? (
                    <div className="bg-[var(--subBg)] rounded-xl p-6 shadow-md text-center">
                        <h2 className="text-2xl font-semibold mb-2">Xin chào {displayName || 'bạn'}</h2>
                        <p className="mb-4">Hôm nay là một ngày tuyệt vời để bắt đầu trò chuyện!</p>
                        <button
                            className="px-4 py-2 bg-[var(--dark3)] text-white rounded-md"
                            onClick={handleStartConversation}
                        >
                            Bắt đầu Conversation mới
                        </button>
                    </div>
                ) : (
                        <ChatWindow conversationId={conversationId} onNewConversation={(id) => setConversationId(id)} userId={userId} />
                )}
            </div>
        </div>
    );
}