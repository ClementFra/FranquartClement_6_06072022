const multer = require("multer");

const MIME_TYPES = { // MME type configurations
  "image/jpg": "jpg",
  "image/jpeg": "jpg",
  "image/png": "png",
};

// Multer configurations
const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, "images"); // Destination folder image
  },
  filename: (req, file, callback) => {
    const name = file.originalname.split(" ").join("_"); // Set the name of image and replace spaces by underscores
    const extension = MIME_TYPES[file.mimetype]; // Extension of file
    callback(null, name + Date.now() + "." + extension); // Set an other name with the date of the upload + the extension of the file
  },
});

module.exports = multer({ storage: storage }).single("image");
