const professorService = require('../service/professorService');

const professorlist = (req, res) => {
    professorService.getList(res);
};

module.exports = { professorlist }