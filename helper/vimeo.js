let axios = require("axios");
let Vimeo = require('vimeo').Vimeo;
let client = new Vimeo(process.env.VIMEO_CLIENT_ID, process.env.VIMEO_CLIENT_SECRET, process.env.VIMEO_ACCESS_TOKEN);

async function uploadVideo(file, name, description) {
    var params = {
        name,
        description
    };
    try {
        return await new Promise(async function (resolve, reject) {
            await client.upload(file.path, params, function (uri) {
                console.log('Your video URI is: ' + uri);
                resolve(uri);
            },
                function (bytes_uploaded, bytes_total) {
                    var percentage = (bytes_uploaded / bytes_total * 100).toFixed();
                    io.emit('video-upload-percentage', percentage);
                    console.log(bytes_uploaded, bytes_total, percentage + '%')
                },
                function (error) {
                    console.log('Failed because: ' + error)
                    reject(error);
                });
        });
    } catch (e) {
        return e;
    }
}

async function updateVideo(videosUrl, name, description) {
    return await new Promise(async function (resolve, reject) {
        client.request({
            method: 'PATCH',
            path: videosUrl,
            query: {
                name,
                description
            }
        }, function (error, body, status_code, headers) {
            if(error){
                reject(error);
            }else{
                resolve(body);
            }
        })
    })
}

async function deleteVideo(videosUrl) {
    try {
        const reponse = axios({
            method: "DELETE",
            url: `https://api.vimeo.com${videosUrl}`,
            headers: {
                "Authorization": "Bearer " + process.env.VIMEO_ACCESS_TOKEN
            },
        }).then(response => {
            return response.data;
        }).catch(error => {
            return error;
        });
        return reponse;
    } catch (e) {
        return e;
    }
}

module.exports = {
    uploadVideo,
    updateVideo,
    deleteVideo
};