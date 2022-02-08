const { promises: fs } = require("fs");
const AWS = require("aws-sdk");

const s3 = new AWS.S3({
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY
});

const BUCKET_NAME = process.env.S3_BUCKET_NAME;

async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array);
    }
}

async function s3Upload(file) {
    let folder = file.fieldname;
    return await fs
        .readFile(file.path)
        .then(async (fileContent) => {
            const params = {
                Bucket: BUCKET_NAME + "/" + folder,
                Key: file.originalname,
                Body: fileContent,
                ACL: "public-read"
            };
            return params;
        })
        .then((params) => {
            return s3.upload(params).promise();
        })
        .then(async (data) => {
            console.log(`File uploaded successfully. ${data.Location}`);
            await fs.unlink(file.path);
            return data.Location;
        })
        .catch((err) => {
            console.log(`File uploaded failed ${err}`);
            return err;
        });
}

async function s3Delete(images) {
    await asyncForEach(images, async (key) => {
        const params = {
            Bucket: BUCKET_NAME,
            Key: key.split('.com/')[1]
        };
        try {
            await s3.deleteObject(params).promise();
            console.log("file deleted Successfully");
        } catch (err) {
            console.log("ERROR in file Deleting : " + JSON.stringify(err));
        }
    });
}

async function getObject(image) {
    let key = image.split('.com/')[1].replace(/%20/g, ' ');
    key = key.replace(/%28/g, '(');
    key = key.replace(/%29/g, ')');
    key = key.replace(/%2B/g,'+')
    try {
        var prom = new Promise((resolve, rejects) =>{
            s3.getObject({
                Bucket: BUCKET_NAME,
                Key: key
            },( error , data ) =>{
                if(error) rejects(error);
                if(data){
                    let res = Buffer.from(data.Body);
                    let resString = res.toString('base64');
                    resolve(resString);
                }
            });
        });
        try{
            return await prom;
        }catch(e){
            return "";
        }
    } catch (err) {
        console.log("ERROR in file Deleting : " + err);
    }
}
module.exports = {
    s3Upload,
    s3Delete,
    getObject
};