import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Send,
  Bot,
  User as UserIcon,
  Upload,
  FileText,
  Landmark,
  ShieldCheck,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  sources?: { type: string; detail: string }[];
  timestamp: string;
}

export const AIAssistantView: React.FC = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `🏛️ **PRAVI Public Physical Assets Intelligence is Online.**\n\nI am connected to your live state registry including **Electric Transit Buses**, **Hospital MRI Units**, **Fire & Disaster Hydraulic Platforms**, and **Municipal Pumping Stations** under **GFR-2017 & MSTC** guidelines.\n\nTry asking me:\n* *"Which hospital medical equipment warranties expire soon?"*\n* *"What is the condemnation and e-auction process under GFR-2017?"*\n* *"Show maintenance history of Municipal Pump GOV-WTR-4004."*\n* *"Which electric buses and vehicles are deployed in Worli Depot?"*`,
      timestamp: new Date().toLocaleTimeString(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [documents, setDocuments] = useState<any[]>([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    title: '',
    category: 'SOP',
    content: '',
  });

  const chatEndRef = useRef<HTMLDivElement>(null);

  const fetchDocs = async () => {
    try {
      const res = await api.get('/ai/documents');
      setDocuments(res.data.data);
    } catch (err) {
      console.error('Failed to load documents', err);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || loading) return;

    const userMsg: Message = {
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.post('/ai/chat', { question: query });
      const botMsg: Message = {
        role: 'assistant',
        content: res.data.answer,
        sources: res.data.sources,
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      const errorMsg: Message = {
        role: 'assistant',
        content: `⚠️ Error executing government AI query: ${err.response?.data?.message || err.message}`,
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const [uploadSubmitting, setUploadSubmitting] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleUploadDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadError(null);
    setUploadSubmitting(true);
    try {
      await api.post('/ai/documents', uploadForm);
      setShowUploadModal(false);
      setUploadForm({ title: '', category: 'SOP', content: '' });
      fetchDocs();
    } catch (err: any) {
      console.error('Upload document failed', err);
      setUploadError(err.response?.data?.message || 'Failed to index circular. Please try again.');
    } finally {
      setUploadSubmitting(false);
    }
  };

  const quickPrompts = [
    'Which hospital medical equipment warranties expire soon?',
    'What is the condemnation and e-auction process under GFR-2017?',
    'Show maintenance history of Municipal Pump GOV-WTR-4004.',
    'Show status of electric city buses and transport fleet.',
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 340px', gap: '24px', height: 'calc(100vh - 120px)' }}>
      {/* Main Chat Interface */}
      <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
        {/* Chat Header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'rgba(0, 0, 0, 0.25)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)',
            }}>
              <Landmark size={20} color="#fff" />
            </div>
            <div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff' }}>PRAVI State Public Asset Intelligence</div>
              <div style={{ fontSize: '0.72rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} />
                Connected to Groq Llama-3.1 LLM • GFR-2017 Rules Synced
              </div>
            </div>
          </div>
        </div>

        {/* Message Log */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {messages.map((m, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                gap: '12px',
                alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '85%',
              }}
            >
              {m.role === 'assistant' && (
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <Bot size={18} color="#fff" />
                </div>
              )}

              <div style={{
                background: m.role === 'user' ? 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)' : 'rgba(255, 255, 255, 0.04)',
                border: m.role === 'user' ? 'none' : '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '12px',
                padding: '14px 18px',
                color: '#fff',
                fontSize: '0.88rem',
                lineHeight: '1.55',
                boxShadow: m.role === 'user' ? '0 4px 14px rgba(245, 158, 11, 0.3)' : 'none',
              }}>
                <div style={{ whiteSpace: 'pre-wrap' }}>{m.content}</div>

                {m.sources && m.sources.length > 0 && (
                  <div style={{
                    marginTop: '12px',
                    paddingTop: '8px',
                    borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '6px',
                  }}>
                    {m.sources.map((s, sIdx) => (
                      <span
                        key={sIdx}
                        style={{
                          fontSize: '0.68rem',
                          padding: '2px 8px',
                          borderRadius: '6px',
                          background: 'rgba(245, 158, 11, 0.15)',
                          color: '#fef3c7',
                          border: '1px solid rgba(245, 158, 11, 0.3)',
                        }}
                      >
                        Source: {s.type} ({s.detail})
                      </span>
                    ))}
                  </div>
                )}

                <div style={{ fontSize: '0.68rem', color: m.role === 'user' ? 'rgba(255,255,255,0.7)' : '#6b7280', marginTop: '6px', textAlign: 'right' }}>
                  {m.timestamp}
                </div>
              </div>

              {m.role === 'user' && (
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <UserIcon size={18} color="#fff" />
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', color: '#9ca3af', fontSize: '0.85rem' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: '#f59e0b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Sparkles size={16} color="#fff" />
              </div>
              <span>Auditing state public records & GFR guidelines via Groq Llama-3.1...</span>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Quick Prompts */}
        <div style={{ padding: '8px 20px', display: 'flex', gap: '8px', overflowX: 'auto', background: 'rgba(0,0,0,0.1)' }}>
          {quickPrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(p)}
              style={{
                fontSize: '0.75rem',
                padding: '5px 12px',
                borderRadius: '20px',
                background: 'rgba(245, 158, 11, 0.08)',
                border: '1px solid rgba(245, 158, 11, 0.25)',
                color: '#fbbf24',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease',
              }}
            >
              {p}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', gap: '12px' }}>
          <input
            type="text"
            placeholder="Ask about hospital equipment, vehicle fleet, municipal pump maintenance, GFR rules..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSend();
            }}
            style={{
              flex: 1,
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '10px',
              padding: '12px 16px',
              color: '#fff',
              fontSize: '0.88rem',
              outline: 'none',
            }}
          />
          <button
            onClick={() => handleSend()}
            disabled={loading}
            className="btn btn-primary"
            style={{
              padding: '0 20px',
              background: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)',
            }}
          >
            <Send size={16} />
          </button>
        </div>
      </div>

      {/* Right Column: Government SOPs & Compliance Documents */}
      <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={18} color="#f59e0b" />
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff' }}>Statutory GFR Guidelines</h3>
          </div>
          <button
            onClick={() => setShowUploadModal(true)}
            className="btn btn-secondary"
            style={{ padding: '4px 8px', fontSize: '0.72rem' }}
          >
            <Upload size={13} /> Add SOP
          </button>
        </div>

        <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginBottom: '14px' }}>
          GFR-2017 rules, condemnation orders, and CAMC directives vector-indexed for retrieval.
        </p>

        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {documents.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#6b7280', fontSize: '0.8rem', padding: '20px' }}>
              No statutory guidelines uploaded yet.
            </div>
          ) : (
            documents.map((doc) => (
              <div
                key={doc._id}
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  borderRadius: '8px',
                  padding: '12px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#fff' }}>{doc.title}</div>
                  <span style={{ fontSize: '0.65rem', padding: '2px 6px', borderRadius: '4px', background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
                    {doc.category}
                  </span>
                </div>
                <div style={{ fontSize: '0.72rem', color: '#9ca3af', marginTop: '6px', maxHeight: '60px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {doc.content}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Upload Document Modal */}
      {showUploadModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(5px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
        }}>
          <div className="glass-panel" style={{ width: '480px', padding: '24px', backgroundColor: '#111827' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff', marginBottom: '14px' }}>
              Upload Government Circular / SOP
            </h3>

            <form onSubmit={handleUploadDoc} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {uploadError && (
                <div style={{
                  padding: '10px 12px',
                  backgroundColor: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: '8px',
                  color: '#f87171',
                  fontSize: '0.8rem',
                }}>
                  {uploadError}
                </div>
              )}

              <div>
                <label style={{ fontSize: '0.8rem', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>Circular / SOP Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Circular-2026: Mandate for Geo-Tagging Public Cranes"
                  value={uploadForm.title}
                  onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', background: '#1f2937', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', color: '#fff' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>Category</label>
                <select
                  value={uploadForm.category}
                  onChange={(e) => setUploadForm({ ...uploadForm, category: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', background: '#1f2937', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', color: '#fff' }}
                >
                  <option value="SOP">SOP</option>
                  <option value="Policy">Policy</option>
                  <option value="Compliance">Compliance</option>
                  <option value="Manual">Manual</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>Circular Text / Guidelines *</label>
                <textarea
                  rows={5}
                  required
                  placeholder="Paste procedure guidelines, inspection criteria, or financial thresholds..."
                  value={uploadForm.content}
                  onChange={(e) => setUploadForm({ ...uploadForm, content: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', background: '#1f2937', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', color: '#fff' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button type="button" onClick={() => setShowUploadModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploadSubmitting}
                  className="btn btn-primary"
                  style={{
                    background: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)',
                    opacity: uploadSubmitting ? 0.7 : 1,
                    cursor: uploadSubmitting ? 'not-allowed' : 'pointer',
                  }}
                >
                  {uploadSubmitting ? 'Indexing...' : 'Index Circular'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
