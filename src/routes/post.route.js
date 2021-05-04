const express = require('express')
const router = express.Router()
const {requireLogin} = require('../middlewares/auth.middleware')
const {getPostList,
    getDetailPost,
    postCreatePost,
    putUpdatePost,
    deleteRemovePost,
    getCommentList,
    postAddComment,
    putUpdateComment,
    deleteRemoveComment,
    getLikePost}= require('../controllers/post.controller')
const upload = require('../config/multerConfig')
router.route('/post-list')
    .get(getPostList)
router.route('/:id') // id post
    .get(getDetailPost)
router.route('/create-post')
    .post(requireLogin,upload.any('post_files'),postCreatePost)
router.route('/update-post/:id') // id post
    .put(requireLogin,upload.any('post_files_edit'),putUpdatePost)
router.route('/delete-post/:id') // id post
    .delete(requireLogin,deleteRemovePost)
router.route('/comment-list/:id') // id post
    .get(getCommentList)
router.route('/add-comment/:id') // id post
    .post(requireLogin,postAddComment)
router.route('/update-comment/:id') // id comment
    .put(requireLogin,putUpdateComment)
router.route('/delete-comment/:id') // in comment
    .delete(requireLogin,deleteRemoveComment)
router.route('/like-post/:id') // id post
    .get(requireLogin,getLikePost)
module.exports = router