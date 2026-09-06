import multer from "multer";
import cloudinary from "../config/cloudinary.js";
import { CloudinaryStorage } from "multer-storage-cloudinary";

const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: "openhealth-reports",
        resource_type: "auto",
    }
})

const upload = multer({storage})

export default upload
