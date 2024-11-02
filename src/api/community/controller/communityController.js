const communityService = require('../service/communityService');

// 커뮤니티 목록보기
const communityList = (req, res) => {
    communityService.findAll(res);
};

// 커뮤니티 상세보기
const communityDetail = (req, res) => {
    // todo: 로그인한 사용자의 id
    let communityId = req.params.id;
    communityService.findById(userId, communityId, res);
};

// 커뮤니티 글쓰기
const communityUpload = (req, res) => {
    // todo: 로그인한 사용자의 id

    if (!req.body.title || !req.body.content) {
        return res.status(400).send({
            success: false,
            message: "제목 또는 내용을 작성해주세요."
        });
    }

    communityService.uploadByUserId(userId, req, res);
};

// 커뮤니티 글 수정
const communityModify = (req, res) => {
    // todo: 로그인한 사용자의 id

    let communityId = req.params.id;

    if (!req.body.title || !req.body.content) {
        return res.status(400).send({
            success: false,
            message: "제목 또는 내용을 작성해주세요."
        });
    }

    if (req.body.cusId !== userId) {
        return res.status(403).send({
            success: false,
            message: "글을 수정할 권한이 없습니다."
        });
    }

    communityService.updateById(communityId, req, res);
};

// 커뮤니티 글 삭제
const communityDelete = (req, res) => {
    // todo: 로그인한 사용자의 id
    let communityId = req.params.id;

    if (req.body.cusId !== userId) {
        return res.status(403).send({
            success: false,
            message: "글을 삭제할 권한이 없습니다."
        });
    }

    communityService.deleteById(communityId, req, res);
}

// 커뮤니티 좋아요 토글 (추가/취소)
const toggleLike = async (req, res) => {
    // todo: 로그인한 사용자의 id
    const communityId = req.params.id;

    try {
        const isLiked = await communityService.toggleLike(userId, communityId);
        res.status(200).send({
            success: true,
            message: isLiked ? "좋아요를 추가했습니다." : "좋아요를 취소했습니다."
        });
    } catch (error) {
        console.error("좋아요 처리 중 에러 발생:", error);
        res.status(500).send({
            success: false,
            message: "좋아요 처리 중 에러가 발생했습니다. 나중에 다시 시도해주세요."
        });
    }

};


module.exports = { communityList, communityDetail, communityUpload, communityModify, communityDelete, toggleLike }