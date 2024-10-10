const professorService = require('../service/professorService');

// 교수 목록보기
const professorList = (req, res) => {
    professorService.findAll(res);
};

// 교수 상세보기 
const professorDetail = (req, res) => {
    let professorId = req.params.id;
    professorService.findById(professorId, res);
};

// 교수 탈퇴
const professorQuit = (req, res) => {
    // todo: 로그인한 교수의 id 들고 오기
    professorService.deleteById(professorId, res);
}

module.exports = { professorList, professorDetail, professorQuit }