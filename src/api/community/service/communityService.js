const pool = require('../../../../config/databaseSet');

// 커뮤니티 목록보기 
const findAll = async (res) => {

    let sql = `SELECT community_id, community_title, community_user, created_at 
                FROM community`;

    try {
        const [communityList] = await pool.query(sql);

        const result = communityList.map((c, index) => ({
            no: index + 1,
            id: c.community_id,
            title: c.community_title,
            writer: c.community_user,
            createdAt: c.created_at
        }));

        console.log(result);

        res.status(200).send({
            success: true,
            list: result
        });

    } catch (error) {
        console.error("커뮤니티 목록 조회 중 에러 발생:", error);

        res.status(500).send({
            success: false,
            message: "커뮤니티 목록 조회 중 에러 발생"
        });
    }
}

// 커뮤니티 상세보기 
const findById = async (userId, communityId, res) => {
    let sql = `SELECT community_id, community_title, community_user, community_content, created_at, 
                CASE WHEN l.user_id IS NOT NULL THEN true ELSE false END AS is_like
                FROM community c
                LEFT JOIN like l ON c.community_id = l.community_id AND l.user_id = ? 
                WHERE c.community_id = ?`;

    // todo: 댓글, 좋아요

    try {
        const [result] = await pool.query(sql, [userId, communityId]);

        if (result.length === 0) {
            return res.status(404).send({
                success: false,
                message: "해당 글을 찾을 수 없습니다."
            });
        }

        console.log(result);

        res.status(200).send({
            success: true,
            detail: result
        });

    } catch (error) {
        console.error("커뮤니티 상세보기 조회 중 에러 발생:", error);
        res.status(500).send({
            success: false,
            message: "커뮤니티 상세보기 조회 중 에러 발생"
        });
    }
}

// 커뮤니티 글쓰기


// 커뮤니티 글 수정


// 커뮤니티 글 삭제


module.exports = { findAll, findById }