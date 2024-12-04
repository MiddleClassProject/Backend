// 서버에서 데이터 가져오기
const path = document.location.pathname;
const segments = path.split('/');
const communityId = segments[segments.length - 1];

fetch(`/community/list/${communityId}`)
    .then((res) => res.json())
    .then((data) => {
        renderCommunityDetail(data);
    })
    .catch((error) => console.error("Error fetching community Detail:", error));

// 상세보기 데이터 렌더링 함수
function renderCommunityDetail(data) {
    const postContainer = document.querySelector(".card.mb-4.shadow-sm.p-3");

    console.log(data);

    // 데이터 추출
    const { community_id, title, cus_id, author, content, date, is_like, likes, comments } = data.detail;

    // 제목 및 본문 업데이트
    const postTitle = postContainer.querySelector("h4");
    const postAuthor = postContainer.querySelector("small.text-muted");
    const postContent = postContainer.querySelector("p");
    const postMeta = postContainer.querySelector(".d-flex.align-items-center.text-muted");

    postTitle.textContent = `${title}`;
    postAuthor.textContent = `${author} · ${new Date(date).toLocaleString()}`;
    postContent.textContent = `${content}`;

    // todo : 좋아요 아이콘 추가

    // 좋아요 갯수 업데이트
    postMeta.innerHTML = `
        <small class="me-4">좋아요 ${likes}</small>
    `;

    // 댓글 섹션 렌더링
    const commentSection = document.querySelector(".mb-4 > .card.mb-3.p-3");
    if (comments !== null) {
        renderComments(commentSection, comments);
    }
}

// 댓글 렌더링 함수
function renderComments(container, comments) {
    const commentMap = {}; // 댓글 ID를 키로 하는 맵 생성

    comments.forEach(comment => {
        const { comment_id, content, cus_id, id, parent_id, created_at } = comment;

        // 댓글 카드 생성
        const commentCard = document.createElement("div");
        commentCard.className = "card-body";
        commentCard.setAttribute("data-comment-id", comment_id); // 댓글 ID 속성 추가
        commentCard.innerHTML = `
            <div class="d-flex justify-content-between">
                <h6 class="fw-bold">${id}</h6>
            </div>
            <p>${content}</p>
            <div class="d-flex align-items-center mb-4">
                <small class="text-muted me-4">${new Date(created_at).toLocaleString()}</small>
                <small class="text-muted">답글 달기</small>
            </div>
            <div class="mx-4"></div> <!-- 자식 댓글 컨테이너 -->
        `;

        if (parent_id === null) {
            // 부모 댓글일 경우 컨테이너에 추가
            container.appendChild(commentCard);
            commentMap[comment_id] = commentCard; // 부모 댓글 저장
        } else {
            // 자식 댓글일 경우 부모 댓글의 .mx-4 컨테이너에 추가
            const parentCard = commentMap[parent_id]; // 부모 댓글 찾기
            if (parentCard) {
                const replyContainer = parentCard.querySelector('.mx-4');
                if (replyContainer) {
                    // 자식 댓글 HTML 생성
                    const replyHTML = `
                        <div class="reply">
                            <small class="fw-bolder">${id}</small>
                            <p class="mb-1">${content}</p>
                            <div class="d-flex align-items-center mb-2">
                                <small class="text-muted me-4">${new Date(created_at).toLocaleString()}</small>
                                <small class="text-muted">답글 달기</small>
                            </div>
                        </div>
                    `;
                    replyContainer.insertAdjacentHTML('beforeend', replyHTML);
                } else {
                    console.error("`.mx-4` 컨테이너를 찾을 수 없습니다.");
                }
            } else {
                console.error(`Parent comment with ID ${parent_id} not found.`);
            }
        }
    });
}
