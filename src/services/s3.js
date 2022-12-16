import { CognitoIdentityClient } from "@aws-sdk/client-cognito-identity"
import { fromCognitoIdentityPool } from "@aws-sdk/credential-provider-cognito-identity"
import { S3Client, ListObjectsCommand, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

// Initialize the Amazon Cognito credentials provider
const s3 = new S3Client({
    region: import.meta.env.VITE_REGION,
    credentials: fromCognitoIdentityPool({
        client: new CognitoIdentityClient({ region: import.meta.env.VITE_REGION }),
        identityPoolId: import.meta.env.VITE_ID_POOL,
    }),
});

export async function listObjects (Prefix = "") {
    return await s3.send(
        new ListObjectsCommand({
            Delimiter: "/",
            Bucket: import.meta.env.VITE_S3_BUCKET,
            Prefix,
        })
    );
}

export async function addImage(dirPath, files) {
    if (!files.length) {
        return alert("Choose a file to upload first.");
    }
    const file = files[0];
    const fileName = file.name;
    const imageKey = dirPath + fileName;
    const uploadParams = {
        Bucket: import.meta.env.VITE_S3_BUCKET,
        Key: imageKey,
        Body: file
    };
    return await s3.send(new PutObjectCommand(uploadParams));
}

export async function deleteImage(imageSrc) {
    const imageKey = imageSrc.split(import.meta.env.VITE_BUCKET_URL)[1];
    return await s3.send(new DeleteObjectCommand({ Key: imageKey, Bucket: import.meta.env.VITE_S3_BUCKET }));
}