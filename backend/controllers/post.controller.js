import User from "../models/user.model.js";
import Post from "../models/post.model.js";
import {v2 as cloudinary} from "cloudinary";

export const getPost = async (req, res) => {
    const { id: postId } = req.params;

    try {
        const post = await Post.findById(postId);

        if (!post) {
            return res.status(400).json({ error: "Post not found." });
        }

        res.status(201).json(post);
    } catch (error) {
        res.status(500).json({ error: error.message });
        console.error(`Error in getPost: ${error.message}`);
    }
}

export const getFeed = async (req, res) => {
    const userId = req.user._id;

    try {
        const user = await User.findById(userId);

        if (!user) {
            return res.status(400).json({ error: "User not found." });
        }

        const following = user.following;
        const feedPosts = await Post.find({postedBy: {$in: following}}).sort({createdAt: -1});

        res.status(200).json(feedPosts);
    } catch(error) {
        res.status(500).json({ error: error.message });
        console.error(`Error in getFeed: ${error.message}`);
    }
}

export const createPost = async (req, res) => {
    const {postedBy, text } = req.body;
    let { img } = req.body;

    try {
        if (!postedBy || !text) {
            return res.status(400).json({ error: "Invalid post due to missing fields" });
        }

        const user = await User.findById(postedBy);

        if (!user) {
            return res.status(400).json({ error: "User not found." });
        }

        if (user._id.toString() !== req.user._id.toString()) {
            return res.status(400).json({ error: "Unauthorised to create post." });
        }

        const maxLen = 500;
        if (text.length > maxLen) {
            return res.status(400).json({ error: `Text must be less than ${maxLen} characters.` });
        }

        if (img) {
            const uploadedResponse = await cloudinary.uploader.upload(img);
            img = uploadedResponse.secure_url;
        }

        const newPost = new Post({ postedBy, text, img });
        await newPost.save();

        res.status(201).json(newPost);
    } catch (error) {
        res.status(500).json({ error: error.message });
        console.error(`Error in createPost: ${error.message}`);
    }
}

export const deletePost = async (req, res) => {
    const { id: postId } = req.params;
    const userId = req.user._id;

    try {
        const post = await Post.findById(postId);

        if (!post) {
            return res.status(400).json({ error: "Post not found." });
        }

        if (userId.toString() !== post.postedBy.toString()) {
            return res.status(401).json({ error: "Unauthroised to delete this post." });
        }

        if (post.img) {
            const imgId = post.img.split("/").pop().split(".")[0];
            await cloudinary.uploader.destroy(imgId);
        }

        await Post.findByIdAndDelete(postId);

        res.status(201).json({ message: "Post deleted successfully!" });
    } catch (error) {
        res.status(500).json({ error: error.message });
        console.error(`Error in deletePost: ${error.message}`);
    }
}

export const toggleLike = async (req, res) => {
    const { id: postId } = req.params;
    const userId = req.user._id;

    console.log(postId);

    try {
        const post = await Post.findById(postId);

        if (!post) {
            return res.status(400).json({ error: "Post not found." });
        }

        const userLikedPost = post.likes.includes(userId);

        if (userLikedPost) {
            await Post.updateOne({_id: postId}, {$pull: { likes: userId }});
            return res.status(200).json({ message: "Post unliked successfully!." });
        } else {
            post.likes.push(userId);
            await post.save();
            return res.status(200).json({ message: "Post liked successfully!." });
        }

    } catch (error) {
        res.status(500).json({ error: error.message });
        console.error(`Error in toggleLike: ${error.message}`);
    }
}

export const replyToPost = async (req, res) => {
    const { text } = req.body;
    const {id: postId} = req.params;
    const userId = req.user._id;
    const username = req.user.username;
    const profilePic = req.user.profilePic;

    try {
        if (!text) {
            return res.status(400).json({ error: "Text field is required." });
        }

        const post = await Post.findById(postId);

        if (!post) {
            return res.status(400).json({ error: "Post not found." });
        }

        const reply = {userId, username, profilePic, text};
        post.replies.push(reply);

        await post.save();
        res.status(200).json(reply);
    } catch(error) {
        res.status(500).json({ error: error.message });
        console.error(`Error in replyToPost: ${error.message}`);
    }
}

export const getUserPost = async (req, res) => {
    const { username } = req.params;

    try {
        const user = await User.findOne({username});
        console.log(user);
        if (!user) {
            return res.status(400).json({ error: "User not found." });
        }

        const posts = await Post.find({postedBy: user._id}).sort({createdAt: -1});
        
        res.status(200).json(posts);

    } catch (error) {
        res.status(500).json({ error: error.message });
        console.error(`Error in getUserPost: ${error.message}`);
    }
}