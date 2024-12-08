document.addEventListener('DOMContentLoaded', function() {
    const uploadButton = document.getElementById('upload-doc');
    const fileInput = document.getElementById('file-upload');
    const listDocsButton = document.getElementById('list-docs');
    const docsList = document.getElementById('docs-list');

   uploadButton.addEventListener('click', async function() {

    // Retrieve user email from localStorage
    const userEmail = localStorage.getItem('userEmail');

    const file = fileInput.files[0];
    if (!file) {
        alert('Please select a file to upload.');
        return;
    }
    console.log("file : ",file)

    const formData = new FormData();
    formData.append('file', file);

    if (!userEmail) {
        alert('User email not found. Please log in again.');
        return;
    }
    formData.append('email', userEmail);

    try {
        const response = await fetch('/upload-document', {
            method: 'POST',
            body: formData
        });

        const result = await response.json();
        alert(result.message);
        fileInput.value = ''; // Clear the file input
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while uploading the document.');
    }
});

listDocsButton.addEventListener('click', async function() {
    try {
        const userEmail = localStorage.getItem('userEmail');
        if (!userEmail) {
            alert('User email not found. Please log in again.');
            return;
        }

        const response = await fetch('/list-documents', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email: userEmail })
        });
        const documents = await response.json();

        docsList.innerHTML = ''; // Clear previous list
        if (documents.length === 0) {
            docsList.innerHTML = '<li>No documents found</li>';
        } else {
            documents.forEach(doc => {
                const li = document.createElement('li');
                li.textContent = doc;
                docsList.appendChild(li);
            });
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while fetching the document list.');
    }
});
});