document.addEventListener('submit', async (event) => {
    event.preventDefault(); 

    const form = event.target; 
    if (form.id !== 'posting-form' && form.id !== 'reply-form') {
        return;
    }

    const content = form.querySelector('textarea[name="content"]').value; 
    const imageInput = form.querySelector('input[name="image"]');
    const parentThreadId = form.getAttribute('data-parent-id');
    let base64Image = null;
    if (imageInput.files.length > 0) {
        const file = imageInput.files[0];
        if (file.size > 10 * 1024 * 1024) { 
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
            const text = await response.text(); // Đọc dưới dạng text
            console.error('Server error response:', text);
            alert(`Failed to create thread: ${response.status} ${response.statusText}`);
            return;
        }
        if (response.ok) {
            const result = await response.json();
            window.location.reload(); 
        } else {
            const error = await response.json();
            console.error('Error creating thread:', error);
            alert('Failed to create thread');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while creating thread');
    }
});

const toBase64 = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
    });
};
