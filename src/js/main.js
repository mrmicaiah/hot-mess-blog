// The Hot Mess - Main JavaScript
const CONFIG = window.SITE_CONFIG || { blogId: 'the-hot-mess', workerUrl: 'https://up-blogs-1.micaiah-tasks.workers.dev', courierListId: '' };

// Subscribe Form
const subscribeForm = document.getElementById('subscribe-form');
if (subscribeForm) {
  subscribeForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = subscribeForm.querySelector('input[type="email"]').value;
    const button = subscribeForm.querySelector('button');
    const originalText = button.textContent;
    button.textContent = 'Subscribing...';
    button.disabled = true;
    try {
      const response = await fetch(`${CONFIG.workerUrl}/${CONFIG.blogId}/subscribe`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      if (response.ok) {
        button.textContent = 'Subscribed! ✓';
        subscribeForm.querySelector('input').value = '';
        setTimeout(() => { button.textContent = originalText; button.disabled = false; }, 3000);
      } else { throw new Error('Subscribe failed'); }
    } catch (err) {
      console.error('Subscribe error:', err);
      button.textContent = 'Error - Try Again';
      button.disabled = false;
      setTimeout(() => { button.textContent = originalText; }, 3000);
    }
  });
}

// Share Buttons
function shareOnTwitter(url, title) { window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`, '_blank', 'width=550,height=420'); }
function shareOnFacebook(url) { window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank', 'width=550,height=420'); }
function shareOnLinkedIn(url, title) { window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank', 'width=550,height=420'); }
function copyLink(url) {
  navigator.clipboard.writeText(url).then(() => {
    const copyBtn = document.querySelector('.share-btn.copy');
    if (copyBtn) { const t = copyBtn.textContent; copyBtn.textContent = 'Copied!'; setTimeout(() => { copyBtn.textContent = t; }, 2000); }
  }).catch(err => console.error('Copy failed:', err));
}

// Like Button
async function toggleLike(postSlug) {
  try {
    const response = await fetch(`${CONFIG.workerUrl}/${CONFIG.blogId}/posts/${postSlug}/like`, { method: 'POST', headers: { 'Content-Type': 'application/json' } });
    if (response.ok) {
      const data = await response.json();
      document.querySelector('.like-btn').classList.add('liked');
      document.querySelector('.like-count').textContent = `${data.likes} ${data.likes === 1 ? 'like' : 'likes'}`;
    }
  } catch (err) { console.error('Like failed:', err); }
}
async function loadLikeCount(postSlug) {
  const el = document.querySelector('.like-count');
  if (!el) return;
  try {
    const r = await fetch(`${CONFIG.workerUrl}/${CONFIG.blogId}/posts/${postSlug}/likes`);
    if (r.ok) { const d = await r.json(); el.textContent = `${d.likes} ${d.likes === 1 ? 'like' : 'likes'}`; }
    else { el.textContent = '0 likes'; }
  } catch { el.textContent = '0 likes'; }
}

// Comments
async function loadComments(postSlug) {
  const list = document.querySelector('.comments-list');
  if (!list) return;
  try {
    const r = await fetch(`${CONFIG.workerUrl}/${CONFIG.blogId}/posts/${postSlug}/comments`);
    if (r.ok) {
      const data = await r.json();
      const comments = data.comments || data || [];
      if (comments.length === 0) { list.innerHTML = '<p class="no-comments">No comments yet. Be the first!</p>'; return; }
      list.innerHTML = comments.map(c => `<div class="comment"><div class="comment-author">${escapeHtml(c.name || c.author || 'Anonymous')}</div><div class="comment-date">${formatDate(c.createdAt || c.created_at)}</div><div class="comment-text">${escapeHtml(c.content || c.text)}</div></div>`).join('');
    } else { list.innerHTML = '<p class="no-comments">No comments yet. Be the first!</p>'; }
  } catch { list.innerHTML = '<p class="no-comments">No comments yet. Be the first!</p>'; }
}
async function submitComment(postSlug, author, text) {
  try {
    const r = await fetch(`${CONFIG.workerUrl}/${CONFIG.blogId}/posts/${postSlug}/comments`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postId: postSlug, name: author, content: text })
    });
    if (r.ok) { loadComments(postSlug); return true; }
  } catch (err) { console.error('Submit comment failed:', err); }
  return false;
}

// Utilities
function escapeHtml(text) { if (!text) return ''; const d = document.createElement('div'); d.textContent = text; return d.innerHTML; }
function formatDate(s) { if (!s) return ''; return new Date(s).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }); }