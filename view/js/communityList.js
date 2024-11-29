document.addEventListener("DOMContentLoaded", function () {
    const params = new URLSearchParams(window.location.search);
    const postId = params.get("id");

    if (postId) {
        fetch(`/community/call/${postId}`)
            .then(response => response.json())
            .then(data => {
                console.log(data);
            })
            .catch(error => console.error("상세보기 페이지로 이동하는 중 오류가 발생했습니다.", error));
    }
});

// 서버에서 데이터 가져오기
fetch("/community/call")
    .then((res) => res.json())
    .then((data) => {
        renderCommunityList(data); // 받은 데이터를 HTML로 렌더링
    })
    .catch((error) => console.error("Error fetching community list:", error));

// DOM에 채팅 리스트 추가하는 함수
function renderCommunityList(communityData) {
    const communityListContainer = document.querySelector("#community-list");

    // 기존 내용을 초기화
    communityListContainer.innerHTML = "";

    console.log(communityData);

    // 받은 객체 배열을 반복하며 각 데이터를 카드 형식으로 생성
    communityData.list.forEach((community) => {
        const { id, title, content, user, date } = community;

        // 카드 요소 생성
        const card = document.createElement("div");
        card.className = "card mb-4 shadow-sm border-0";
        card.style.cursor = "pointer";
        card.setAttribute(
            "onclick",
            `window.location.href='/community/${id}'`
        );

        // 카드 내용 구성
        card.innerHTML = `
            <div class="card-body">
                <h5 class="card-title">${title}</h5>
                <p class="card-text text-muted">${content}</p>
                <small class="text-muted">${user} · ${date}</small>
            </div>
        `;

        // 컨테이너에 추가
        communityListContainer.appendChild(card);
    });
}