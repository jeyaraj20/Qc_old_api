const S3 = require("../helper/s3");

module.exports = {
    create: async (req, res, next) => {
        try{
            let result = await S3.s3Upload(req.file);
            res.send({ statusCode : 200, message : "Image upload succesfully.", data : result });
        }catch(error){
            res.send({ statusCode : 201, message : "Image upload failed." });
        }
    },

    delete: async (req, res, next) =>{
        try{
            await S3.s3Delete(req.query.image);
            res.send({ statusCode : 200, message : "Image Deleted succesfully."});
        }catch(error){
            res.send({ statusCode : 201, message : "Image Deleted failed." });
        }
    }
};
