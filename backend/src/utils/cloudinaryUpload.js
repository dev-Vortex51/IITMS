const crypto = require("crypto");
const https = require("https");

const encodeFormBody = (params) =>
  Object.entries(params)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join("&");

const signParams = (params, apiSecret) => {
  const sorted = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join("&");
  return crypto.createHash("sha1").update(`${sorted}${apiSecret}`).digest("hex");
};

const postForm = (host, path, body) =>
  new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: host,
        path,
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Content-Length": Buffer.byteLength(body),
        },
      },
      (res) => {
        let payload = "";
        res.on("data", (chunk) => {
          payload += chunk.toString();
        });
        res.on("end", () => {
          try {
            const parsed = JSON.parse(payload);
            if (res.statusCode >= 200 && res.statusCode < 300) {
              resolve(parsed);
              return;
            }
            reject(new Error(parsed.error?.message || "Cloudinary upload failed"));
          } catch (error) {
            reject(new Error("Invalid Cloudinary response"));
          }
        });
      },
    );

    req.on("error", reject);
    req.write(body);
    req.end();
  });

const uploadToCloudinary = async (file, options = {}) => {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error(
      "Cloudinary configuration missing. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.",
    );
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const folder = options.folder || "iitms/logbooks";
  const uploadParams = {
    timestamp,
    folder,
  };

  const signature = signParams(uploadParams, apiSecret);
  const dataUri = `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;
  const body = encodeFormBody({
    file: dataUri,
    api_key: apiKey,
    timestamp,
    folder,
    signature,
  });

  const response = await postForm(
    "api.cloudinary.com",
    `/v1_1/${cloudName}/auto/upload`,
    body,
  );

  return {
    url: response.secure_url,
    publicId: response.public_id,
    resourceType: response.resource_type,
    format: response.format,
    bytes: response.bytes,
  };
};

module.exports = {
  uploadToCloudinary,
};
