const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/auth-middleware");
const ImageController = require("../controller/ImageController");
const upload = require("../middlewares/S3-middleware");


// 이미지 업로드
router.post('/', upload.array('images', 8), ImageController.PostImage)


// 이미지 가져오기
router.get('/', ImageController.GetImages)


// 이미지 삭제
router.delete('/', upload.array('images', 8), ImageController.DeleteImages)

module.exports = router;