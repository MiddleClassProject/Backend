const communityService = require('../service/communityService');

// 커뮤니티 목록보기
const communityList = (req, res) => {
    communityService.findAll(res);
};

// 커뮤니티 상세보기
const communityDetail = (req, res) => {
    const userId = req.body.cusId; // 로그인한 회원 id 가져오기
    if (!userId) {
        return res.status(401).send({
            success: false,
            message: "로그인이 필요한 페이지입니다."
        });
    }
    let communityId = req.params.id;
    communityService.findById(userId, communityId, res);
};

// 커뮤니티 글쓰기
const communityUpload = (req, res) => {
    const userId = req.body.userId;

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
    const userId = req.body.cusId; // 로그인한 회원 id 가져오기
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
    const userId = req.body.cusId; // 로그인한 회원 id 가져오기
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
    const userId = req.body.cusId; // 로그인한 회원 id 가져오기
    const communityId = req.params.id;

    communityService.toggleLike(userId, communityId, res);
};

// 커뮤니티 댓글 작성
const createComment = async (req, res) => {
    const userId = req.body.cusId; // 로그인한 회원 id 가져오기
    const communityId = req.params.id;
    const content = req.body.content;

    communityService.createComment(userId, communityId, content, res, null);
};


module.exports = { communityList, communityDetail, communityUpload, communityModify, communityDelete, toggleLike, createComment }