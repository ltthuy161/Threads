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
    const replyBoxContainer = document.getElementById('reply-box-container');

    if (replyBoxContainer.classList.contains('show') && replyBoxContainer.getAttribute('data-thread-id') === id) {
        replyBoxContainer.classList.remove('show');
        replyBoxContainer.removeAttribute('data-thread-id');
        return;
    }

    replyBoxContainer.setAttribute('data-thread-id', id);
    replyBoxContainer.classList.add('show');

    const replyForm = document.getElementById('reply-form');
    replyForm.reset();
    replyForm.setAttribute('data-parent-id', id);
};




window.closeReplyBox = function () {
    const replyBoxContainer = document.getElementById('reply-box-container');
    replyBoxContainer.classList.remove('show'); 
    replyBoxContainer.removeAttribute('data-thread-id'); 
};

async function changeIcon(button, threadId) {
    const img = button.querySelector("img");
    const countSpan = button.parentElement.querySelector(".interaction-count"); 
    
    let isLiked = img.src.includes("-2.svg");
    if (isLiked) {
        img.src = img.src.replace("-2.svg", ".svg");
        countSpan.textContent = parseInt(countSpan.textContent) - 1;
    } else {
        img.src = img.src.replace(".svg", "-2.svg");
        countSpan.textContent = parseInt(countSpan.textContent) + 1;
    }

    try {
        const response = await fetch('/toggle-like', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ threadId}),
        });

        const result = await response.json();

        if (!response.ok) {
            alert(result.error || 'Failed to toggle like');
            if (isLiked) {
                img.src = img.src.replace(".svg", "-2.svg");
                countSpan.textContent = parseInt(countSpan.textContent) + 1;
            } else {
                img.src = img.src.replace("-2.svg", ".svg");
                countSpan.textContent = parseInt(countSpan.textContent) - 1;
            }
        }
    } catch (error) {
        console.error('Error toggling like:', error);
        alert('An error occurred while toggling like.');
    }
}

