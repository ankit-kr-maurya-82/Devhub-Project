import mongoose from "mongoose";
import Question from "../models/question.model.js";

const normalizeTags = (tags) => {
  if (!Array.isArray(tags)) return [];
  return [...new Set(tags
    .filter((tag) => typeof tag === "string")
    .map((tag) => tag.trim().toLowerCase())
    .filter(Boolean))];
};

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

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
      tags: normalizeTags(tags),
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
    const { search, tag, status, sort = "newest" } = req.query;
    const allowedSorts = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      votes: { votes: -1 },
      views: { views: -1 },
    };
    if (!Object.hasOwn(allowedSorts, sort)) {
      return res.status(400).json({ success: false, message: "Invalid sort. Use newest, oldest, votes, or views." });
    }
    if (status !== undefined && status !== "solved" && status !== "unsolved") {
      return res.status(400).json({ success: false, message: "Invalid status. Use solved or unsolved." });
    }

    const parsePositiveInteger = (value, fallback, name) => {
      if (value === undefined) return { value: fallback };
      if (typeof value !== "string" || !/^[1-9]\d*$/.test(value)) {
        return { error: `${name} must be a positive integer` };
      }
      const parsed = Number(value);
      if (!Number.isSafeInteger(parsed)) return { error: `${name} must be a positive integer` };
      return { value: parsed };
    };
    const pageResult = parsePositiveInteger(req.query.page, 1, "page");
    const limitResult = parsePositiveInteger(req.query.limit, 10, "limit");
    if (pageResult.error || limitResult.error) {
      return res.status(400).json({ success: false, message: pageResult.error || limitResult.error });
    }
    if (limitResult.value > 50) {
      return res.status(400).json({ success: false, message: "limit must not exceed 50" });
    }

    const { page, limit } = { page: pageResult.value, limit: limitResult.value };
    if (!Number.isSafeInteger((page - 1) * limit)) {
      return res.status(400).json({ success: false, message: "page is too large" });
    }
    const filter = {};
    if (typeof search === "string" && search.trim()) {
      const searchRegex = new RegExp(escapeRegex(search.trim()), "i");
      filter.$or = [{ title: searchRegex }, { description: searchRegex }];
    }
    if (typeof tag === "string" && tag.trim()) filter.tags = tag.trim().toLowerCase();
    if (status === "solved") filter.isSolved = true;
    if (status === "unsolved") filter.isSolved = false;

    const [questions, totalQuestions] = await Promise.all([
      Question.find(filter)
        .populate("author", "name username avatar reputation")
        .sort(allowedSorts[sort])
        .skip((page - 1) * limit)
        .limit(limit),
      Question.countDocuments(filter),
    ]);
    const totalPages = Math.ceil(totalQuestions / limit);

    return res.status(200).json({
      success: true,
      data: questions,
      pagination: {
        page,
        limit,
        totalQuestions,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
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
        if(tags !== undefined) updateData.tags = normalizeTags(tags);


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
