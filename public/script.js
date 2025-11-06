const STORAGE_KEY = 'simpleThreadData';

function loadData() {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
}

function saveData(threads) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(threads));
}

function renderThreads() {
    const threads = loadData();
    const container = document.getElementById('threads-container');
    container.innerHTML = '';

    threads.forEach(thread => {
        const threadEl = document.createElement('div');
        threadEl.className = 'thread-post';
        threadEl.innerHTML = `
            <div class="thread-header">
                <span>${thread.author || '匿名用户'}</span>
                <span>
                    <span class="timestamp">${new Date(thread.timestamp).toLocaleString()}</span>
                    <button class="delete-btn" onclick="deleteThread('${thread.id}')">删除</button>
                </span>
            </div>
            <div class="thread-content">${thread.content}</div>
            <button onclick="toggleReplyForm('${thread.id}')">回复</button>
            <div id="reply-form-${thread.id}" class="reply-form" style="display:none; margin-top: 10px;">
                <input type="text" id="reply-author-${thread.id}" placeholder="你的名字 (留空则为 匿名)">
                <textarea id="reply-content-${thread.id}" placeholder="输入回复内容..." required></textarea>
                <button onclick="postReply('${thread.id}')">提交回复</button>
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
        replyEl.innerHTML = `
            <div class="reply-header">
                <span>${reply.author || '匿名用户'}</span>
                <span>
                    <span class="timestamp">${new Date(reply.timestamp).toLocaleString()}</span>
                    <button class="delete-btn" onclick="deleteReply('${threadId}', ${index})">删除</button>
                </span>
            </div>
            <div class="reply-content">${reply.content}</div>
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
        alert('贴文内容不能为空！');
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
    threads.unshift(newThread);

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
        alert('回复内容不能为空！');
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
    if (!confirm('确定要删除这条贴文吗？')) {
        return;
    }
    
    let threads = loadData();
    threads = threads.filter(t => t.id !== threadId);
    
    saveData(threads);
    renderThreads();
}

function deleteReply(threadId, replyIndex) {
    if (!confirm('确定要删除这条回复吗？')) {
        return;
    }

    const threads = loadData();
    const threadIndex = threads.findIndex(t => t.id === threadId);

    if (threadIndex > -1) {
        // 使用 splice(index, 1) 删除指定索引的回复
        threads[threadIndex].replies.splice(replyIndex, 1);
        saveData(threads);
        renderThreads();
    }
}

document.addEventListener('DOMContentLoaded', renderThreads);