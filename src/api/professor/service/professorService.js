const pool = require('../../../../config/databaseSet');

const getList = async (res) => {
    let sql = 'SELECT ID, NAME FROM PROFESSOR';

    try {
        const [result] = await pool.query(sql);
        console.log(result);
        res.status(200).send({
            success: true,
            professor: result
        });
    } catch (error) {
        console.log(error);
    }
}