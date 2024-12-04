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
    // 부모 댓글 요소를 참조하기 위해 맵 생성
    const commentMap = {};

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
        `;

        // 댓글이 부모 댓글인지 확인
        if (parent_id === null) {
            // 부모 댓글일 경우 컨테이너에 추가
            container.appendChild(commentCard);
            commentMap[comment_id] = commentCard; // 맵에 저장
        } else {
            // 자식 댓글일 경우 부모 댓글의 아래에 추가
            const parentCard = container.querySelector(`.card-body[data-comment-id="${parent_id}"]`);
            if (parentCard) {
                // 부모 댓글에 자식 댓글 컨테이너가 없으면 생성
                let replyContainer = parentCard.querySelector(".reply-container");
                if (!replyContainer) {
                    replyContainer = document.createElement("div");
                    replyContainer.className = "reply-container ms-4"; // 들여쓰기 스타일 적용
                    parentCard.appendChild(replyContainer);
                }
                replyContainer.appendChild(commentCard); // 자식 댓글 추가
            }
        }
    });
}


