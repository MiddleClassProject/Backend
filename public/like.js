document.addEventListener('click', async (event) => {
    if (event.target.classList.contains('like-button')) {
        const reviewId = event.target.getAttribute('data-review-id');

        try {
            // 서버에 POST 요청을 보내 likes 수 증가
            const response = await fetch(`/reviews/${reviewId}/like`, {
                method: 'POST'
            });
            const result = await response.json();

            if (result.success) {
                // 좋아요 수 업데이트
                const likeCountSpan = event.target.nextElementSibling;
                likeCountSpan.textContent = `Likes: ${result.likes}`;
            } else {
                console.error("Failed to like the review:", result.message);
            }
        } catch (error) {
            console.error("Failed to like the review:", error);
        }
    }
});

