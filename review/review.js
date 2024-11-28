// 페이지 로드 시 초기 데이터 로드
window.onload = () => {
    loadProfessors(); // 교수 리스트 로드
    applyFilters(); // 초기 필터 및 정렬 적용
};

// 필터와 정렬 드롭다운 이벤트 리스너 등록
document.getElementById('professorDropdown').addEventListener('change', applyFilters);
document.getElementById('sortDropdown').addEventListener('change', applyFilters);

// 교수 리스트 로드 함수
async function loadProfessors() {
    try {
        // 서버에서 교수 리스트 가져오기
        const response = await fetch('/api/review/professors');
        const data = await response.json();

        // 드롭다운 초기화 및 옵션 추가
        const professorDropdown = document.getElementById('professorDropdown');
        professorDropdown.innerHTML = '<option value="">모든 교수</option>';
        data.forEach(professor => {
            professorDropdown.innerHTML += `<option value="${professor.pro_name}">${professor.pro_name}</option>`;
        });
    } catch (error) {
        console.error('교수 리스트 로드 실패:', error);
    }
}

// 리뷰 리스트 로드 함수
async function loadReviewList(professorFilter = '', sortOption = 'latest') {
    try {
        // 서버에서 리뷰 데이터 가져오기
        const response = await fetch(`/api/review/list?professor=${professorFilter}&sort=${sortOption}`);
        const reviews = await response.json();

        // 리뷰 컨테이너 초기화
        const reviewContainer = document.querySelector('.review-container');
        reviewContainer.innerHTML = '';

        // 리뷰가 없을 경우 메시지 출력
        if (reviews.length === 0) {
            reviewContainer.innerHTML = '<p>리뷰가 없습니다.</p>';
            return;
        }

        // 리뷰 항목 생성 및 컨테이너에 추가
        reviews.forEach(review => {
            reviewContainer.innerHTML += `
                <div class="review-item">
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
                        <span class="like-count"> 좋아요: ${review.likes}</span>
                        <span>작성일: ${new Date(review.created_at).toLocaleDateString()}</span>
                    </div>
                </div>`;
        });

        // 각 좋아요 아이콘에 클릭 이벤트 리스너 등록
        document.querySelectorAll('.like-image').forEach(image => {
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

    // 이미 좋아요를 누른 경우 처리 중단
    if (liked) return;

    try {
        // 로그인 상태 확인
        const loginCheck = await fetch('../publick/api/authController');
        const loginStatus = await loginCheck.json();

        if (!loginStatus.loggedIn) {
            alert('로그인이 필요합니다. 로그인 페이지로 이동합니다.');
            window.location.href = '../public/login.html'; // 로그인 페이지로 리다이렉트
            return;
        }

        // 로그인 상태에서 좋아요 요청
        const response = await fetch(`/api/review/like`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: reviewId }),
        });

        if (response.ok) {
            // 좋아요 성공 시 UI 업데이트
            img.src = "../../images/fullheart.png"; // 하트 채우기
            img.dataset.liked = 'true'; // 좋아요 상태 업데이트
            const likeCountSpan = img.nextElementSibling;
            likeCountSpan.textContent = ` 좋아요: ${parseInt(likeCountSpan.textContent.split(':')[1]) + 1}`;
        } else {
            alert('좋아요 등록에 실패했습니다.');
        }
    } catch (error) {
        console.error('좋아요 등록 실패:', error);
        alert('오류가 발생했습니다. 다시 시도해주세요.');
    }
}


// 필터와 정렬 적용 함수
function applyFilters() {
    const selectedProfessor = document.getElementById('professorDropdown').value;
    const selectedSort = document.getElementById('sortDropdown').value;
    loadReviewList(selectedProfessor, selectedSort); // 필터와 정렬에 맞게 리뷰 리스트 로드
}

// 리뷰 작성 폼 열기
document.getElementById('openReviewForm').addEventListener('click', () => {
    document.getElementById('reviewForm').style.display = 'flex';
    loadProfessorsToForm(); // 폼에 교수 리스트 로드
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
        data.forEach(professor => {
            professorDropdown.innerHTML += `<option value="${professor.pro_name}">${professor.pro_name}</option>`;
        });
    } catch (error) {
        console.error('교수 데이터 로드 실패:', error);
    }
}

// 리뷰 작성 이벤트 핸들러
document.getElementById('submitReview').addEventListener('click', async () => {
    const professor = document.getElementById('reviewProfessorDropdown').value;
    const content = document.getElementById('reviewContent').value;

    // 필수 입력 필드 확인
    if (!professor || !content) {
        alert('모든 필드를 입력해주세요.');
        return;
    }

    try {
        // 리뷰 등록 요청
        const response = await fetch('/api/review/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ professor, content }),
        });

        if (response.ok) {
            alert('리뷰가 등록되었습니다!');
            applyFilters(); // 필터와 정렬에 맞게 리뷰 리스트 새로고침
        } else {
            alert('리뷰 등록에 실패했습니다.');
        }
    } catch (error) {
        console.error('리뷰 등록 실패:', error);
    }

    document.getElementById('reviewForm').style.display = 'none';
});