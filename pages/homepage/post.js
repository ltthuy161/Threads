const posts = [
    {
        id: 1,
        avt: "../../assets/img/avatar/ava7.png",
        username: "Hitoriii",
        email: "@bocchi_theRock",
        timestamp: "3h",
        text: "TextLorem ipsum dolor sit amet consectetur adipisicing elit.",
        image: "../../assets/img/posts/post1.jpg",
        interactions: {
            likes: 5,
            comments: 5
        },
        replyTo: null
    },
    {
        id: 2,
        avt: "../../assets/img/avatar/ava8.png",
        username: "Hitoriii",
        email: "@bocchi_theRock",
        timestamp: "3h",
        text: "TextLorem ipsum dolor sit amet consectetur adipisicing elit.",
        image: "../../assets/img/posts/post2.jpg",
        interactions: {
            likes: 5,
            comments: 5
        },
        replyTo: null
    },
    {
        id: 3,
        avt: "../../assets/img/avatar/ava9.png",
        username: "Hitoriii",
        email: "@bocchi_theRock",
        timestamp: "3h",
        text: "TextLorem ipsum dolor sit amet consectetur adipisicing elit.",
        image: "",
        interactions: {
            likes: 5,
            comments: 5
        },
        replyTo: null
    },
    {
        id: 4,
        avt: "../../assets/img/avatar/ava1.png",
        username: "Hitoriii",
        email: "@bocchi_theRock",
        timestamp: "3h",
        text: "TextLorem ipsum dolor sit amet consectetur adipisicing elit.",
        image: "../../assets/img/posts/post3.jpg",
        interactions: {
            likes: 5,
            comments: 5
        },
        replyTo: null
    },
    {
        id: 5,
        avt: "../../assets/img/avatar/ava1.png",
        username: "Hitoriii",
        email: "@bocchi_theRock",
        timestamp: "2h",
        text: "test reply id 1",
        image: "",
        interactions: {
            likes: 2,
            comments: 0
        },
        replyTo: 1
    },
    {
        id: 6,
        avt: "../../assets/img/avatar/ava2.png",
        username: "Hitoriii",
        email: "@bocchi_theRock",
        timestamp: "1h",
        text: "ahohohoho test reply id 1",
        image: "../../assets/img/posts/post3.jpg",
        interactions: {
            likes: 10,
            comments: 0
        },
        replyTo: 1
    },
    {
        id: 7,
        avt: "../../assets/img/avatar/ava7.png",
        username: "Hitoriii",
        email: "@bocchi_theRock",
        timestamp: "30m",
        text: "abcdef test reply id 2",
        image: "../../assets/img/posts/post6.jpg",
        interactions: {
            likes: 15,
            comments: 0
        },
        replyTo: 2
    },
    {
        id: 8,
        avt: "../../assets/img/avatar/ava8.png",
        username: "Hitoriii",
        email: "@bocchi_theRock",
        timestamp: "35m",
        text: "wao wao wao wao reply id 2",
        image: "../../assets/img/posts/post5.jpg",
        interactions: {
            likes: 5,
            comments: 5
        },
        replyTo: 2
    },
    {
        id: 9,
        avt: "../../assets/img/avatar/ava4.png",
        username: "Hitoriii",
        email: "@bocchi_theRock",
        timestamp: "23m",
        text: "consectetur adipisicing elit. \n reply id 3",
        image: "",
        interactions: {
            likes: 5,
            comments: 0
        },
        replyTo: 3
    },
];


function loadHomepage() {
    const postContainer = document.querySelector(".post-container");
    postContainer.innerHTML = "";

    document.querySelector('.homepage-header').style.display = 'flex';
    document.querySelector('.post-detail-header').style.display = 'none';
    document.title = "Home / Threads";

    posts.forEach(post => {
        if (post.replyTo === null) {
            renderPostDetail(post.id, 0);
        }
    });
}

function handlePostClick(event, postElement) {
    const classes = ["icon", "interaction-button", "avt-container", "username", "email", "timestamp"];
    if (classes.some(cls => event.target.classList.contains(cls))) {
        return; 
    };
    
    const postId = postElement.getAttribute("data-id");
    const post = posts.find(p => p.id === parseInt(postId));

    if (post) {
        const newUrl = window.location.pathname.replace(/\/[^\/]*$/, `/post-${postId}.html`);
        history.pushState({ postId }, "", newUrl);
	    document.querySelector('.homepage-header').style.display = 'none';
    	document.querySelector('.post-detail-header').style.display = 'flex';

        document.title = `${post.username} on Thread`;
        renderPostDetail(postId);
    }
}

function goToHomepage() {
    document.querySelector('.post-detail-header').style.display = 'none';
    document.querySelector('.post-container').innerHTML = "";
    document.querySelector('.homepage-header').style.display = 'flex';
    document.title = "Home / Threads";
    const newUrl = window.location.pathname.replace(/\/[^\/]*$/, "/homepage.html");
    history.pushState(null, "", newUrl);
    posts.forEach(post => {
        if (post.replyTo === null) {
            renderPostDetail(post.id, 0); 
        }
    });
}

function renderPostDetail(postId, detail = 1) {
    const postDetailContainer = document.querySelector(".post-container");
    if (detail === 1) {
        postDetailContainer.innerHTML = ""; 
    }

    const post = posts.find(p => p.id === parseInt(postId));

    if (post) {
        const postImage = post.image ? `<div class="image"><img src="${post.image}" alt="Attached Image" /></div>` : "";
        const postDetail = `
            <div class="post" data-id="${post.id}" onclick="handlePostClick(event, this)">
                <a class="avt-container" href=""><img class="avt-photo" src="${post.avt}" alt="photo"></a>
                <div class="content">
                    <header>
                        <a class="username" href=""><span>${post.username}</span></a>
                        <a class="email" href=""><span>${post.email}</span></a>
                        <time class="timestamp">${post.timestamp}</time>
                    </header>
                    <p class="text">${post.text}</p>
                    ${postImage}
                    <div class="interaction">
                        <div class="interaction-button">
                            <button onclick="changeIcon(this)"><img src="../../assets/vendor/icons/heart.svg" alt="Like Icon" class="icon"></button>
                            <span class="interaction-count">${post.interactions.likes}</span> 
                        </div>
                        <div class="interaction-button">
                            <button onclick="showReplyBox(${post.id})"><img src="../../assets/vendor/icons/chat.svg" alt="Comment Icon" class="icon"></button>
                            <span class="interaction-count">${post.interactions.comments}</span> 
                        </div>
                    </div>
                </div>
            </div>
        `;

        postDetailContainer.innerHTML += postDetail;

        if (detail === 1) {
            renderReplies(postId);
        }
    } else {
        postDetailContainer.innerHTML = `<p>Post not found.</p>`;
    }
}

function renderReplies(excludeId) {
    const postDetailContainer = document.querySelector(".post-container");

    const replies = posts.filter(p => p.replyTo === parseInt(excludeId));

    if (replies.length > 0) {
        const replyH1 = `<div class="reply"><h1>Replies</h1></div>`;
        postDetailContainer.innerHTML += replyH1;

        replies.forEach(reply => {
            const replyImage = reply.image ? `<div class="image"><img src="${reply.image}" alt="Attached Image" /></div>` : "";
            const replyHtml = `
                <div class="post">
                    <a class="avt-container" href=""><img class="avt-photo" src="${reply.avt}" alt="photo"></a>
                    <div class="content">
                        <header>
                            <a class="username" href=""><span>${reply.username}</span></a>
                            <a class="email" href=""><span>${reply.email}</span></a>
                            <time class="timestamp">${reply.timestamp}</time>
                        </header>
                        <p class="text">${reply.text}</p>
                        ${replyImage}
                        <div class="interaction">
                            <div class="interaction-button">
                                <button onclick="changeIcon(this)"><img src="../../assets/vendor/icons/heart.svg" alt="Like Icon" class="icon"></button>
                                <span class="interaction-count">${reply.interactions.likes}</span> 
                            </div>
                            <div class="interaction-button">
                                <button onclick="changeIcon(this)"><img src="../../assets/vendor/icons/chat.svg" alt="Comment Icon" class="icon"></button>
                                <span class="interaction-count">${reply.interactions.comments}</span> 
                            </div>
                        </div>
                    </div>
                </div>
            `;
            postDetailContainer.innerHTML += replyHtml;
        });
    }
}

function changeIcon(button) {
    const img = button.querySelector("img"); 
    
    if (img.src.includes("-2.svg")) {
        img.src = img.src.replace("-2.svg", ".svg");
    } else {
        img.src = img.src.replace(".svg", "-2.svg");
    }
}

function showReplyBox(postId) {
    const replyBoxContainer = document.getElementById('reply-box-container');

    const post = posts.find(p => p.id === parseInt(postId));

    if (post) {
        replyBoxContainer.innerHTML = `
        <div class="reply-box-content">
            <div class="post">
                <div class="from-to">
                    <div class="avt-container"><img class="avt-photo" src="${post.avt}" alt="photo"></div>
                    <div class="connect-ava"></div>
                    <div class="avt-container"><img class="avt-photo" src="/assets/img/avatar/ava6.png" alt="photo"></div>
                </div>
                <div class="content">
                    <div class="to-user">
                        <header>
                            <a class="username" href=""><span>${post.username}</span></a>
                            <a class="email" href=""><span>${post.email}</span></a>
                            <time class="timestamp">${post.timestamp}</time>
                        </header>
                        <p class="text">${post.text}</p>
                    </div>

                    <div class="reply-content">Post your reply</div>
                </div>
                <button class="close-button" style="border: none; outline: none;" onclick="closeReplyBox()">✖</button>
            </div>
            
        `;
        replyBoxContainer.style.display = 'flex';
    }
}

function closeReplyBox() {
    const replyBoxContainer = document.getElementById('reply-box-container');
    replyBoxContainer.style.display = 'none';
}

