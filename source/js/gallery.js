const modal = document.getElementById('imageModal');
const modalImage = document.getElementById('modalImage');
const closeBtn = document.getElementById('closeBtn');
const thumbnails = document.querySelectorAll('.gallery-item');
let currentIndex = 0;

function openModal(index) {
    currentIndex = index;
    modalImage.src = thumbnails[currentIndex].getAttribute('data-full');
    modal.style.display = 'flex';
}

function closeModal() {
    modal.style.display = 'none';
}

function showPrev() {
    currentIndex = (currentIndex - 1 + thumbnails.length) % thumbnails.length;
    modalImage.src = thumbnails[currentIndex].getAttribute('data-full');
}

function showNext() {
    currentIndex = (currentIndex + 1) % thumbnails.length;
    modalImage.src = thumbnails[currentIndex].getAttribute('data-full');
}

thumbnails.forEach((thumbnail, index) => {
    thumbnail.addEventListener('click', () => openModal(index));
});

closeBtn.addEventListener('click', closeModal);

window.addEventListener('click', (event) => {
    if (event.target === modal) {
        closeModal();
    }
});

window.addEventListener('keydown', (event) => {
    if (modal.style.display === 'flex') {
        if (event.key === 'ArrowLeft') {
            showPrev();
        } else if (event.key === 'ArrowRight') {
            showNext();
        }
    }
});