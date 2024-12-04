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

    // 좋아요 아이콘 및 갯수 업데이트
    postMeta.innerHTML = `
        <i id="like" class="${is_like ? 'fa-solid fa-heart' : 'fa-regular fa-heart'} me-2"></i>
        <small class="me-4">좋아요 <span id="like-count">${likes}</span></small>
    `;

    // 좋아요 클릭 이벤트 등록
    const likeIcon = document.getElementById("like");
    likeIcon.addEventListener("click", () => toggleLike(likeIcon, community_id));


    // 댓글 섹션 렌더링
    const commentSection = document.querySelector(".mb-4 > .card.mb-3.p-3");
    if (comments !== null) {
        renderComments(commentSection, comments);
    }
}

// 댓글 렌더링 함수
function renderComments(container, comments) {
    const renderComment = (comment, parentContainer) => {
        const { comment_id, content, cus_id, id, parent_id, created_at, children } = comment;

        // 댓글 카드 생성
        const commentCard = document.createElement("div");
        commentCard.className = parentContainer === container ? "card-body" : "reply"; // 부모 댓글과 대댓글 구분
        commentCard.setAttribute("data-comment-id", comment_id); // 댓글 ID 속성 추가
        commentCard.innerHTML = `
                                    <div class="d-flex justify-content-between">
                                        <h6 class="fw-bold">${id}</h6>
                                    </div>
                                    <p>${content}</p>
                                    <div class="d-flex align-items-center mb-3">
                                        <small class="text-muted me-4">${new Date(created_at).toLocaleString()}</small>
                                        <small class="text-muted me-2 reply-btn">답글 달기</small>
                                        <small class="text-muted delete-btn">삭제</small>
                                    </div>
                                    <div class="mx-4"></div> <!-- 자식 댓글 컨테이너 -->
                                `;

        // 부모 컨테이너에 댓글 추가
        parentContainer.appendChild(commentCard);

        // 답글 달기 버튼 이벤트 리스너 등록
        const replyButton = commentCard.querySelector(".reply-btn");
        replyButton.addEventListener("click", () => createReplyForm(commentCard, comment_id));

        // 삭제 버튼 이벤트 리스너 등록
        const deleteButton = commentCard.querySelector(".delete-btn");
        deleteButton.addEventListener("click", () => deleteButtonClick(commentCard, comment_id, cus_id));

        // 자식 댓글이 있는 경우 대댓글 양식으로 렌더링
        if (children && children.length > 0) {
            const replyContainer = commentCard.querySelector('.mx-4'); // 자식 댓글 컨테이너
            children.forEach(childComment => {
                renderReply(childComment, replyContainer);
            });
        }
    };

    // 대댓글 렌더링 함수
    const renderReply = (reply, parentContainer) => {
        const { comment_id, content, cus_id, id, created_at, children } = reply;

        // 대댓글 DOM 요소 생성
        const replyElement = document.createElement("div");
        replyElement.className = "reply";
        replyElement.setAttribute("data-comment-id", comment_id);
        replyElement.innerHTML = `
            <small class="fw-bolder">${id}</small>
            <p class="mb-2">${content}</p>
            <div class="d-flex align-items-center mb-2">
                <small class="text-muted me-4">${new Date(created_at).toLocaleString()}</small>
                <small class="text-muted me-2 reply-btn">답글 달기</small>
                <small class="text-muted delete-btn">삭제</small>
            </div>
            <div class="mx-4"></div> <!-- 자식 대댓글 컨테이너 -->
        `;

        // 대댓글을 부모 컨테이너에 추가
        parentContainer.appendChild(replyElement);

        // 답글 달기 버튼 이벤트 리스너 등록
        const replyButton = replyElement.querySelector(".reply-btn");
        replyButton.addEventListener("click", () => createReplyForm(replyElement, comment_id));

        // 삭제 버튼 이벤트 리스너 등록
        const deleteButton = replyElement.querySelector(".delete-btn");
        deleteButton.addEventListener("click", () => deleteButtonClick(replyElement, comment_id, cus_id));

        // 자식 대댓글이 있는 경우 재귀적으로 렌더링
        if (children && children.length > 0) {
            const replyContainer = replyElement.querySelector('.mx-4'); // 자식 댓글 컨테이너
            children.forEach(childReply => {
                renderReply(childReply, replyContainer);
            });
        }
    };

    comments.forEach(comment => {
        renderComment(comment, container); // 부모 컨테이너에 댓글 렌더링
    });
}

document.addEventListener("DOMContentLoaded", function () {
    const submitButton = document.getElementById("submitComment");
    const commentInput = document.getElementById("commentText");

    // 댓글 등록 버튼 클릭 이벤트
    submitButton.addEventListener("click", async function () {
        const commentContent = commentInput.value.trim(); // 댓글 내용

        if (!commentContent) {
            alert("댓글을 입력해 주세요.");
            return;
        }

        // POST 요청 데이터
        const requestData = {
            community_id: communityId,
            content: commentContent,
        };

        try {
            // 서버로 댓글 데이터 전송
            const response = await fetch(`/community/${communityId}/comments`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(requestData),
            });

            if (response.ok) {
                alert("댓글이 등록되었습니다.");
                commentInput.value = "";
                location.reload(); // 페이지 새로고침
            } else {
                const errorData = await response.json();
                alert(`댓글 등록 실패: ${errorData.message || "알 수 없는 오류"}`);
            }
        } catch (error) {
            console.error("댓글 등록 중 오류 발생:", error);
            alert("댓글 등록 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
        }
    });
});

// 댓글 삭제
async function deleteButtonClick(commentCard, commentId, cusId) {
    const requestData = {
        cusId: cusId,
    };

    try {
        const response = await fetch(`/community/${communityId}/comments/${commentId}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(requestData),
        });

        if (response.ok) {
            alert("댓글이 삭제되었습니다.");
            commentCard.remove(); // 삭제된 댓글을 DOM에서 제거
        } else {
            const errorData = await response.json();
            alert(`댓글 삭제 실패: ${errorData.message || "알 수 없는 오류"}`);
        }
    } catch (error) {
        console.error("댓글 삭제 중 오류 발생:", error);
        alert("댓글 삭제 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
    }
}

// 대댓글 생성
function createReplyForm(parentCommentCard, parentCommentId) {
    // 기존에 작성 영역이 이미 있으면 생성하지 않음
    if (parentCommentCard.querySelector(".reply-form")) return;

    // 대댓글 입력 폼 생성
    const replyForm = document.createElement("div");
    replyForm.className = "reply-form";
    replyForm.innerHTML = `
        <textarea class="form-control mb-2 reply-text" rows="3" placeholder="답글을 입력해 주세요"></textarea>
        <button class="btn btn-primary submit-reply">등록</button>
    `;

    // 폼을 부모 댓글 아래에 추가
    parentCommentCard.appendChild(replyForm);

    // 등록 버튼 이벤트 리스너
    const submitReplyButton = replyForm.querySelector(".submit-reply");
    const replyTextArea = replyForm.querySelector(".reply-text");

    submitReplyButton.addEventListener("click", async () => {
        const replyContent = replyTextArea.value.trim();

        if (!replyContent) {
            alert("답글 내용을 입력해 주세요.");
            return;
        }

        // POST 요청 데이터
        const requestData = {
            parentId: parentCommentId, // 부모 댓글 ID
            communityId: communityId, // 현재 커뮤니티 ID
            content: replyContent, // 답글 내용
        };

        try {
            // 서버로 대댓글 데이터 전송
            const response = await fetch(`/community/${communityId}/comments`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(requestData),
            });

            if (response.ok) {
                alert("답글이 등록되었습니다.");
                replyTextArea.value = ""; // 입력 필드 초기화
                location.reload(); // 페이지 새로고침
            } else {
                const errorData = await response.json();
                alert(`답글 등록 실패: ${errorData.message || "알 수 없는 오류"}`);
            }
        } catch (error) {
            console.error("답글 등록 중 오류 발생:", error);
            alert("답글 등록 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
        }
    });
}

// 좋아요 토글 함수
async function toggleLike(likeIcon, communityId) {
    const isLiked = likeIcon.classList.contains("fa-solid");
    const endpoint = `/community/${communityId}/like`;

    try {
        const response = await fetch(endpoint, {
            method: isLiked ? "DELETE" : "POST",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (response.ok) {
            const likeCountElement = document.getElementById("like-count");
            let likeCount = parseInt(likeCountElement.textContent, 10);

            if (isLiked) { // 좋아요 취소
                likeIcon.classList.remove("fa-solid");
                likeIcon.classList.add("fa-regular");
                likeCount -= 1;
            } else { // 좋아요 등록
                likeIcon.classList.remove("fa-regular");
                likeIcon.classList.add("fa-solid");
                likeCount += 1;
            }

            // 좋아요 수 업데이트
            likeCountElement.textContent = likeCount;
        } else {
            alert("좋아요 처리 중 오류가 발생했습니다.");
        }
    } catch (error) {
        console.error("좋아요 처리 중 오류 발생:", error);
        alert("좋아요 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
    }
}