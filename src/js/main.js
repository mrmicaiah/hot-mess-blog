// Direct Courier API endpoint
const COURIER_API = 'https://email-bot-server.micaiah-tasks.workers.dev/api/subscribe';

// Config from site.json (injected by base.njk)
const CONFIG = window.SITE_CONFIG || {
    blogId: 'the-hot-mess',
    workerUrl: 'https://up-blogs-1.micaiah-tasks.workers.dev',
    courierListId: 'd025bdf6-7b20-4fbf-b687-2e5050a68b26'
};

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
            // Call Courier directly with list slug (same as blog ID)
            const response = await fetch(COURIER_API, {
                method: 'POST', 
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    email,
                    list: CONFIG.blogId,
                    source: `blog:${CONFIG.blogId}`
                })
            });
            
            const data = await response.json();
            
            if (response.ok && data.success) {
                button.textContent = 'Subscribed! ✓';
                subscribeForm.querySelector('input').value = '';
            } else { 
                throw new Error(data.error || 'Subscribe failed'); 
            }
        } catch (err) { 
            console.error('Subscribe error:', err);
            button.textContent = 'Error - Try Again'; 
        }
        
        setTimeout(() => { 
            button.textContent = originalText; 
            button.disabled = false; 
        }, 3000);
    });
}

function shareOnTwitter(url, title) {
    window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`, '_blank', 'width=550,height=420');
}

function shareOnFacebook(url) {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank', 'width=550,height=420');
}

function copyLink(url) {
    navigator.clipboard.writeText(url).then(() => {
        const copyBtn = document.querySelector('.share-btn.copy');
        if (copyBtn) { 
            const orig = copyBtn.textContent; 
            copyBtn.textContent = 'Copied!'; 
            setTimeout(() => copyBtn.textContent = orig, 2000); 
        }
    });
}

async function toggleLike(postSlug) {
    try {
        const response = await fetch(`${CONFIG.workerUrl}/${CONFIG.blogId}/posts/${postSlug}/like`, { 
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' } 
        });
        if (response.ok) {
            const data = await response.json();
            document.querySelector('.like-btn').classList.add('liked');
            document.querySelector('.like-count').textContent = `${data.likes} ${data.likes === 1 ? 'like' : 'likes'}`;
        }
    } catch (err) { 
        console.error('Like failed:', err); 
    }
}

async function loadLikeCount(postSlug) {
    const likeCount = document.querySelector('.like-count');
    if (!likeCount) return;
    try {
        const response = await fetch(`${CONFIG.workerUrl}/${CONFIG.blogId}/posts/${postSlug}/likes`);
        if (response.ok) { 
            const data = await response.json(); 
            likeCount.textContent = `${data.likes} ${data.likes === 1 ? 'like' : 'likes'}`; 
        } else { 
            likeCount.textContent = '0 likes'; 
        }
    } catch { 
        likeCount.textContent = '0 likes'; 
    }
}

async function loadComments(postSlug) {
    const commentsList = document.querySelector('.comments-list');
    if (!commentsList) return;
    try {
        const response = await fetch(`${CONFIG.workerUrl}/${CONFIG.blogId}/posts/${postSlug}/comments`);
        if (response.ok) {
            const data = await response.json();
            const comments = data.comments || data || [];
            if (comments.length === 0) { 
                commentsList.innerHTML = '<p>No comments yet. Be the first!</p>'; 
                return; 
            }
            commentsList.innerHTML = comments.map(c => `
                <div class="comment">
                    <div class="comment-author">${escapeHtml(c.name || c.author || 'Anonymous')}</div>
                    <div class="comment-date">${formatDate(c.createdAt || c.created_at)}</div>
                    <div class="comment-text">${escapeHtml(c.content || c.text)}</div>
                </div>
            `).join('');
        } else { 
            commentsList.innerHTML = '<p>No comments yet. Be the first!</p>'; 
        }
    } catch { 
        commentsList.innerHTML = '<p>No comments yet. Be the first!</p>'; 
    }
}

async function submitComment(postSlug, author, text) {
    try {
        const response = await fetch(`${CONFIG.workerUrl}/${CONFIG.blogId}/posts/${postSlug}/comments`, {
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ postId: postSlug, name: author, content: text })
        });
        if (response.ok) { 
            loadComments(postSlug); 
            return true; 
        }
    } catch (err) { 
        console.error('Submit comment failed:', err); 
    }
    return false;
}

function escapeHtml(text) { 
    if (!text) return ''; 
    const div = document.createElement('div'); 
    div.textContent = text; 
    return div.innerHTML; 
}

function formatDate(dateString) { 
    if (!dateString) return ''; 
    return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }); 
}
