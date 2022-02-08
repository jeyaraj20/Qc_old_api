const db = require("../Models");
const createError = require("http-errors");
const logger = require("../helper/adminLogger");
const S3 = require("../helper/s3");

async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array);
    }
}

module.exports = {
    // 1. Get Chapeters and Notes count
    getChapters: async (req, res, next) => {
        let { masterId, mainId, subId, name, status, _start, _limit } = req.body;
        let where = ``;
        if (masterId) where += where.length > 0 ? ` AND a.exmain_cat=${masterId}` : `a.exmain_cat=${masterId}`;
        if (mainId) where += where.length > 0 ? ` AND a.exsub_cat=${mainId}` : `a.exsub_cat=${mainId}`;
        if (subId) where += where.length > 0 ? ` AND a.exa_cat_id=${subId}` : `a.exa_cat_id=${subId}`;
        if (name) where += where.length > 0 ? ` AND regexp_like(a.chapter_name, '${name}', 'i')` : `regexp_like(a.chapter_name, '${name}', 'i')`;
        if (status) where += where.length > 0 ? ` AND a.chapter_status='${status}'` : `a.chapter_status='${status}'`;
        _start = _start ? Number(_start) : 0;
        _limit = _limit ? Number(_limit) : 10000;
        try {
            const [activeCount] = await db.sequelize.query(
                `SELECT 
                    a.*
                FROM 
                    tbl__examchapters AS a
                WHERE 
                    chapter_status='Y'
                `
            );
            const [inActiveCount] = await db.sequelize.query(
                `SELECT 
                    a.*
                FROM 
                    tbl__examchapters AS a
                WHERE 
                    chapter_status='N'
                `
            );
            const [count] = await db.sequelize.query(
                `SELECT 
                    a.*
                FROM 
                    tbl__examchapters AS a
                WHERE ${where}`
            );
            const [chapters] = await db.sequelize.query(
                `SELECT 
                    a.*, 
                    b.exa_cat_name AS "Mastercategory", 
                    c.exa_cat_name AS "Maincategory", 
                    d.exa_cat_name AS "Subcategory", 
                    COUNT(e.chapterId) AS "NotesCount"  
                FROM 
                    tbl__examchapters AS a
                    INNER JOIN tbl__exam_category AS b ON a.exa_cat_id=b.exa_cat_id
                    INNER JOIN tbl__exam_category AS c ON a.exmain_cat=c.exa_cat_id
                    INNER JOIN tbl__exam_category AS d ON a.exsub_cat=d.exa_cat_id
                    LEFT JOIN tbl__notes AS e ON a.chapt_id=e.chapterId
                WHERE ${where}
                GROUP BY
                    a.chapt_id, a.chapter_status
                LIMIT ${_limit}
                OFFSET ${_start}`
            );
            if (!chapters) {
                throw createError.NotFound("Chapters Not Found !!!");
            }

            await asyncForEach(chapters, async (oneDoc) => {
                const [videos] = await db.sequelize.query(
                    `SELECT 
                        *
                    FROM 
                    tbl__videos
                    WHERE chapterId=${oneDoc.chapt_id}`
                );
                oneDoc['VideosCount'] = videos.length;
            });

            res.send({ statusCode: 200, message: 'Chapters fetched successfully.', count: count.length, chapters, activeCount: activeCount.length, inActiveCount: inActiveCount.length });
        } catch (error) {
            logger.error(`Error at Get All Active Chapters : ${error.message}`);
            next(error);
        }
    },

    get: async (req, res, next) => {
        let { chapterId } = req.query;
        if (!chapterId) throw createError.BadRequest();
        try {
            const { count, rows } = await db.Notes.findAndCountAll({
                where: { chapterId }
            });
            res.send({ statusCode: 200, message: 'Notes fetched successfully', data: rows });
        } catch (error) {
            next('Notes fetched failed.');
        }
    },

    create: async (req, res, next) => {
        let {
            notesName,
            notesUrl,
            notesType,
            chapterId,
            notesPosition
        } = req.body;
        if (notesName && notesUrl) {
            try {
                await db.Notes.create(
                    {
                        notesName,
                        notesUrl,
                        notesType,
                        chapterId: Number(chapterId),
                        notesPosition: notesPosition ? Number(notesPosition) : 0,
                        createdBy: req.user.userid,
                        notesStatus: 'Y'
                    }
                )
                res.send({ statusCode: 200, message: 'Notes created successfully' });
            } catch (error) {
                next('Notes create failed.');
            }
        } else {
            throw createError.BadRequest();
        }
    },

    update: async (req, res, next) => {
        let { notesId } = req.params;
        let {
            notesName,
            notesUrl,
            notesType,
            notesPosition,
            notesStatus
        } = req.body;
        if (!notesId) throw createError.BadRequest();
        try {
            let notes = await db.Notes.findOne({
                where: { notesId }
            });
            if (notes) {
                if (notesUrl !== notes.notesUrl) {
                    await S3.s3Delete([notes.notesUrl]);
                }
                await db.Notes.update(
                    {
                        notesName,
                        notesUrl,
                        notesType,
                        notesPosition,
                        notesStatus
                    },
                    { where: { notesId } }
                )
                res.send({ statusCode: 200, message: 'Notes Updated successfully', });
            } else {
                res.send({ statusCode: 404, message: 'Notes Not Found!', });
            }
        } catch (error) {
            next('Notes fetched failed.');
        }
    },

    delete: async (req, res, next) => {
        let { notesId } = req.query;
        if (!notesId) throw createError.BadRequest();
        try {
            let notes = await db.Notes.findOne({
                where: { notesId }
            });
            if (notes) {
                await S3.s3Delete([notes.notesUrl]);
                await db.Notes.destroy({
                    where: { notesId }
                });
                res.send({ statusCode: 200, message: 'Notes deleted successfully', });
            } else {
                res.send({ statusCode: 404, message: 'Notes Not Found!', });
            }
        } catch (error) {
            next('Notes fetched failed.');
        }
    },

    getFiles: async (req, res, next) => {
        let { notesId } = req.query;
        if (!notesId) throw createError.BadRequest();
        try {
            let notes = await db.Notes.findOne({
                where: { notesId }
            });
            if (notes) {
                let file = await S3.getObject(notes.notesUrl);
                res.send(file);
            } else {
                res.send({ statusCode: 404, message: 'Notes Not Found!', });
            }
        } catch (error) {
            console.log( error , 'dcnkdjcvdkcndjc')
            next('Notes fetched failed.');
        }
    }
}
