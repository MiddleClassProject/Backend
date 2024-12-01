// 쿠키에서 값을 가져오는 함수
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
}

// 페이지 로드 시 로그인 박스 업데이트
window.onload = () => {
    const userMessage = document.getElementById('userMessage');
    const userActionButton = document.getElementById('userActionButton');

    // 쿠키에서 'user_id' 값을 가져오기
    const userId = getCookie('user_id');

    if (userId) {
        // 로그인 상태: 사용자 이름과 로그아웃 버튼 설정
        userMessage.textContent = `${userId}님 환영합니다!`;
        userActionButton.textContent = '로그아웃';
        userActionButton.onclick = () => {
            // 로그아웃 처리: 쿠키 삭제 후 페이지 새로고침
            document.cookie = 'user_id=; Max-Age=0; path=/'; // 쿠키 삭제
            location.reload(); // 페이지 새로고침
        };
    } else {
        // 비로그인 상태: 기본 메시지와 로그인 버튼 유지
        userMessage.textContent = '로그인 후 이용해주세요';
        userActionButton.textContent = '로그인';
        userActionButton.onclick = () => {
            window.location.href = '../public/login.html'; // 로그인 페이지로 이동
        };
    }

    // 나머지 페이지 초기화
    loadProfessors();
    applyFilters();
};

// 필터와 정렬 드롭다운 이벤트 리스너 등록
document.getElementById('professorDropdown').addEventListener('change', applyFilters);
document.getElementById('sortDropdown').addEventListener('change', applyFilters);

// 교수 리스트 로드 함수
async function loadProfessors() {
    try {
        const response = await fetch('/api/review/professors');
        const data = await response.json();

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
        const response = await fetch(`/api/review/list?professor=${professorFilter}&sort=${sortOption}`);
        const reviews = await response.json();

        const reviewContainer = document.querySelector('.review-container');
        reviewContainer.innerHTML = '';

        if (reviews.length === 0) {
            reviewContainer.innerHTML = '<p>리뷰가 없습니다.</p>';
            return;
        }

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

    if (liked) return;

    try {
        const response = await fetch(`/api/review/like`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: reviewId }),
        });

        if (response.ok) {
            img.src = "../../images/fullheart.png";
            img.dataset.liked = 'true';
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
            applyFilters();
        } else {
            alert('리뷰 등록에 실패했습니다.');
        }
    } catch (error) {
        console.error('리뷰 등록 실패:', error);
    }

    document.getElementById('reviewForm').style.display = 'none';
});
