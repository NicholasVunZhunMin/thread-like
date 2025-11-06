const STORAGE_KEY = 'simpleThreadDataV2';

function loadData() {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
}

function saveData(threads) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(threads));
}

// NEW FUNCTION: Converts simple Markdown to HTML
function parseMarkdown(text) {
    let html = text;
    // 1. **Bold**
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    // 2. *Italics*
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    // 3. [Link Text](URL)
    html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank">$1</a>');
    
    // Convert new lines to <br> for better display
    html = html.replace(/\n/g, '<br>');

    return html;
}

function renderThreads() {
    const threads = loadData();
    const container = document.getElementById('threads-container');
    container.innerHTML = '';

    threads.forEach(thread => {
        const threadEl = document.createElement('div');
        threadEl.className = 'thread-post';

        // Apply Markdown conversion before displaying content
        const contentHTML = parseMarkdown(thread.content);

        threadEl.innerHTML = `
            <div class="thread-header">
                <div class="author-info">
                    ${thread.author || 'Anonymous'}
                    <span class="timestamp">${new Date(thread.timestamp).toLocaleString()}</span>
                </div>
                <button class="delete-btn" onclick="deleteThread('${thread.id}')">Delete</button>
            </div>
            <div class="thread-content">${contentHTML}</div>
            
            <button onclick="toggleReplyForm('${thread.id}')">Reply</button>
            <div id="reply-form-${thread.id}" class="reply-form" style="display:none; margin-top: 15px;">
                <input type="text" id="reply-author-${thread.id}" placeholder="Your Name (Anonymous if empty)">
                <textarea id="reply-content-${thread.id}" placeholder="Enter your reply..." required></textarea>
                <button onclick="postReply('${thread.id}')">Submit Reply</button>
            </div>
            <div class="replies-section" id="replies-${thread.id}">
                </div>
        `;
        container.appendChild(threadEl);

        renderReplies(thread.id, thread.replies || []);
    });
}

function renderReplies(threadId, replies) {
    const repliesContainer = document.getElementById(`replies-${threadId}`);
    repliesContainer.innerHTML = '';

    replies.forEach((reply, index) => {
        const replyEl = document.createElement('div');
        replyEl.className = 'reply-post';

        // Apply Markdown conversion to replies
        const replyContentHTML = parseMarkdown(reply.content);

        replyEl.innerHTML = `
            <div class="reply-header">
                <div class="author-info">
                    ${reply.author || 'Anonymous'}
                    <span class="timestamp">${new Date(reply.timestamp).toLocaleString()}</span>
                </div>
                <button class="delete-btn" onclick="deleteReply('${threadId}', ${index})">Delete</button>
            </div>
            <div class="reply-content">${replyContentHTML}</div>
        `;
        repliesContainer.appendChild(replyEl);
    });
}

function postThread() {
    const authorInput = document.getElementById('thread-author');
    const contentInput = document.getElementById('thread-content');

    const author = authorInput.value.trim();
    const content = contentInput.value.trim();

    if (content === '') {
        alert('Content cannot be empty!');
        return;
    }

    const newThread = {
        id: Date.now().toString(),
        author: author,
        content: content,
        timestamp: new Date().toISOString(),
        replies: []
    };

    const threads = loadData();
    threads.unshift(newThread); // Add new thread to the top

    saveData(threads);

    authorInput.value = '';
    contentInput.value = '';

    renderThreads();
}

function toggleReplyForm(threadId) {
    const form = document.getElementById(`reply-form-${threadId}`);
    form.style.display = form.style.display === 'none' ? 'block' : 'none';
}

function postReply(threadId) {
    const authorInput = document.getElementById(`reply-author-${threadId}`);
    const contentInput = document.getElementById(`reply-content-${threadId}`);

    const author = authorInput.value.trim();
    const content = contentInput.value.trim();

    if (content === '') {
        alert('Reply content cannot be empty!');
        return;
    }

    const newReply = {
        author: author,
        content: content,
        timestamp: new Date().toISOString(),
    };

    const threads = loadData();
    const threadIndex = threads.findIndex(t => t.id === threadId);

    if (threadIndex > -1) {
        threads[threadIndex].replies.push(newReply);
        saveData(threads);

        authorInput.value = '';
        contentInput.value = '';
        document.getElementById(`reply-form-${threadId}`).style.display = 'none';

        renderThreads();
    }
}

function deleteThread(threadId) {
    if (!confirm('Are you sure you want to delete this blink?')) {
        return;
    }
    
    let threads = loadData();
    threads = threads.filter(t => t.id !== threadId);
    
    saveData(threads);
    renderThreads();
}

function deleteReply(threadId, replyIndex) {
    if (!confirm('Are you sure you want to delete this reply?')) {
        return;
    }

    const threads = loadData();
    const threadIndex = threads.findIndex(t => t.id === threadId);

    if (threadIndex > -1) {
        threads[threadIndex].replies.splice(replyIndex, 1);
        saveData(threads);
        renderThreads();
    }
}

document.addEventListener('DOMContentLoaded', renderThreads);