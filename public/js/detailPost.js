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

function changeIcon(button) {
    const img = button.querySelector("img"); 
    
    if (img.src.includes("-2.svg")) {
        img.src = img.src.replace("-2.svg", ".svg");
    } else {
        img.src = img.src.replace(".svg", "-2.svg");
    }
}
