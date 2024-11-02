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

    communityService.upload(userId, req, res);
};

// 커뮤니티 글 수정

// 커뮤니티 글 삭제

module.exports = { communityList, communityDetail, communityUpload }