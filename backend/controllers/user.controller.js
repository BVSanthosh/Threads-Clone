import User from "../models/user.model.js";
import Post from "../models/post.model.js";
import bcrypt from "bcryptjs";
import generateTokenAndSetCookie from "../utils/setTokenAndCookie.js";
import {v2 as cloudinary} from "cloudinary";
import mongoose from "mongoose";

export const getProfile = async (req, res) => {
	const { query } = req.params;

	try {
		let user;

		if (mongoose.Types.ObjectId.isValid(query)) {
			user = await User.findOne({ _id: query }).select("-password").select("-updatedAt");
		} else {
			user = await User.findOne({ username: query }).select("-password").select("-updatedAt");
		}

		if (!user) return res.status(404).json({ error: "User not found" });

		res.status(200).json(user);
	} catch (err) {
		res.status(500).json({ error: err.message });
		console.log("Error in getUserProfile: ", err.message);
	}
};

export const signup = async (req, res) => {
    try {
        const { name, username, email, password } = req.body;

        const user = await User.findOne({$or: [{email},{username}]});

        if (user) {
            return res.status(400).json({ error: "User already exists!" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            name,
            username,
            email,
            password: hashedPassword,
        });
 
        await newUser.save();

        if (newUser) {
            generateTokenAndSetCookie(newUser._id, res);

            res.status(201).json({
                _id: newUser._id,
                name: newUser.name,
                username: newUser.username,
                email: newUser.email,
                bio: newUser.bio,
                provilePic: newUser.profilePic,
            });
        } else {
            res.status(400).json({ error: "Invalid user data." });
        }

    } catch(error) {
        res.status(500).json({ error: error.message });
        console.log(`Error in signup: ${error.message}`);
    }
} 

export const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = await User.findOne({ username });

        if (!user) {
            return res.status(404).json({ error: "Uwhatser does not exist!" });
        }

        if (user.isFrozen) {
            user.isFrozen = false;
            await user.save();
        }

        const validPasword = await bcrypt.compare(password, user.password)

        if (!validPasword) {
            return res.status(400).json({ error: "Invalid login credentials!" });
        }

        generateTokenAndSetCookie(user._id, res);
        
        res.status(200).json({
            _id: user._id,
            name: user.name,
            username: user.username,
            email: user.email,
            bio: user.bio,
            provilePic: user.profilePic,
        });
    } catch(error) {
        res.status(500).json({ error: error.message });
        console.log(`Error in login: ${error.message}`);
    }
} 

export const logout = (req, res) => {
    try {
        res.cookie("token", "", {maxAge: 1});
        res.status(200).json({ message: "User logged out successfully!" });
    } catch(error) {
        res.status(500).json({ error: error.message });
        console.log(`Error in logout: ${error.message}`);
    }
}

export const toggleFollow = async (req, res) => {
    try {
        const { id } = req.params;
        const userToUpdate = await User.findById(id);   
        const currentUser = await User.findById(req.user._id);

        if (id === req.user._id.toString()) {
            return res.status(400).json({ error: "Cannot follow yourself."});
        }

        if (!userToUpdate || !currentUser) {
            return res.status(404).json({ error: "User not found."});
        }

        const isFollowing = currentUser.following.includes();

        if (isFollowing) {
            await User.findByIdAndUpdate(req.user._id, { $pull: { following: id } });
            await User.findByIdAndUpdate(id, { $pull: { followers: req.user._id } });

            res.status(200).json({ message: "User unfollowed successfully!" });
        } else {
            await User.findByIdAndUpdate(req.user._id, { $push: { following: id } });
            await User.findByIdAndUpdate(id, { $push: { followers: req.user._id } });

            res.status(200).json({ message: "User followed successfully!" });
        } 

    } catch(error) {
        res.status(500).json({ error: error.message });
        console.log(`Error in toggleFollow: ${error.message}`);
    }
}

export const updateProfile = async (req, res) => {
    const { name, username, email, password, bio } = req.body;
    let { profilePic } = req.body;
    const userId = req.user._id;

    try {
        let user = await User.findById(userId);

        if (!user) {
            return res.status(400).json({ error: "User not found."});
        }

        if (req.params.id !== userId.toString()) {const uploadedResponse = await cloudinary.uploader.upload(profilePic);
            return res.status(400).json({ error: "Unauthorised to update this profile."});
        }

        if (password) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            user.password = hashedPassword;
        }

        if (profilePic) {
            if (user.profilePic) {
                await cloudinary.uploader.destroy(user.profilePic.split("/").pop().split(".")[0]);
            }

            const uploadedResponse = await cloudinary.uploader.upload(profilePic);
            profilePic = uploadedResponse.secure_url;
        }

        user.name = name || user.name;
        user.username = username || user.username;
        user.email = email || user.email;
        user.profilePic = profilePic || user.profilePic;
        user.bio = bio || user.bio;

        user = await user.save();

        await Post.updateMany(
            {"replies.userId": userId},
            {
                $set: {
                    "replies.$[reply].username": user.username,
                    "replies.$[reply].userProfilePic": user.profilePic,
                },
            },
            {arrayFilters: [{"reply.userId": userId}]}
        );

        user.password = null;

        res.status(200).json(user);
    } catch(error) {
        res.status(500).json({ error: error.message });
        console.log(`Error in updateProfile: ${error.message}`);
    }
}

export const getSuggestedUsers = async (req, res) => {
    console.log("req: " + req);
    const userId = req.user._id;

    try {
        const usersFollowed = await User.findById(userId).select("following");
        const users = await User.aggregate([
            {
                $match: {
                    _id: {$ne: userId}
                }
            },
            {
                $sample: {size: 10}
            }
        ]);
        const filteredUsers = users.filter(user => !usersFollowed.following.includes(users._id));
        const suggestedUsers = filteredUsers.slice(0, 4);

        suggestedUsers.forEach(user => user.password = null);

        res.status(200).json(suggestedUsers);
    } catch (error) {
        res.status(500).json({ error: error.message });
        console.log(`Error in getSuggestedUsers: ${error.message}`);
    }
}

export const freezeAccount = async (req, res) => {
    const userId = req.user._id;

    try {
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ error: "User not found."});
        }

        user.isFrozen = true;
        await user.save();

        res.status(200).json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
        console.log(`Error in freezeAccount: ${error.message}`);
    }
}

export const authUser = async (req, res) => {
  try {
    const user = req.user;
    res.status(200).json({ user });
  } catch (error) {
    console.error(`Error in authUser: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
};
