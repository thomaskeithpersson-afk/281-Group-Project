function setupImagePreview() {
    const fileInput = document.getElementById('bookImageInput');
    const previewContainer = document.getElementById('imagePreview');
    if (!fileInput || !previewContainer) return;
    fileInput.addEventListener('change', function(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                previewContainer.innerHTML = ''; 
                const img = document.createElement('img');
                img.src = e.target.result;
                img.style.maxWidth = '100%';
                img.style.maxHeight = '150px';
                img.style.borderRadius = '4px';
                previewContainer.appendChild(img);
            };
            reader.readAsDataURL(file);
        } else {
            previewContainer.innerHTML = '<span>Preview will appear here</span>';
        }
    });
}
document.addEventListener('DOMContentLoaded', function() {
    setupImagePreview();
});