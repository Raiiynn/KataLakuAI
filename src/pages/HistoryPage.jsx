import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { supabase } from '../utils/supabase';
import { Clock, Search, Copy, Calendar, MessageSquare, Share2 } from 'lucide-react';
import './ProtectedPages.css';

export default function HistoryPage() {
  const { user } = useAuth();
  const toast = useToast();
  
  const [captions, setCaptions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchHistory() {
      if (!user?.id) return;
      try {
        const { data, error } = await supabase
          .from('captions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setCaptions(data || []);
      } catch (err) {
        console.error('Error fetching history:', err);
        // Do not crash, keep empty list
      } finally {
        setIsLoading(false);
      }
    }

    fetchHistory();
  }, [user]);

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Caption copied!');
  };

  const filteredCaptions = captions.filter(c => 
    c.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.platform.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.tone.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="page-container animate-fade-in-up">
      <div className="page-header">
        <h1><Clock size={28} /> Caption History</h1>
        <p>Browse and reuse your previously generated captions.</p>
      </div>

      <div className="page-toolbar">
        <div className="form-input-wrapper" style={{ maxWidth: '360px' }}>
          <Search size={18} className="form-input-icon" />
          <input
            type="text"
            className="form-input"
            placeholder="Search captions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="history-loading" style={{ textAlign: 'center', padding: 'var(--space-12)' }}>
          <div className="spinner spinner-lg spinner-primary" style={{ margin: '0 auto var(--space-4)' }} />
          <p>Loading history...</p>
        </div>
      ) : filteredCaptions.length > 0 ? (
        <div className="history-list" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {filteredCaptions.map((item) => (
            <div key={item.id} className="card history-item" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <div className="history-item-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                  <span className="badge badge-primary">{item.platform}</span>
                  <span className="badge badge-success">{item.tone}</span>
                </div>
                <div className="history-item-time" style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Calendar size={12} />
                  {new Date(item.created_at).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
              
              <div className="history-item-prompt" style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.02)', padding: 'var(--space-2) var(--space-3)', borderRadius: 'var(--radius-md)', borderLeft: '3px solid var(--primary-500)' }}>
                <strong>Prompt:</strong> {item.description}
              </div>

              <div className="history-item-body" style={{ fontSize: 'var(--text-sm)', whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
                {item.content}
              </div>

              <div className="history-item-actions" style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--glass-border)', paddingTop: 'var(--space-3)' }}>
                <button className="btn btn-secondary btn-sm" onClick={() => handleCopy(item.content)}>
                  <Copy size={12} /> Copy Caption
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state card">
          <Clock size={48} />
          <h3>No captions found</h3>
          <p>
            {searchTerm ? 'Try adjusting your search query.' : 'Your generated captions will appear here. Start by creating your first caption!'}
          </p>
        </div>
      )}
    </div>
  );
}
