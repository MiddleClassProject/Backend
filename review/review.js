// 초기 데이터 로드
window.onload = () => {
    loadProfessors(); // 교수 리스트 로드
    applyFilters(); // 필터 및 정렬 초기값으로 리뷰 로드
};

// 드롭다운에서 필터 및 정렬 적용
document.getElementById('professorDropdown').addEventListener('change', applyFilters);
document.getElementById('sortDropdown').addEventListener('change', applyFilters);

// 교수 리스트 로드
async function loadProfessors() {
    try {
        const response = await fetch('/api/review/professors');
        const data = await response.json();

        const professorDropdown = document.getElementById('professorDropdown');
        professorDropdown.innerHTML = '<option value="">모든 교수</option>'; // 기본 옵션 추가

        data.forEach((item) => {
            const option = document.createElement('option');
            option.value = item.pro_name;
            option.textContent = `${item.pro_name} 교수`;
            professorDropdown.appendChild(option);
        });
    } catch (error) {
        console.error('교수 데이터 로드 실패:', error);
    }
}

// 리뷰 리스트 로드
async function loadReviewList(professorFilter = '', sortOption = 'latest') {
    try {
        const response = await fetch(`/api/review/list?professor=${professorFilter}&sort=${sortOption}`);
        const reviews = await response.json();

        const reviewContainer = document.querySelector('.review-container');
        reviewContainer.innerHTML = ''; // 기존 데이터를 초기화

        if (reviews.length === 0) {
            reviewContainer.innerHTML = '<p>리뷰리스트를 드랍다운에서 선택해주세요</p>';
            return;
        }

        reviews.forEach((review) => {
            const reviewItem = document.createElement('div');
            reviewItem.className = 'review-item';
            reviewItem.innerHTML = `
                <div class="review-header">
                    <strong>${review.cus_name}</strong> | ${review.pro_name}
                </div>
                <div class="review-content">
                    ${review.content}
                </div>
                <div class="review-footer">
                    <span class="like-icon">
                        <img src="../../images/emptyheart.png" alt="좋아요" class="like-image" data-review-id="${review.id}" data-liked="false">
                    </span>
                    <span class="like-count"> 좋아요:${review.likes}</span>
                    <span>작성일: ${new Date(review.created_at).toLocaleDateString()}</span>
                </div>
            `;
            reviewContainer.appendChild(reviewItem);
        });

        // 좋아요 아이콘에 이벤트 리스너 추가
        document.querySelectorAll('.like-image').forEach((image) => {
            image.addEventListener('click', handleLikeClick);
        });
    } catch (error) {
        console.error('리뷰 리스트 로드 실패:', error);
    }
}

// 좋아요 클릭 이벤트 핸들러
async function handleLikeClick(event) {
    const img = event.target;
    const reviewId = img.dataset.reviewId;
    const liked = img.dataset.liked === 'true';

    // 이미 좋아요를 눌렀으면 무시
    if (liked) return;

    try {
        // 좋아요 요청
        const response = await fetch(`/api/review/like`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: reviewId }),
        });

        if (response.ok) {
            // UI 업데이트
            img.src = "../../images/fullheart.png";
            img.dataset.liked = 'true';
            const likeCountSpan = img.parentElement.nextElementSibling;
            likeCountSpan.textContent = parseInt(likeCountSpan.textContent) + 1;
        } else {
            alert('좋아요 등록에 실패했습니다.');
        }
    } catch (error) {
        console.error('좋아요 등록 에러:', error);
    }
}

// 필터와 정렬 동시 적용
function applyFilters() {
    const selectedProfessor = document.getElementById('professorDropdown').value;
    const selectedSort = document.getElementById('sortDropdown').value;

    loadReviewList(selectedProfessor, selectedSort);
}

// 리뷰 작성 폼 열기
document.getElementById('openReviewForm').addEventListener('click', () => {
    document.getElementById('reviewForm').style.display = 'flex';
    loadProfessorsToForm();
});

// 리뷰 작성 폼 닫기
document.getElementById('closeReviewForm').addEventListener('click', () => {
    document.getElementById('reviewForm').style.display = 'none';
});

// 리뷰 작성 폼에 교수 리스트 로드
async function loadProfessorsToForm() {
    try {
        const response = await fetch('/api/review/professors');
        const data = await response.json();

        const professorDropdown = document.getElementById('reviewProfessorDropdown');
        professorDropdown.innerHTML = '<option value="">교수를 선택하세요</option>';

        data.forEach((professor) => {
            const option = document.createElement('option');
            option.value = professor.pro_name;
            option.textContent = professor.pro_name;
            professorDropdown.appendChild(option);
        });
    } catch (error) {
        console.error('교수 데이터 로드 실패:', error);
    }
}

// 리뷰 제출
document.getElementById('submitReview').addEventListener('click', async () => {
    const professor = document.getElementById('reviewProfessorDropdown').value;
    const content = document.getElementById('reviewContent').value;

    if (!professor || !content) {
        alert('모든 필드를 입력해주세요.');
        return;
    }

    try {
        const response = await fetch('/api/review/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ professor, content }),
        });

        if (response.ok) {
            alert('리뷰가 등록되었습니다!');
            applyFilters(); // 현재 필터와 정렬로 리스트 갱신
        } else {
            alert('리뷰 등록에 실패했습니다.');
        }
    } catch (error) {
        console.error('리뷰 등록 에러:', error);
    }

    document.getElementById('reviewForm').style.display = 'none';
});