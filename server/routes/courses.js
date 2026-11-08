const express = require("express");
const Course = require("../models/Course.js");
const User = require("../models/User.js");
const UserProgress = require("../models/UserProgress.js");
const auth = require("../middlewares/auth.js");
const optionalAuth = require("../middlewares/optionalAuth.js");
const { ensureVerificationId } = require("../utils/certificateVerify");

const router = express.Router();
async function ensureUserProgress(userId, courseId) {
  let progress = await UserProgress.findOne({ userId, courseId });
  if (progress) return progress;

  const course = await Course.findById(courseId);
  if (!course) return null;

  try {
    return await UserProgress.create({
      userId,
      courseId,
      modules: course.modules.map((m, idx) => ({
        moduleId: m.id,
        unlocked: idx === 0,
        lessons: m.lessons.map((l) => ({ lessonId: l.id })),
      })),
    });
  } catch (err) {
    if (err.code === 11000) {
      return UserProgress.findOne({ userId, courseId });
    }
    throw err;
  }
}

async function awardXP(userId, amount) {
  if (amount === 0) return;

  const result = await User.updateOne(
    { _id: userId },
    { $inc: { "xp.totalXP": amount, "xp.currentXP": amount } },
  );
  if (!result.matchedCount) {
    throw new Error("User not found while awarding XP");
  }

  while (
    await User.findOneAndUpdate(
      {
        _id: userId,
        $expr: {
          $and: [
            { $gt: ["$xp.maxXPForLevel", 0] },
            { $gte: ["$xp.currentXP", "$xp.maxXPForLevel"] },
          ],
        },
      },
      [
        {
          $set: {
            "xp.currentXP": {
              $subtract: ["$xp.currentXP", "$xp.maxXPForLevel"],
            },
            "xp.level": { $add: ["$xp.level", 1] },
            "xp.maxXPForLevel": {
              $floor: { $multiply: ["$xp.maxXPForLevel", 1.2] },
            },
          },
        },
      ],
      { new: true },
    )
  ) {}
}
router.get("/", optionalAuth, async (req, res) => {
  try {
    const courses = await Course.find({ isPublished: true }).select(
      "-modules.lessons.content -modules.lessons.quiz",
    );

    let progressList = [];
    if (req.id) {
      progressList = await UserProgress.find({ userId: req.id });
    }

    const countCompletedLessons = (prog) => {
      if (!prog?.modules?.length) return 0;
      let n = 0;
      for (const m of prog.modules) {
        for (const l of m.lessons || []) {
          if (l.completed) n += 1;
        }
      }
      return n;
    };

    const enriched = courses.map((c) => {
      const prog = progressList.find((p) => p.courseId.equals(c._id));
      const courseObj = c.toObject();
      const lessonsTotal = (courseObj.modules || []).reduce(
        (sum, m) => sum + (m.lessons?.length || 0),
        0,
      );
      return {
        ...courseObj,
        enrolled: !!prog,
        progress: prog?.overallProgress || 0,
        xpEarned: prog?.totalXPEarned || 0,
        completed: prog?.isCompleted || false,
        completedAt: prog?.completedAt || null,
        certificateIssued: prog?.certificateIssued || false,
        lessonsCompleted: prog ? countCompletedLessons(prog) : 0,
        lessonsTotal,
      };
    });

    res.json({ success: true, courses: enriched });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get("/:courseId", optionalAuth, async (req, res) => {
  try {
    const { courseId } = req.params;

    if (!courseId.match(/^[0-9a-fA-F]{24}$/)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid course ID" });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });
    }

    let progress = null;
    if (req.id) {
      progress = await UserProgress.findOne({
        userId: req.id,
        courseId,
      });
    }
    if (!progress && req.id) {
      progress = await UserProgress.create({
        userId: req.id,
        courseId,
        modules: course.modules.map((m, idx) => ({
          moduleId: m.id,
          unlocked: idx === 0,
          lessons: m.lessons.map((l) => ({ lessonId: l.id })),
        })),
      });
    }

    if (progress?.isCompleted) {
      await ensureVerificationId(progress);
      progress = await UserProgress.findOne({ userId: req.id, courseId });
    }

    const coursePayload = course.toObject();
    for (const module of coursePayload.modules || []) {
      for (const lesson of module.lessons || []) {
        for (const question of lesson.quiz?.questions || []) {
          delete question.correctAnswer;
          delete question.explanation;
        }
      }
    }

    res.json({ success: true, course: coursePayload, progress });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});
router.put("/:courseId/lesson/:lessonId/complete", auth, async (req, res) => {
  try {
    const userId = req.id; // From auth middleware
    const { courseId, lessonId } = req.params;
    if (!courseId.match(/^[0-9a-fA-F]{24}$/)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid course ID" });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });
    }

    const courseModule = course.modules.find((module) =>
      module.lessons.some((lesson) => lesson.id === lessonId),
    );
    const lessonData = courseModule?.lessons.find(
      (lesson) => lesson.id === lessonId,
    );
    if (!courseModule || !lessonData) {
      return res
        .status(404)
        .json({ success: false, message: "Lesson not found" });
    }

    const xpReward = lessonData.xpReward;
    if (!Number.isFinite(xpReward) || xpReward < 0) {
      throw new Error("Lesson XP reward is invalid");
    }

    const progress = await ensureUserProgress(userId, courseId);
    if (!progress) {
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });
    }

    const moduleProgress = progress.modules.find(
      (module) => module.moduleId === courseModule.id,
    );
    if (!moduleProgress?.unlocked) {
      return res
        .status(403)
        .json({ success: false, message: "Module is locked" });
    }

    const now = new Date();
    let updatedProgress = await UserProgress.findOneAndUpdate(
      {
        _id: progress._id,
        modules: {
          $elemMatch: {
            moduleId: courseModule.id,
            unlocked: true,
            lessons: {
              $elemMatch: {
                lessonId,
                completed: { $ne: true },
              },
            },
          },
        },
      },
      {
        $set: {
          "modules.$[module].lessons.$[lesson].completed": true,
          "modules.$[module].lessons.$[lesson].completedAt": now,
          "modules.$[module].lessons.$[lesson].xpEarned": xpReward,
          lastAccessedAt: now,
        },
        $inc: {
          "modules.$[module].lessons.$[lesson].attempts": 1,
          totalXPEarned: xpReward,
        },
      },
      {
        arrayFilters: [
          { "module.moduleId": courseModule.id, "module.unlocked": true },
          { "lesson.lessonId": lessonId, "lesson.completed": { $ne: true } },
        ],
        new: true,
      },
    );

    if (!updatedProgress) {
      updatedProgress = await UserProgress.findById(progress._id);
      const existingModule = updatedProgress?.modules.find(
        (module) => module.moduleId === courseModule.id,
      );
      const existingLesson = existingModule?.lessons.find(
        (lesson) => lesson.lessonId === lessonId,
      );

      if (existingLesson?.completed) {
        return res.json({ success: true, progress: updatedProgress });
      }
      return res
        .status(403)
        .json({
          success: false,
          message: "Lesson is unavailable or its module is locked",
        });
    }

    const totalLessons = course.modules.reduce(
      (sum, module) => sum + module.lessons.length,
      0,
    );
    await UserProgress.updateOne({ _id: progress._id }, [
      {
        $set: {
          overallProgress: totalLessons
            ? {
                $round: [
                  {
                    $multiply: [
                      {
                        $divide: [
                          {
                            $sum: {
                              $map: {
                                input: { $ifNull: ["$modules", []] },
                                as: "module",
                                in: {
                                  $size: {
                                    $filter: {
                                      input: {
                                        $ifNull: ["$$module.lessons", []],
                                      },
                                      as: "lesson",
                                      cond: {
                                        $eq: ["$$lesson.completed", true],
                                      },
                                    },
                                  },
                                },
                              },
                            },
                          },
                          totalLessons,
                        ],
                      },
                      100,
                    ],
                  },
                  0,
                ],
              }
            : 0,
        },
      },
    ]);
    updatedProgress = await UserProgress.findById(progress._id);
    if (!updatedProgress) {
      throw new Error("Progress not found after completing lesson");
    }

    await awardXP(userId, xpReward);
    res.json({ success: true, progress: updatedProgress });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put("/:courseId/module/:moduleId/complete", auth, async (req, res) => {
  try {
    const userId = req.id;
    const { courseId, moduleId } = req.params;
    const answers = req.body?.answers;

    if (!courseId.match(/^[0-9a-fA-F]{24}$/)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid course ID" });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });
    }

    const progress = await ensureUserProgress(userId, courseId);
    if (!progress) {
      return res
        .status(404)
        .json({ success: false, message: "Could not create progress" });
    }

    const modProgress = progress.modules.find((m) => m.moduleId === moduleId);
    if (!modProgress) {
      return res
        .status(404)
        .json({ success: false, message: "Module not in progress" });
    }

    if (!modProgress.unlocked) {
      return res
        .status(403)
        .json({ success: false, message: "Module is locked" });
    }

    if (modProgress.completed) {
      return res.json({
        success: true,
        progress,
        quizScore: modProgress.quizScore,
        correctCount: null,
        quizPassed: true,
        xpEarned: 0,
        courseCompleted: progress.isCompleted,
      });
    }

    const modData = course.modules.find((m) => m.id === moduleId);
    if (!modData) {
      return res
        .status(404)
        .json({ success: false, message: "Module not found in course" });
    }

    const allLessonsCompleted = modProgress.lessons.every(
      (lesson) => lesson.completed,
    );
    if (!allLessonsCompleted) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Complete every lesson before submitting the quiz",
        });
    }

    const questions = modData.lessons.flatMap(
      (lesson) => lesson.quiz?.questions || [],
    );
    const submittedAnswers = answers ?? (questions.length === 0 ? [] : null);
    if (
      !Array.isArray(submittedAnswers) ||
      submittedAnswers.length !== questions.length ||
      submittedAnswers.some(
        (answer, index) =>
          answer !== null &&
          (!Number.isInteger(answer) ||
            answer < 0 ||
            answer >= questions[index].options.length),
      )
    ) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Submit one valid answer for each quiz question",
        });
    }

    const correctCount = questions.reduce(
      (count, question, index) =>
        count + (submittedAnswers[index] === question.correctAnswer ? 1 : 0),
      0,
    );
    const quizScore = questions.length
      ? Math.round((correctCount / questions.length) * 100)
      : 100;
    const quizPassed = quizScore >= 70;
    const now = new Date();

    if (!quizPassed) {
      const failedProgress = await UserProgress.findOneAndUpdate(
        {
          _id: progress._id,
          modules: {
            $elemMatch: {
              moduleId,
              unlocked: true,
              completed: { $ne: true },
            },
          },
        },
        {
          $set: {
            "modules.$[module].quizScore": quizScore,
            "modules.$[module].quizPassed": false,
            lastAccessedAt: now,
          },
        },
        {
          arrayFilters: [
            {
              "module.moduleId": moduleId,
              "module.unlocked": true,
              "module.completed": { $ne: true },
            },
          ],
          new: true,
        },
      );

      if (!failedProgress) {
        const latestProgress = await UserProgress.findById(progress._id);
        const latestModule = latestProgress?.modules.find(
          (module) => module.moduleId === moduleId,
        );
        if (latestModule?.completed) {
          return res.json({
            success: true,
            progress: latestProgress,
            quizScore: latestModule.quizScore,
            correctCount: null,
            quizPassed: true,
            xpEarned: 0,
            courseCompleted: latestProgress.isCompleted,
          });
        }
      }

      return res.json({
        success: true,
        progress: failedProgress || progress,
        quizScore,
        correctCount,
        quizPassed: false,
        xpEarned: 0,
        courseCompleted: false,
      });
    }

    const xpReward = modData.xpReward;
    if (!Number.isFinite(xpReward) || xpReward < 0) {
      throw new Error("Module XP reward is invalid");
    }
    const allDone = progress.modules.every(
      (module) => module.moduleId === moduleId || module.completed,
    );
    const modIndex = course.modules.findIndex(
      (module) => module.id === moduleId,
    );
    const nextModule = course.modules[modIndex + 1];
    const update = {
      $set: {
        "modules.$[module].completed": true,
        "modules.$[module].completedAt": now,
        "modules.$[module].quizScore": quizScore,
        "modules.$[module].quizPassed": true,
        lastAccessedAt: now,
      },
      $inc: {
        "modules.$[module].xpEarned": xpReward,
        totalXPEarned: xpReward,
      },
    };
    const arrayFilters = [
      {
        "module.moduleId": moduleId,
        "module.unlocked": true,
        "module.completed": { $ne: true },
      },
    ];

    if (nextModule) {
      update.$set["modules.$[next].unlocked"] = true;
      arrayFilters.push({ "next.moduleId": nextModule.id });
    }

    if (allDone) {
      update.$set.isCompleted = true;
      update.$set.completedAt = now;
      update.$set.overallProgress = 100;
      update.$set.certificateIssued = true;
      update.$set.certificateIssuedAt = progress.certificateIssuedAt || now;
    }

    let completedProgress = await UserProgress.findOneAndUpdate(
      {
        _id: progress._id,
        modules: {
          $elemMatch: {
            moduleId,
            unlocked: true,
            completed: { $ne: true },
          },
        },
      },
      update,
      { arrayFilters, new: true },
    );

    if (!completedProgress) {
      completedProgress = await UserProgress.findById(progress._id);
      const latestModule = completedProgress?.modules.find(
        (module) => module.moduleId === moduleId,
      );
      if (latestModule?.completed) {
        return res.json({
          success: true,
          progress: completedProgress,
          quizScore: latestModule.quizScore,
          correctCount: null,
          quizPassed: true,
          xpEarned: 0,
          courseCompleted: completedProgress.isCompleted,
        });
      }
      return res
        .status(409)
        .json({
          success: false,
          message: "Module progress changed; refresh and try again",
        });
    }

    await awardXP(userId, xpReward);
    if (allDone) await ensureVerificationId(completedProgress);

    res.json({
      success: true,
      progress: completedProgress,
      quizScore,
      correctCount,
      quizPassed: true,
      xpEarned: xpReward,
      courseCompleted: allDone,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── GET generate & download certificate PDF ───────────────────────────────
// Generate and download certificate (only if course is completed)
router.get("/:courseId/certificate", auth, async (req, res) => {
  try {
    const userId = req.id; // From auth middleware
    const { courseId } = req.params;
    const { studentName = "Student" } = req.query;

    if (!courseId.match(/^[0-9a-fA-F]{24}$/)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid course ID" });
    }

    const progress = await UserProgress.findOne({ userId, courseId });
    if (!progress) {
      return res
        .status(404)
        .json({ success: false, message: "Progress not found" });
    }

    if (!progress.isCompleted) {
      return res
        .status(403)
        .json({ success: false, message: "Course not completed yet" });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });
    }

    // Fallback: Frontend-only sharing used instead
    return res
      .status(501)
      .json({
        success: false,
        message:
          "Server-side PDF generation is disabled. Please use the frontend download.",
      });

    if (!progress.certificateIssued) {
      progress.certificateIssued = true;
      progress.certificateIssuedAt = new Date();
      await progress.save();
    }

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="certificate-${course.slug}.pdf"`,
    });
    res.send(pdfBuffer);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
