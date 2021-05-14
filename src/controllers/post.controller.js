const Post = require('../models/Post.model')
const cloudinary = require('../config/cloudinaryConfig')
const APIFeatures = require('../helpers/handle-feature-api')
const uploadFilesCloudinary = async (files) => {
    try {
        const images = [],videos=[]
        const results = await Promise.all(files.map(file => {
            if(file.mimetype.includes('image'))
                return cloudinary.uploader.upload(file.path,{folder : 'images'})
            else if(file.mimetype.includes('video'))
                return cloudinary.uploader.upload(file.path,{folder : 'images',resource_type: "video"})
        }
        ))
        results.forEach(result => {
            if(result.resource_type.includes('image'))
                images.push(result.public_id)
            else if(result.resource_type.includes('video'))
                videos.push(result.public_id)
        })
        return {images,videos}
    } catch (error) {
        console.log(error)
    }
}
module.exports.getPostList = async (req,res) => {
    try {
        const page = req.query.page*1 || 1
        const limit = req.query.limit*1 || 10
        const apiFeatures = new APIFeatures(Post.find(),req.query).filter().sort().pagination()
        const posts = await apiFeatures.query.populate({path : 'author',select: 'display_name avatar'})
        res.status(200).json({posts,pagination:{page,limit}})
    } catch (error) {
        console.log(error)
        res.status(400).json({errors : error.message})
    }
    
}
module.exports.getDetailPost = async (req,res) => {
    try {
        const id = req.params.id
        const post = await Post.findById(id)
        if(post)
            res.status(200).json({post})
        else 
            res.status(400).json({errors : 'Bài đăng không tồn tại'})

    } catch (error) {
        if(error.message.includes('Cast to ObjectId failed'))
            res.status(400).json({errors : 'Mã bài đăng không hợp lệ'})
        else
            res.status(400).json({errors : error.message})
    }
}
module.exports.postCreatePost = async (req,res) => {
    try {
        const {id} = req.user
        const {status} = req.body 
        const files = req.files
        if(!status && !files.length)
            res.status(400).json({errors : 'Bạn phải viết gì đó, hoặc thêm ảnh/video !'})
        else {
            const {images,videos} = await uploadFilesCloudinary(files)
            const post = await Post.create({status,images,videos,author : id})
            const postPopulated = await Post.populate(post, {path : 'author',select : 'display_name avatar'})
            res.status(200).json({post : postPopulated})
        }
    } catch (error) {
        console.log(error)
        res.status(400).json({errors : error.message})
    }
}
module.exports.putUpdatePost = async (req,res) => {
    try {
        const {id} = req.params
        const {status,isClearFiles} = req.body 
        const files = req.files || []
        if(files.length) {
            const updatePost = await Post.findById(id)
            if(updatePost.images.length)
                await cloudinary.api.delete_resources(updatePost.images)     
            if(updatePost.videos.length)    
                await cloudinary.api.delete_resources(updatePost.videos,{resource_type : 'video'})   
            const {images,videos} = await uploadFilesCloudinary(files)
            const updatedPost = await Post.findByIdAndUpdate(id,{
                $set : {
                    status : status ? status : '',
                    images,
                    videos
                }
            },{new:true})
            res.status(200).json({post : updatedPost})
        }
        else {
            const updatePost = await Post.findById(id)
            const totalFiles = updatePost.images.length + updatePost.videos.length
            if(isClearFiles === 'false') {
                if(!status && !totalFiles)
                    res.status(400).json({errors : 'Bạn phải viết gì đó, hoặc thêm ảnh/video !'})
                else {
                    const updatedPost = await Post.findByIdAndUpdate(id,{$set : {status : status ? status : ''}},{new:true})
                    res.status(200).json({post : updatedPost})
                }
            }
            else if(isClearFiles === 'true') {
                if(!status) 
                    res.status(400).json({errors : 'Bạn phải viết gì đó, hoặc thêm ảnh/video !'})
                else {
                    if(updatePost.images.length)
                        await cloudinary.api.delete_resources(updatePost.images)     
                    if(updatePost.videos.length)    
                        await cloudinary.api.delete_resources(updatePost.videos,{resource_type : 'video'})
                    const updatedPost = await Post.findByIdAndUpdate(id,{
                        $set : {
                            status : status ? status : '',
                            images : [],
                            videos : []
                        }
                    },{new:true})
                    res.status(200).json({post : updatedPost})
                }
            }
        }
    } catch (error) {
        console.log(error)
        res.status(400).json({errors : error.message})
    }
}
module.exports.deleteRemovePost = async (req,res) => {
    try {
        const id = req.params.id 
        const isExist = await Post.exists({_id :id})
        if(isExist) {
            const post = await Post.findByIdAndDelete(id)
            if(post.images.length) {
                const results = await cloudinary.api.delete_resources(post.images)
                res.status(200).json({post,results})
            }
            else if(post.videos.length) {
                const results = await cloudinary.api.delete_resources(post.videos,{resource_type : 'video'})
                res.status(200).json({post,results})
            }
            else
                res.status(200).json({post})
        }
        else {
            res.status(400).json({errors : 'Bài đăng không tồn tại'})
        }
    } catch (error) {
        console.log(error)
        if(error.message.includes('Cast to ObjectId failed'))
            res.status(400).json({errors : 'Mã bài đăng không hợp lệ'})
        else
            res.status(400).json({errors : error.message})
    }
}
module.exports.getCommentList = async (req,res) => {
    try {
        const {id} = req.params // id post
        const post = await Post.findById(id).populate({path : 'comments.author',select : 'display_name avatar'})
        res.status(200).json({comments : post.comments})
    } catch (error) {
        console.log(error)
        res.status(400).json({errors : error.message})
    }
}
module.exports.postAddComment = async (req,res) => {
    try {
        const {id} = req.params // id post
        const author = req.user.id 
        const {comment} = req.body 
        const updatedPost = await Post.findByIdAndUpdate(id,{$push : {
            comments : {author,content:comment}
        }},{new : true})
        const postPopulated = await Post.populate(updatedPost, {path : 'comments.author',select : 'display_name avatar'})
        res.status(200).json({comment : postPopulated.comments[postPopulated.comments.length - 1],amount : postPopulated.comments.length})
    } catch (error) {
        console.log(error)
        res.status(400).json({errors : error.message})
    }
}
module.exports.putUpdateComment = async (req,res) => {
    try {
        const {id} = req.params // id comment
        const {comment} = req.body 
        await Post.updateOne({'comments._id' : id},{$set : {'comments.$.content' : comment}})
        res.status(200).json({comment})
    } catch (error) {
        console.log(error)
        res.status(400).json({errors : error.message})
    }
}
module.exports.deleteRemoveComment =  async (req,res) => {
    try {
        const {id} = req.params // id comment
        await Post.updateOne({'comments._id' : id},{$pull : {'comments' : {_id : id}}})
        res.status(200).json({message : 'Delete comment successfully!'})
    } catch (error) {
        console.log(error)
        res.status(400).json({errors : error.message})
    }
}
module.exports.getLikePost =  async (req,res) => {
    try {
        const {id} = req.params // id post
        const userId = req.user.id
        const post = await Post.findById(id)
        if(post.likes.indexOf(userId) !== -1) {
            // await Post.findByIdAndUpdate(id,{$pull : {likes : userId}})
            post.likes.splice(post.likes.indexOf(userId),1)
            await post.save()
            res.status(200).json({amount : post.likes.length})
        }
        else {
            // await Post.findByIdAndUpdate(id,{$push : {likes : userId}})
            post.likes.push(userId)
            await post.save()
            res.status(200).json({amount : post.likes.length})
        }
    } catch (error) {
        console.log(error)
        res.status(400).json({errors : error.message})
    }
}
