// 1. 定义存储键名
const STORAGE_KEY = 'simpleThreadData';

// 2. 加载数据
function loadData() {
    const data = localStorage.getItem(STORAGE_KEY);
    // 如果本地有数据，就解析并返回；否则返回一个空数组
    return data ? JSON.parse(data) : [];
}

// 3. 保存数据
function saveData(threads) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(threads));
}

// 4. 渲染所有贴文
function renderThreads() {
    const threads = loadData();
    const container = document.getElementById('threads-container');
    container.innerHTML = ''; // 清空现有内容

    threads.forEach(thread => {
        // 创建贴文元素
        const threadEl = document.createElement('div');
        threadEl.className = 'thread-post';
        threadEl.innerHTML = `
            <div class="thread-header">
                ${thread.author || '匿名用户'} - <span>${new Date(thread.timestamp).toLocaleString()}</span>
            </div>
            <div class="thread-content">${thread.content.replace(/\n/g, '<br>')}</div>
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

        // 渲染回复
        renderReplies(thread.id, thread.replies || []);
    });
}

// 5. 渲染回复
function renderReplies(threadId, replies) {
    const repliesContainer = document.getElementById(`replies-${threadId}`);
    repliesContainer.innerHTML = '';

    replies.forEach(reply => {
        const replyEl = document.createElement('div');
        replyEl.className = 'reply-post';
        replyEl.innerHTML = `
            <div class="reply-header">
                ${reply.author || '匿名用户'} - <span>${new Date(reply.timestamp).toLocaleString()}</span>
            </div>
            <div class="reply-content">${reply.content.replace(/\n/g, '<br>')}</div>
        `;
        repliesContainer.appendChild(replyEl);
    });
}

// 6. 发表新贴文
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
        id: Date.now().toString(), // 使用时间戳作为唯一ID
        author: author,
        content: content,
        timestamp: new Date().toISOString(),
        replies: []
    };

    const threads = loadData();
    threads.unshift(newThread); // 新贴文放在最前面

    saveData(threads);

    // 清空表单
    authorInput.value = '';
    contentInput.value = '';

    renderThreads(); // 重新渲染页面
}

// 7. 切换回复表单的显示/隐藏
function toggleReplyForm(threadId) {
    const form = document.getElementById(`reply-form-${threadId}`);
    form.style.display = form.style.display === 'none' ? 'block' : 'none';
}

// 8. 提交回复
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
        threads[threadIndex].replies.push(newReply); // 回复放在贴文后面
        saveData(threads);

        // 清空表单并隐藏
        authorInput.value = '';
        contentInput.value = '';
        document.getElementById(`reply-form-${threadId}`).style.display = 'none';

        renderThreads(); // 重新渲染
    }
}

// 9. 页面加载完成后立即运行
document.addEventListener('DOMContentLoaded', renderThreads);

// 10. 额外：在控制台输入 localStorage.clear(); renderThreads(); 可以清空所有数据