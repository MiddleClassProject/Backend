const pool = require('../../../../config/databaseSet');

// 커뮤니티 목록보기 
const findAll = async (res) => {

    let sql = `SELECT community_id, community_title, cus_id, created_at 
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
    let sql = `SELECT community_id, community_title, cus_id, community_content, created_at, 
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
const uploadByUserId = async (userId, req, res) => {
    let sql = `INSERT INTO community(community_title, community_content, cus_id, created_at) 
                    VALUES (?, ?, ?, NOW())`;
    try {
        const [result] = await pool.query(sql, [req.body.title, req.body.content, userId]);

        console.log(result);

        res.status(200).send({
            success: true,
            message: "글이 등록되었습니다."
        });

    } catch (error) {
        console.error("커뮤니티 글 저장 중 에러 발생:", error);
        res.status(500).send({
            success: false,
            message: "커뮤니티 글 저장 중 에러 발생. 나중에 다시 시도해주세요."
        });
    }
}

// 커뮤니티 글 수정
const updateById = async (communityId, req, res) => {
    let sql = `UPDATE community 
                SET community_title = ?, community_content = ? 
                WHERE community_id = ?`;

    try {
        const [result] = await pool.query(sql, [req.body.title, req.body.content, communityId]);

        console.log(result);

        res.status(200).send({
            success: true,
            message: "글이 수정되었습니다."
        });

    } catch (error) {
        console.error("커뮤니티 글 수정 중 에러 발생:", error);
        res.status(500).send({
            success: false,
            message: "커뮤니티 글 수정 중 에러 발생. 나중에 다시 시도해주세요."
        });
    }
}


// 커뮤니티 글 삭제
const deleteById = async (communityId, req, res) => {
    let sql = `DELETE FROM community
                WHERE community_id = ?`;

    try {
        const [result] = await pool.query(sql, [communityId]);

        console.log(result);

        res.status(200).send({
            success: true,
            message: "글이 삭제되었습니다."
        });

    } catch (error) {
        console.error("커뮤니티 글 삭제 중 에러 발생:", error);
        res.status(500).send({
            success: false,
            message: "커뮤니티 글 삭제 중 에러 발생. 나중에 다시 시도해주세요."
        });
    }
}

// 좋아요 토글 (추가/취소)
const toggleLike = async (userId, communityId, res) => {
    const checkSql = `SELECT * 
                        FROM like 
                        WHERE cus_id = ? AND community_id = ?`;
    const insertSql = `INSERT INTO like (cus_id, community_id) 
                        VALUES (?, ?)`;
    const deleteSql = `DELETE FROM like 
                        WHERE cus_id = ? AND community_id = ?`;

    try {
        const [like] = await pool.query(checkSql, [userId, communityId]);
        let result;
        if (like.length > 0) {
            await pool.query(deleteSql, [userId, communityId]);
            result = false; // 좋아요 취소
        } else {
            await pool.query(insertSql, [userId, communityId]);
            result = true; // 좋아요 추가
        }

        console.log(result);

        res.status(200).send({
            success: true,
            message: result ? "좋아요를 추가했습니다." : "좋아요를 취소했습니다."
        });

    } catch (error) {
        console.error("좋아요 처리 중 에러 발생:", error);
        res.status(500).send({
            success: false,
            message: "좋아요 처리 중 에러가 발생했습니다. 나중에 다시 시도해주세요."
        });
    }

};

// 커뮤니티 댓글 및 대댓글 작성
const createComment = async (userId, communityId, content, res, parentId = null) => {

    const sql = `INSERT INTO comments (community_id, cus_id, parent_id, content, created_at) 
    VALUES (?, ?, ?, ?, NOW())`;

    try {

        const [result] = await pool.query(sql, [communityId, userId, parentId, content]);

        console.log(result);

        const comment = {
            commentId: result.insertId,
            communityId,
            userId,
            parentId,
            content,
            createdAt: new Date()
        };

        res.status(201).json({
            success: true,
            message: "댓글이 작성되었습니다.",
            data: comment
        });
    } catch (error) {
        console.error("커뮤니티 댓글 작성 중 에러 발생:", error);
        res.status(500).json({
            success: false,
            message: "댓글 작성 중 에러가 발생했습니다. 나중에 다시 시도해주세요."
        });
    }

};

module.exports = { findAll, findById, uploadByUserId, updateById, deleteById, toggleLike, createComment }