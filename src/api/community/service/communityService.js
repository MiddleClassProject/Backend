const pool = require('../../../../config/databaseSet');

// 커뮤니티 목록보기 
const findAll = async (res) => {

    let sql = `SELECT community_id, community_title, community_content, cus_id, created_at 
                FROM community`;

    try {
        const [communityList] = await pool.query(sql);

        const result = communityList.map((c) => ({
            id: c.community_id,
            title: c.community_title,
            content: c.community_content,
            user: c.cus_id,
            date: c.created_at
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

// 댓글 -> 트리 구조 변환 함수
function nestComments(comments) {
    const commentMap = new Map();

    // 모든 댓글을 Map에 저장
    comments.forEach(comment => {
        commentMap.set(comment.comment_id, { ...comment, children: [] });
    });

    const nestedComments = [];
    comments.forEach(comment => {
        if (comment.parent_id === null) {
            nestedComments.push(commentMap.get(comment.comment_id)); // 최상위 댓글
        } else {
            // 대댓글 -> 부모의 children 배열에 추가
            const parent = commentMap.get(comment.parent_id);
            if (parent) {
                parent.children.push(commentMap.get(comment.comment_id));
            }
        }
    });

    return nestedComments;
}

// 커뮤니티 상세보기 
const findById = async (userId, communityId, res) => {
    let sql1 = `SELECT c.community_id, c.community_title, c.cus_id, 
                c.community_content, c.created_at,
                CASE WHEN EXISTS (
                    SELECT 1 
                    FROM \`like\` l 
                    WHERE l.community_id = c.community_id AND l.cus_id = ?
                ) THEN true ELSE false END AS is_like,
                (SELECT COUNT(*) FROM \`like\` l WHERE l.community_id = c.community_id) AS likes
                FROM community c
                WHERE c.community_id = ?;`;
    let sql2 = `SELECT comment_id, content, cus_id, parent_id, created_at
                FROM comment
                WHERE community_id = ?
                ORDER BY parent_id ASC, created_at ASC;`;

    try {
        const [sql1Result] = await pool.query(sql1, [userId, communityId]);

        if (sql1Result.length === 0) {
            return res.status(404).send({
                success: false,
                message: "해당 글을 찾을 수 없습니다."
            });
        }

        const community = sql1Result[0];

        const [comments] = await pool.query(sql2, [communityId]);

        // 댓글 트리 구성
        const nestedComments = nestComments(comments);

        const result = {
            community_id: community.community_id,
            community_title: community.community_title,
            community_cus_id: community.cus_id,
            community_content: community.community_content,
            created_at: community.created_at,
            is_like: community.is_like,
            likes: community.likes,
            comments: nestedComments
        };

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
                        FROM \`like\` 
                        WHERE cus_id = ? AND community_id = ?`;
    const insertSql = `INSERT INTO \`like\` (cus_id, community_id, created_at) 
                        VALUES (?, ?, NOW())`;
    const deleteSql = `DELETE FROM \`like\` 
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
const createComment = async (userId, communityId, content, parentId, res) => {

    const sql = `INSERT INTO comment (community_id, cus_id, parent_id, content, created_at) 
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

// 커뮤니티 댓글 삭제
const deleteComment = async (commentId, res) => {
    let sql = `DELETE FROM comment
                WHERE comment_id = ?`;

    try {
        const [result] = await pool.query(sql, [commentId]);

        console.log(result);

        res.status(200).send({
            success: true,
            message: "댓글이 삭제되었습니다."
        });

    } catch (error) {
        console.error("커뮤니티 댓글 삭제 중 에러 발생:", error);
        res.status(500).send({
            success: false,
            message: "커뮤니티 댓글 삭제 중 에러 발생. 나중에 다시 시도해주세요."
        });
    }
}

module.exports = { findAll, findById, uploadByUserId, updateById, deleteById, toggleLike, createComment, deleteComment }