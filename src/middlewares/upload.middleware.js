import multer from "multer";
import crypto from "crypto";
import cloudinary from "../config/cloudinary.js";
import { CloudinaryStorage } from "multer-storage-cloudinary";

/**
 * Uploads land in one Cloudinary folder, but the resource type has to differ
 * by file.
 *
 * Cloudinary classifies a PDF as an *image* and, on accounts created after
 * ~2019, blocks delivery of PDF and ZIP files by default — so a stored PDF
 * answers with an error when it is opened. Sending PDFs as `raw` delivers the
 * file itself instead, which is what lets it open in the browser. Images stay
 * `image` so they keep their transformations and inline preview.
 *
 * A raw upload also has to carry its extension in the public id, otherwise
 * Cloudinary serves it as an opaque download rather than a PDF.
 */
const storage = new CloudinaryStorage({
    cloudinary,
    params: (req, file) => {
        const extension = file.originalname.split(".").pop().toLowerCase()
        const isPdf = file.mimetype === "application/pdf"

        if (!isPdf) {
            return {
                folder: "openhealth-reports",
                resource_type: "image",
            }
        }

        return {
            folder: "openhealth-reports",
            resource_type: "raw",
            public_id: `${crypto.randomUUID()}.${extension}`,
        }
    }
})

const upload = multer({storage})

export default upload
