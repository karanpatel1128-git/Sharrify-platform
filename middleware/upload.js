const multer = require('multer');
const path = require('path');

// Set storage engine
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const fileExt = path.extname(file.originalname);
        cb(null, uniqueSuffix + fileExt);
    }
});

// File filter function
const fileFilter = (req, file, cb) => {
    const allowedMimeTypes = [
        'image/jpeg', 'image/jpg', 'image/png', 'image/gif',
        'video/mp4', 'video/mov', 'video/avi', 'video/mkv'
    ];
    
    if (!file) {  
        return cb(null, true); 
    }
    
    if (allowedMimeTypes.includes(file.mimetype)) {
        return cb(null, true);
    } else {
        return cb(new Error('Only images and videos are allowed'), false);
    }
};

// Initialize upload middleware
const upload = multer({
    storage: storage,
    limits: { fileSize: 1000 * 1024 * 1024 }, 
});

const uploadSingle = (req, res, next) => {
    const uploadHandler = upload.single('file');

    uploadHandler(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            return res.status(400).json({ success: false, message: err.message });
        } else if (err) {
            return res.status(400).json({ success: false, message: err.message });
        }
        next();
    });
};

// Middleware for multiple file uploads (up to 15 files)
const uploadMultiple = (req, res, next) => {
    const uploadHandler = upload.array('media', 15);

    uploadHandler(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            return res.status(400).json({ success: false, message: err.message });
        } else if (err) {
            return res.status(400).json({ success: false, message: err.message });
        }
        next();
    });
};

module.exports = { uploadSingle, uploadMultiple };

