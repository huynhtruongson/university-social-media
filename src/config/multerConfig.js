const multer = require('multer')
const { v4: uuidv4 } = require('uuid');
const storage = multer.diskStorage({
    filename: function (req, file, cb) {
        cb(
            null,
            `${uuidv4()}.${file.originalname.split('.').splice(-1)}`,
        );
    },
});

const upload = multer({ storage: storage });
module.exports = upload