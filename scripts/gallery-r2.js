const {S3Client, ListObjectsV2Command} = require("@aws-sdk/client-s3");
const base = require("./base")
const default_filters = ".(jpg|png|jpeg|bmp|svg)$"
async function r2(galleryConfig, data) {

    const key_id = base.processEnv(galleryConfig.key_id);
    const access_key = base.processEnv(galleryConfig.access_key);
    const custom_domain = galleryConfig.custom_domain;
    const account_id = base.processEnv(galleryConfig.account_id);
    const bucket = galleryConfig.bucket;

    const s3Client = new S3Client({
        region: 'auto',
        endpoint: `https://${account_id}.r2.cloudflarestorage.com`,
        credentials: {
            accessKeyId: key_id,
            secretAccessKey: access_key,
            ssoAccountId: account_id,
        }
    });

    const dirs = galleryConfig.dirs || [];
    if (dirs.length <= 0) return

    const filters = new RegExp(galleryConfig.filters || default_filters, 'i');

    for ( const d of dirs ) {
        const listCmd = new ListObjectsV2Command({
            Bucket: bucket,
            Prefix: d.dir
        })

        try {
            const result = (await s3Client.send(listCmd));
            const contents = result.Contents;

            let files = [];
            for ( const file of contents ) {
                const key = file.Key
                let validFile = filters.test(key);
                if (!validFile) {
                    console.log("skipped file: %s, filters: %s", key, filters);
                    continue;
                }

                const fullUrl = custom_domain + key
                files.push(new base.File(fullUrl, null));
            }
            if (files.length > 0) {
                data.push(base.buildGallery(d, files))
            }
        } catch (error) {
            console.error("r2 get object fail, dir: %s, error: ", d.dir, error)
        }
    }
}

module.exports = {
    r2
}