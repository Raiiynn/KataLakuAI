import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { supabase } from '../utils/supabase';
import { CalendarDays, Save, Trash, Plus, Edit2, X } from 'lucide-react';
import './ProtectedPages.css';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function ContentPlannerPage() {
  const { user } = useAuth();
  const toast = useToast();

  const [posts, setPosts] = useState({}); // { 'Mon': { id, content }, ... }
  const [editingDay, setEditingDay] = useState(null);
  const [editingText, setEditingText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function fetchPlanner() {
      if (!user?.id) return;
      try {
        const { data, error } = await supabase
          .from('planner_posts')
          .select('*')
          .eq('user_id', user.id);

        if (error) throw error;
        
        // Map list to day keys
        const mapped = {};
        data?.forEach(post => {
          mapped[post.day] = { id: post.id, content: post.content };
        });
        setPosts(mapped);
      } catch (err) {
        console.error('Error fetching planner posts:', err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchPlanner();
  }, [user]);

  const handleEditStart = (day) => {
    setEditingDay(day);
    setEditingText(posts[day]?.content || '');
  };

  const handleSave = async (day) => {
    if (!user?.id) return;
    setIsSaving(true);
    try {
      const existing = posts[day];
      if (existing) {
        if (!editingText.trim()) {
          // Delete if text cleared
          await handleDelete(day);
        } else {
          // Update
          const { error } = await supabase
            .from('planner_posts')
            .update({ content: editingText })
            .eq('id', existing.id);
          
          if (error) throw error;
          
          setPosts(prev => ({
            ...prev,
            [day]: { ...existing, content: editingText }
          }));
          toast.success(`Post for ${day} updated!`);
        }
      } else {
        if (editingText.trim()) {
          // Insert new
          const { data, error } = await supabase
            .from('planner_posts')
            .insert({
              user_id: user.id,
              day,
              content: editingText,
              created_at: new Date().toISOString()
            })
            .select()
            .single();

          if (error) throw error;

          setPosts(prev => ({
            ...prev,
            [day]: { id: data.id, content: data.content }
          }));
          toast.success(`Post for ${day} scheduled!`);
        }
      }
      setEditingDay(null);
    } catch (err) {
      toast.error('Failed to save planner post.');
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (day) => {
    const existing = posts[day];
    if (!existing) return;

    try {
      const { error } = await supabase
        .from('planner_posts')
        .delete()
        .eq('id', existing.id);

      if (error) throw error;

      setPosts(prev => {
        const copy = { ...prev };
        delete copy[day];
        return copy;
      });
      toast.success(`Post for ${day} removed.`);
    } catch (err) {
      toast.error('Failed to delete post.');
      console.error(err);
    }
  };

  return (
    <div className="page-container animate-fade-in-up">
      <div className="page-header">
        <h1><CalendarDays size={28} /> Content Planner</h1>
        <p>Plan and schedule your social media content for the week.</p>
      </div>

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: 'var(--space-12)' }}>
          <div className="spinner spinner-lg spinner-primary" style={{ margin: '0 auto var(--space-4)' }} />
          <p>Loading planner...</p>
        </div>
      ) : (
        <div className="planner-grid">
          {DAYS.map(day => {
            const post = posts[day];
            const isEditing = editingDay === day;

            return (
              <div key={day} className="planner-day card" style={{ display: 'flex', flexDirection: 'column', minHeight: '220px' }}>
                <div className="planner-day-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2)' }}>
                  <h3 className="planner-day-label" style={{ margin: 0, border: 'none', padding: 0 }}>{day}</h3>
                  {post && !isEditing && (
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button className="btn-ghost" onClick={() => handleEditStart(day)} style={{ padding: '4px' }} title="Edit post">
                        <Edit2 size={12} />
                      </button>
                      <button className="btn-ghost" onClick={() => handleDelete(day)} style={{ padding: '4px', color: 'var(--error)' }} title="Delete post">
                        <Trash size={12} />
                      </button>
                    </div>
                  )}
                </div>

                <div className="planner-day-content" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: isEditing ? 'space-between' : 'center' }}>
                  {isEditing ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', width: '100%', height: '100%' }}>
                      <textarea
                        className="form-input"
                        value={editingText}
                        onChange={(e) => setEditingText(e.target.value)}
                        placeholder="Write planned caption..."
                        style={{ flex: 1, minHeight: '80px', fontSize: 'var(--text-xs)', resize: 'none', padding: 'var(--space-2)' }}
                      />
                      <div style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end' }}>
                        <button className="btn btn-secondary btn-sm" onClick={() => setEditingDay(null)} disabled={isSaving}>
                          <X size={12} />
                        </button>
                        <button className="btn btn-primary btn-sm" onClick={() => handleSave(day)} disabled={isSaving}>
                          <Save size={12} />
                        </button>
                      </div>
                    </div>
                  ) : post ? (
                    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
                      <p className="planner-post-text" style={{ fontSize: 'var(--text-xs)', color: 'var(--text-primary)', whiteSpace: 'pre-wrap', textAlign: 'left', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 5, WebkitBoxOrient: 'vertical', flex: 1 }}>
                        {post.content}
                      </p>
                    </div>
                  ) : (
                    <>
                      <p className="planner-empty-text">No posts planned</p>
                      <button className="btn btn-ghost btn-sm" onClick={() => handleEditStart(day)}>
                        <Plus size={12} /> Add Post
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
