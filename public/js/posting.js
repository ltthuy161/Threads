document.querySelectorAll('#posting-form, #reply-form').forEach((form) => {
    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const content = form.querySelector('textarea[name="content"]').value;
        const imageInput = form.querySelector('input[name="image"]');
        const parentThreadId = form.getAttribute('data-parent-id');

        let base64Image = null;
        if (imageInput && imageInput.files.length > 0) {
            const file = imageInput.files[0];
            if (file.size > 50 * 1024 * 1024) {
                alert('File size exceeds 10MB. Please upload a smaller file.');
                return;
            }
            base64Image = await toBase64(file);
        }

        const data = {
            content,
            image: base64Image,
            parentThreadId,
        };

        try {
            const response = await fetch('/threads/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const text = await response.text();
                console.error('Server error response:', text);
                alert(`Failed to create thread: ${response.status} ${response.statusText}`);
                return;
            }

            const result = await response.json();
           
            if (parentThreadId) {
                window.location.href = `/threads/detail/${parentThreadId}`;
            }
            else {
                window.location.href = `/threads/detail/${result.thread._id}`;
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred while creating thread');
        }
    });
});


const toBase64 = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
    });
};