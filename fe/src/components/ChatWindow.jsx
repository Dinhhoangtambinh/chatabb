import React, { useEffect, useRef, useState } from 'react';
import conversationsApi from '../services/conversationsApi';
import messagesApi from '../services/messagesApi';
import Spinner from './Spinner';

export default function ChatWindow({ conversationId, userId, onNewConversation }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [files, setFiles] = useState([]);
  const [filePreviews, setFilePreviews] = useState([]);

  const listRef = useRef(null);
  const lastMessageIdRef = useRef(null);
  const pendingRetryRef = useRef(null);
    const stopTimeoutRef = useRef(null);

  const fetchAndUpdateMessages = async () => {
        try {
        const res = await messagesApi.getByConversationId(conversationId);
        const data = res?.data || [];
        const normalized = data
            .map((mm) => ({
            id: mm.id,
            content: mm.content,
            sender: mm.sender,
            created_at: mm.created_at,
            files: mm.files || [],
            }))
            .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

        const seen = new Set();
        const unique = [];
        normalized.forEach((m) => {
            const id = m.id || `${m.sender}-${m.created_at}-${m.content}`;
            if (!seen.has(id)) {
            seen.add(id);
            unique.push(m);
            }
        });

        const newLastId = unique.length ? unique[unique.length - 1].id : null;
        if (newLastId !== lastMessageIdRef.current || unique.length !== messages.length) {
            setMessages(unique);
            lastMessageIdRef.current = newLastId;
            requestAnimationFrame(() => {
            if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
            });
        }

        return unique;
        } catch (err) {
        console.error('Failed to load messages', err);
        return messages;
        } finally {
        setLoading(false);
        }
    };

    useEffect(() => {
    fetchAndUpdateMessages();
    return () => {
        if (pendingRetryRef.current) {
        clearInterval(pendingRetryRef.current);
        pendingRetryRef.current = null;
        }
        if (stopTimeoutRef.current) {
        clearTimeout(stopTimeoutRef.current);
        stopTimeoutRef.current = null;
        }
    };
    }, [conversationId]);


    const displayName = localStorage.getItem('displayName') || 'Bạn';
    const formatTimestamp = (ts) => {
        try {
        const d = new Date(ts);
        if (isNaN(d.getTime())) return '';
        return d.toLocaleString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
        } catch (e) {
        return '';
        }
    };

    const handleCreateNewConversation = async () => {
        try {
        const now = new Date();
        const title = `conversation - ${now.toLocaleString()}`;
        const res = await conversationsApi.create({ title });
        const id = res?.data?.id || res?.data?._id || res?.data;
        if (id) {
            localStorage.setItem('conversation_id', id);
            if (onNewConversation && typeof onNewConversation === 'function') {
            onNewConversation(id);
            }
        }
        } catch (err) {
        console.error('Failed to create new conversation', err);
        }
    };

    const handleFileChange = (e) => {
        const fls = Array.from(e.target.files || []);
        const previews = fls.map((f) =>
        f.type && f.type.startsWith('image/') ? URL.createObjectURL(f) : null
        );
        setFiles((prev) => prev.concat(fls));
        setFilePreviews((prev) => prev.concat(previews));
        e.target.value = null;
    };

    const handleRemoveFile = (index) => {
        setFiles((prev) => prev.filter((_, i) => i !== index));
        setFilePreviews((prev) => {
        const url = prev[index];
        if (url) URL.revokeObjectURL(url);
        return prev.filter((_, i) => i !== index);
        });
    };

    // ---- Send Message ----
    const send = async () => {
        if (!text.trim() && files.length === 0) return;
        setSending(true);
        try {
        await conversationsApi.sendMessage(conversationId, { content: text, files });
        const updated = await fetchAndUpdateMessages();

        // clear
        setText('');
        filePreviews.forEach((u) => u && URL.revokeObjectURL(u));
        setFilePreviews([]);
        setFiles([]);

        const newTotal = updated.length;
            // start a reply poll for 30s, interval 2s, only if total is odd
            if (pendingRetryRef.current) { clearInterval(pendingRetryRef.current); pendingRetryRef.current = null; }
            if (stopTimeoutRef.current) { clearTimeout(stopTimeoutRef.current); stopTimeoutRef.current = null; }

            if (newTotal % 2 === 1) {
                pendingRetryRef.current = setInterval(async () => {
                try {
                    const after = await fetchAndUpdateMessages();
                    // stop if total becomes even or last sender is system
                    const last = after[after.length - 1];
                    if ((after.length % 2 === 0) || (last && last.sender === 'system')) {
                    if (pendingRetryRef.current) { clearInterval(pendingRetryRef.current); pendingRetryRef.current = null; }
                    if (stopTimeoutRef.current) { clearTimeout(stopTimeoutRef.current); stopTimeoutRef.current = null; }
                    }
                } catch (e) { console.error('Reply poll failed', e); }
                }, 2000);

                stopTimeoutRef.current = setTimeout(() => {
                if (pendingRetryRef.current) { clearInterval(pendingRetryRef.current); pendingRetryRef.current = null; }
                stopTimeoutRef.current = null;
                }, 30000);
            }
        } catch (err) {
        console.error('Send failed', err);
        } finally {
        setSending(false);
        }
    };

    // ---- UI ----
    if (loading) return <Spinner />;

    return (
        <div className="bg-[var(--subBg)] rounded-xl shadow p-4 flex flex-col h-[95vh]">
        <div className="flex-1 overflow-auto mb-4" ref={listRef} style={{ padding: '8px' }}>
            {messages.length === 0 && (
            <div className="text-center text-sm text-[var(--dark2)]">Bắt đầu trò chuyện...</div>
            )}
            {messages.map((m) => {
            const role = m.sender;
            const name = role === 'user' ? displayName : 'GPT';
            const timestamp = m.created_at;
            const timeStr = timestamp ? formatTimestamp(timestamp) : '';
            return (
                <div
                data-aos="fade-up"
                key={m.id}
                className={`mb-3 flex ${role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                <div
                    className={`${
                    role === 'user'
                        ? 'bg-[var(--mainBg)] text-[var(--dark4)]'
                        : 'bg-[var(--dark3)] text-[var(--mainBg)]'
                    } px-3 py-2 rounded-lg max-w-[80%]`}
                >
                    <div className="text-xs opacity-80 mb-1 font-medium">
                    <span>{name}</span>
                    {timeStr && (
                        <span
                        className={`${
                            role === 'user'
                            ? 'ml-2 text-[11px] text-[var(--dark2)]'
                            : 'ml-2 text-[11px] text-[var(--mainBg2)]'
                        }`}
                        >
                        {timeStr}
                        </span>
                    )}
                    </div>
                    <div className="whitespace-pre-wrap break-words text-sm leading-relaxed">
                    {m.content}
                    </div>
                    {m.files && m.files.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                        {m.files.map((a, i) => {
                        const url = a.fileurl || a.url || a.path || a.fileUrl;
                        const filetype = a.filetype || (a.filename || '').split('.').pop();
                        const isImage =
                            filetype === 'image' ||
                            (a.mime && a.mime.startsWith('image/')) ||
                            (url && /\.(png|jpe?g|gif|webp)$/i.test(url));
                        if (isImage && url) {
                            return (
                            <img
                                key={i}
                                src={url}
                                alt={a.filename || a.name}
                                className="w-24 h-24 object-cover rounded"
                            />
                            );
                        }
                        return (
                            <a
                            key={i}
                            className="underline text-sm"
                            href={url}
                            target="_blank"
                            rel="noreferrer"
                            >
                            {a.filename || a.name || url}
                            </a>
                        );
                        })}
                    </div>
                    )}
                </div>
                </div>
            );
            })}
        </div>

        <div className="border-t pt-3">
            {files.length > 0 && (
            <div className="mb-2 flex gap-2">
                {files.map((f, i) => (
                <div key={i} className="flex items-center gap-2 bg-gray-100 px-2 py-1 rounded">
                    {filePreviews[i] ? (
                    <img src={filePreviews[i]} alt={f.name} className="w-12 h-12 object-cover rounded" />
                    ) : (
                    <span className="text-sm">{f.name}</span>
                    )}
                    <button className="text-red-500" onClick={() => handleRemoveFile(i)}>
                    x
                    </button>
                </div>
                ))}
            </div>
            )}

            <div className="flex items-center justify-between mb-3">
            <div className="text-sm text-[var(--dark2)]">
                Conversation: <strong>{conversationId}</strong>
            </div>
            <div>
                <button
                onClick={handleCreateNewConversation}
                className="px-3 py-1 bg-gray-200 rounded mr-2"
                >
                Tạo cuộc trò chuyện mới
                </button>
            </div>
            </div>

            <div className="flex items-center gap-2">
            <label className="bg-gray-200 px-3 py-2 rounded cursor-pointer">
                Tệp
                <input type="file" accept="*/*" multiple onChange={handleFileChange} className="hidden" />
            </label>

            <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    send();
                }
                }}
                placeholder="Nhập tin nhắn..."
                className="flex-1 px-3 py-2 rounded border"
            />
            <button
                onClick={send}
                disabled={sending}
                className="bg-[var(--dark3)] text-white px-4 py-2 rounded"
            >
                {sending ? 'Đang gửi...' : 'Gửi'}
            </button>
            </div>
        </div>
        </div>
    );
    }
