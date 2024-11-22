// 초기 데이터 로드
window.onload = () => {
    loadProfessors(); // 교수 리스트 로드
    loadReviewList(); // 리뷰 리스트 로드
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
            option.textContent = item.pro_name + " 교수";
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

        const reviewSection = document.querySelector('.review .post-preview');
        reviewSection.innerHTML = ''; // 기존 리스트 초기화

        if (reviews.length === 0) {
            reviewSection.innerHTML = '<p>리뷰가 없습니다.</p>';
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
                    <span>좋아요:${review.likes}</span>
                    <span>작성일: ${new Date(review.created_at).toLocaleDateString()}</span>
                </div>
            `;
            reviewSection.appendChild(reviewItem);
        });
    } catch (error) {
        console.error('리뷰 리스트 로드 실패:', error);
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

// 리뷰 폼 닫기
document.getElementById('closeReviewForm').addEventListener('click', () => {
    document.getElementById('reviewForm').style.display = 'none';
});

// 폼에 교수 리스트 로드
async function loadProfessorsToForm() {
    try {
        const response = await fetch('/api/review/professors');
        const data = await response.json();

        const professorDropdown = document.getElementById('reviewProfessorDropdown');
        professorDropdown.innerHTML = '';

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