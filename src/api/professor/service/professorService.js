const pool = require('../../../../config/databaseSet');

// 교수 목록보기 
const findAll = async (res) => {

    let sql = 'SELECT professor_id, name FROM professor';

    try {
        const [result] = await pool.query(sql);
        console.log(result);
        res.status(200).send({
            success: true,
            list: result
        });
    } catch (error) {
        console.log(error);
    }
}

// 교수 상세보기
const findById = async (res) => {
    let sql = 'SELECT professor_id, name, detail FROM professor WHERE professor_id=?'; // 조회할 항목 정리 필요 

    try {
        const [result] = await pool.query(sql, [notice_id]);
        console.log(result);
        res.status(200).send({
            success: true,
            detail: result
        });
    } catch (error) {
        console.log(error);
    }
}

// 교수 탈퇴
const deleteById = async (res) => {
    let sql = 'DELETE FROM professor WHERE professor_id = ?';

    try {
        const [result] = await pool.query(sql, [notice_id]);
        console.log(result);
        res.status(200).send({
            success: true
        });
    } catch (error) {
        console.log(error);
    }
}

module.exports = { findAll, findById, deleteById }