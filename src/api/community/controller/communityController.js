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

    if (req.body.title == null || req.body.content == null) {
        res.status(400).send({
            success: false,
            message: "제목과 본문은 빈칸일 수 없습니다."
        });
    }

    communityService.upload(req, res);
};

// 커뮤니티 글 수정

// 커뮤니티 글 삭제

module.exports = { communityList, communityDetail }