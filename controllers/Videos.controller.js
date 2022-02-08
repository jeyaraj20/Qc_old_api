const createError = require("http-errors");
const db = require("../Models");
const vimeo = require("../helper/vimeo");
const S3 = require("../helper/s3");

module.exports = {
    get: async (req, res, next) => {
        let { chapterId, videosId } = req.query;
        let where = {};
        if (chapterId) where['chapterId'] = chapterId;
        if (videosId) where['videosId'] = videosId;
        try {
            const { count, rows } = await db.Videos.findAndCountAll({
                where: where
            });
            res.send({ statusCode: 200, message: 'Videos fetched successfully', data: rows });
        } catch (error) {
            res.send({ statusCode: 201, message: 'Videos fetched faied' });
        }
    },

    create: async (req, res, next) => {
        try {
            let {
                videosName,
                videosDescription,
                chapterId,
                videosPosition,
                thumbnailUrl
            } = req.body;
            videosDescription = videosDescription ? videosDescription : '';
            if (videosName && req.file && chapterId && thumbnailUrl) {
                let result = await vimeo.uploadVideo(req.file, videosName, videosDescription);
                await db.Videos.create(
                    {
                        videosName,
                        videosUrl: result,
                        videosDescription,
                        chapterId: Number(chapterId),
                        videosPosition: videosPosition ? Number(videosPosition) : 0,
                        createdBy: req.user.userid,
                        videosStatus: 'Y',
                        thumbnailUrl
                    }
                )
                io.emit('video-upload-status', 'success');
                res.send({ statusCode: 200, message: 'Video created successfully' });
            } else {
                io.emit('video-upload-status', 'failed');
                res.send({ statusCode: 201, message: 'Required fieldes missing' });
            }
        } catch (e) {
            io.emit('video-upload-status', 'failed');
            res.send({ statusCode: 201, message: 'Video created faied' });
        }
    },

    update: async (req, res, next) => {
        let { videosId } = req.params;
        let {
            videosName,
            videosDescription,
            videosPosition,
            videosStatus,
            videosUrl,
            thumbnailUrl
        } = req.body;
        if (!videosId) throw createError.BadRequest();
        try {
            let videos = await db.Videos.findOne({
                where: { videosId }
            });
            if (videos) {
                if (req.file) {
                    videosUrl = await vimeo.uploadVideo(req.file, videosName, videosDescription);
                    await vimeo.deleteVideo(videos.videosUrl);
                } else {
                    await vimeo.updateVideo(videos.videosUrl, videosName, videosDescription);
                }
                if( videos.thumbnailUrl && thumbnailUrl !== videos.thumbnailUrl){
                    await S3.s3Delete([videos.thumbnailUrl]);
                }
                await db.Videos.update(
                    {
                        videosName,
                        videosDescription,
                        videosPosition,
                        videosStatus,
                        videosUrl,
                        thumbnailUrl
                    },
                    { where: { videosId } }
                )
                io.emit('video-update-status', 'success');
                res.send({ statusCode: 200, message: 'Videos Updated successfully', });
            } else {
                io.emit('video-update-status', 'failed');
                res.send({ statusCode: 404, message: 'Videos Not Found!', });
            }
        } catch (error) {
            io.emit('video-update-status', 'failed');
            res.send({ statusCode: 201, message: 'Videos Updated failed!'});
        }
    },

    delete: async (req, res, next) => {
        let { videosId } = req.query;
        if (!videosId) throw createError.BadRequest();
        try {
            let videos = await db.Videos.findOne({
                where: { videosId }
            });
            if (videos) {
                await vimeo.deleteVideo(videos.videosUrl);
                if(videos.thumbnailUrl) await S3.s3Delete([videos.thumbnailUrl]);
                await db.Videos.destroy({
                    where: { videosId }
                });
                res.send({ statusCode: 200, message: 'Videos deleted successfully', });
            } else {
                res.send({ statusCode: 404, message: 'Videos Not Found!', });
            }
        } catch (error) {
            res.send({ statusCode: 201, message: 'Video deleted faied' });
        }
    },

};
