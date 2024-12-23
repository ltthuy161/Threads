function handlePostClick(event, postElement) {
    const excludedClasses = ["icon", "interaction-button", "avt-container", "username", "email", "timestamp"];
    if (excludedClasses.some(cls => event.target.classList.contains(cls))) {
        return;
    }
    const postId = postElement.getAttribute("data-id");

    if (postId) {
        window.location.href = `/threads/detail/${postId}`; 
    }
}

function goToHomepage() {
    history.back();
}

window.showReplyBox = function (id) {
    console.log('Thread ID:', id);

    const replyBoxContainer = document.getElementById('reply-box-container');

    // Gửi yêu cầu đến server để lấy thông tin thread
    fetch(`/threads/${id}`)
        .then(response => {
            if (!response.ok) {
                console.error(`Error: ${response.status} - ${response.statusText}`);
                throw new Error('Thread not found');
            }
            return response.json();
        })
        .then(data => {
            const thread = data.thread;

            console.log('Thread fetched:', thread);

            if (!thread) {
                alert("Thread not found!");
                return;
            }

           
            replyBoxContainer.innerHTML = `
                <div class="reply-box-content d-flex justify-content-center w-60">
                    <form id="reply-form" data-parent-id="${thread._id}" onsubmit="submitReply(event, '${id}')">
                        <div class="card text-light p-3" style="width: 400px; background-color: var(--primary-900); border: none; outline: none;">
                            <div class="d-flex align-items-center mb-3">
                                <img src="${thread.userId?.profilePicture || ''}" alt="Avatar" class="rounded-circle me-3" style="width: 50px; height: 50px;">
                                <div class="flex-grow-1">
                                    <h5 class="mb-0" style="color: var(--primary-150);">${thread.userId?.username || 'Unknown'}</h5>
                                    <small class="text-muted">${thread.userId?.email || 'Unknown email'}</small>
                                </div>
                                <small class="text-muted">${new Date(thread.createdAt).toLocaleString()}</small>
                            </div>
                            <p class="mb-3">${thread.content}</p>
                            <div class="d-flex align-items-center flex-wrap border-top pt-3">
                                <textarea class="reply-input w-100" name="content" placeholder="Post your reply"></textarea>
                                <div class="reply-actions d-flex align-items-center mt-2 w-100">
                                    <label for="add-image" style="cursor: pointer;" class="me-3">
                                        <i class="bi bi-images fs-6 text-white"></i>
                                    </label>
                                    <input id="add-image" type="file" name="image" accept="image/*" />
                                    <button class="btn btn-primary ms-auto" type="submit">Reply</button>
                                </div>
                            </div>
                        </div>
                    </form>
                    <button class="close-button" style="border: none; outline: none;" onclick="closeReplyBox()">✖</button>
                </div>
            `;
            replyBoxContainer.style.display = 'block';
        })
        .catch(error => {
            console.error('Error fetching thread:', error);
            alert('Failed to load reply box. Please try again.');
        });
};


window.closeReplyBox = function () {
    const replyBoxContainer = document.getElementById('reply-box-container');
    replyBoxContainer.style.display = 'none';
    replyBoxContainer.innerHTML = '';
};
