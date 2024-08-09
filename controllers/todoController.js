const express = require("express");
const todoModel = require("../models/todoModel");
const userModel = require("../models/userModel");


exports.createTodo = async (req, res) => {
    try {
        const { userId } = req.user; // Correctly extract userId from req.user
        const { title, content } = req.body;

        // Create the todo
        const newTodo = await todoModel.create({ title, content, user: userId });

        // Update the user's todo array
        await userModel.findByIdAndUpdate(userId, { $push: { todo: newTodo._id } }, { new: true });

        res.status(201).json({
            message: "Todo content created successfully",
            data: newTodo
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};


// exports.createContentTodo = async(req,res)=>{
//     try {
//         const data = req.body

//         const createdContent = await todoModel.create(data);

//         res.status(200).json({
//             message:`Content created successfully.`,
//             data: createdContent
//         })

        
//     } catch (error) {
//         res.status(500).json({
//             message: error.message
//         })
        
//     }
// }



exports.getOne = async (req, res) => {
    try {
        const id = req.params.id;

        if (!id) {
            return res.status(400).json({
                message: "ID parameter is required"
            });
        }

        const content = await todoModel.findById(id);

        if (!content) {
            return res.status(404).json({
                message: "Content not found"
            });
        }

        res.status(200).json({
            message: "Content retrieved successfully",
            data: content
        });

    } catch (error) {
        res.status(500).json({
            message: error.message 
        });
    }
}





exports.getAll = async (req, res) => {
    try {
        const contents = await todoModel.find().populate("user").exec();

        res.status(200).json({
            message: "Contents retrieved successfully",
            totalNumberOfContents: contents.length,
            data: contents
        });

    } catch (error) {
        res.status(500).json({
            message: error.message 
        });
    }
}




exports.updateContent = async (req, res) => {
    try {
        const id = req.params.id;
        const data = req.body;

        const updatedContent = await todoModel.findByIdAndUpdate(id, data, { new: true});

        if (!updatedContent) {
            return res.status(404).json({
                message: "Content not found"
            });
        }

        res.status(200).json({
            message: "Content updated successfully",
            data: updatedContent
        });

    } catch (error) {
        res.status(500).json({
            message: error.message 
        });
    }
}





exports.deleteContent = async (req, res) => {
    try {
        const id = req.params.id;

        const deletedContent = await todoModel.findByIdAndDelete(id);

        if (!deletedContent) {
            return res.status(404).json({
                message: "Content not found"
            });
        }

        res.status(200).json({
            message: "Content deleted successfully",
            data: deletedContent
        });

    } catch (error) {
        res.status(500).json({
            message: error.message 
        });
    }
}
