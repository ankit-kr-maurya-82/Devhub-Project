import mongoose from "mongoose";
import Question from "../models/question.model.js";

const createQuestion = async (req, res) => {
  try {
    const { title, description, tags } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: "Title and description are required",
      });
    }

    const question = await Question.create({
      title,
      description,
      tags: Array.isArray(tags) ? tags : [],
      author: req.user._id,
    });

    return res.status(201).json({
      success: true,
      message: "Question created successfully",
      data: question,
    });
  } catch (error) {
    console.error("Create Question Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


const getAllQuestions = async (req, res) => {
  try {
    const questions = await Question.find()
      .populate("author", "name username avatar reputation")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: questions.length,
      data: questions,
    });

  } catch (error) {
    console.error("Get Questions Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const getQuestionById = async (req, res) => {
    try{
        const {questionId} = req.params;

        if(!questionId){
            return res.status(400).json({
                success: false,
                message: "Question ID is required"
            });
        }

        const question = await Question.findByIdAndUpdate(questionId,
            {
                $inc: {views: 1}
            },
            {
                new: true
            }   
        ).populate(
            "author",
            "name username avatar reputation"
        )

        if( question ){
            return res.status(200).json({
                success: true,
                data: question
            })
        } else {
            return res.status(404).json({
                success: false,
                message: "Question not found"
            })
        }

    } catch(error){
        console.error("Get Question By ID Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}


const updateQuestion = async(req,res)=>{
    try{
        const {questionId} = req.params;

        if(!questionId){
            return res.status(400).json({
                success: false,
                message: "Question ID is required"
            });
        }

        const {title, description, tags} = req.body;

        const updateData = {};
        
        if(title) updateData.title = title;
        if(description) updateData.description = description;
        if(tags) updateData.tags = tags;


        const question = await Question.findByIdAndUpdate(
            questionId,
            updateData,
            {
                new: true,
                runValidators: true
            }
        ).populate(
            "author",
            "name username avatar reputation"
        )

        if( question ){
            return res.status(200).json({
                success: true,
                message: "Question updated successfully",
                data: question
            })
        } else {
            return res.status(404).json({
                success: false,
                message: "Question not found"
            })
        }

    } catch(error){
        console.error("Update Question Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}

const deleteQuestion = async (req, res) => {
  try {
    const { questionId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(questionId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid question ID",
      });
    }

    const question = await Question.findById(questionId);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Question not found",
      });
    }

    if (question.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to delete this question",
      });
    }

    await question.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Question deleted successfully",
    });
  } catch (error) {
    console.error("Delete Question Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export {
    createQuestion,
    getAllQuestions,
    getQuestionById,
    updateQuestion,
    deleteQuestion
};
