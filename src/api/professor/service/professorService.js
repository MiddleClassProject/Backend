const pool = require('../../../../config/databaseSet');

// 교수 목록보기 
const findAll = async (userId, res) => {

    let professorSql = `SELECT professor_id, name FROM professor`;
    let bookmarkSql = `SELECT professor_id FROM bookmark WHERE user_id = ?`;

    try {
        const [professorList] = await pool.query(professorSql);
        const [bookmarkList] = await pool.query(bookmarkSql, [userId]);

        const bookmarkedSet = new Set(bookmarkList.map(b => b.professor_id));

        const result = professorList.map(p => ({
            professor_id: p.professor_id,
            name: p.name,
            isBookmarked: bookmarkedSet.has(p.professor_id)
        }));

        console.log(result);

        res.status(200).send({
            success: true,
            list: result
        });

    } catch (error) {
        console.error("교수 목록 조회 중 에러 발생:", error);

        res.status(500).send({
            success: false,
            message: "교수 목록을 가져오는 중 에러 발생"
        });
    }
}

// 교수 상세보기
const findById = async (userId, professorId, res) => {
    let sql = `SELECT p.professor_id, p.name, p.detail,
                CASE WHEN b.user_id IS NOT NULL THEN true ELSE false END AS is_favorite
                FROM professor p
                LEFT JOIN bookmark b ON p.professor_id = b.professor_id AND b.user_id = ?
                WHERE p.professor_id = ?`; // todo: 조회할 항목 정리 필요 

    try {
        const [result] = await pool.query(sql, [userId, professorId]);

        if (result.length === 0) {
            return res.status(404).send({
                success: false,
                message: "해당 교수를 찾을 수 없습니다."
            });
        }

        console.log(result);

        res.status(200).send({
            success: true,
            detail: result
        });

    } catch (error) {
        console.error("교수 상세내용 조회 중 에러 발생:", error);
        res.status(500).send({
            success: false,
            message: "교수 상세내용 조회 중 에러 발생"
        });
    }
}

// 교수 탈퇴
const deleteById = async (professorId, res) => {
    let sql = 'DELETE FROM professor WHERE professor_id = ?';

    try {
        const [result] = await pool.query(sql, [professorId]);

        console.log(result);

        res.status(200).send({
            success: true,
            message: "교수 탈퇴가 성공적으로 처리되었습니다."
        });

    } catch (error) {
        console.error("교수 탈퇴 처리 중 에러 발생:", error);

        res.status(500).send({
            success: false,
            message: "교수 탈퇴 처리 중 에러 발생"
        });
    }
}

// 즐겨찾기 토글 (추가/취소)
const toggleStar = async (userId, professorId) => {
    const checkSql = `SELECT * 
                        FROM star 
                        WHERE cus_id = ? AND pro_id = ?`;
    const insertSql = `INSERT INTO star (cus_id, pro_id) 
                        VALUES (?, ?)`;
    const deleteSql = `DELETE FROM star 
                        WHERE cus_id = ? AND pro_id = ?`;

    const [star] = await pool.query(checkSql, [userId, professorId]);

    if (star.length > 0) {
        await pool.query(deleteSql, [userId, professorId]);
        return false;
    } else {
        await pool.query(insertSql, [userId, professorId]);
        return true;
    }
};

module.exports = { findAll, findById, deleteById, toggleStar }