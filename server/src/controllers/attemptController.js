import { dbService } from '../config/db.js';

export const attemptController = {
  // POST /api/attempts/start
  async startAttempt(req, res) {
    try {
      const { exam_id, student_name, student_email, student_id } = req.body;

      if (!exam_id) {
        return res.status(400).json({ success: false, message: 'exam_id is required' });
      }

      const exam = await dbService.getExamById(exam_id);
      if (!exam) {
        return res.status(404).json({ success: false, message: 'Exam not found' });
      }

      const attempt = await dbService.createAttempt({
        exam_id,
        student_id,
        student_name: student_name || 'Anonymous Student',
        student_email: student_email || 'student@examsphere.io',
        total_marks: exam.total_marks,
      });

      res.status(201).json({
        success: true,
        data: attempt,
        exam: {
          id: exam.id,
          title: exam.title,
          duration_minutes: exam.duration_minutes,
          total_marks: exam.total_marks,
          tab_switch_limit: exam.tab_switch_limit,
          fullscreen_required: exam.fullscreen_required,
          webcam_required: exam.webcam_required,
        },
      });
    } catch (err) {
      console.error('startAttempt error:', err);
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // POST /api/attempts/:id/violation
  async logViolation(req, res) {
    try {
      const { id } = req.params;
      const { violation_type, message } = req.body;

      const attempt = await dbService.getAttemptById(id);
      if (!attempt) {
        return res.status(404).json({ success: false, message: 'Attempt not found' });
      }

      const exam = await dbService.getExamById(attempt.exam_id);
      const limit = exam ? exam.tab_switch_limit || 3 : 3;

      const newViolationsCount = (attempt.violations_count || 0) + 1;
      const newLog = [
        ...(attempt.violations_log || []),
        {
          type: violation_type || 'tab_switch',
          message: message || 'Proctoring rule violation detected',
          timestamp: new Date().toISOString(),
          violation_number: newViolationsCount,
        },
      ];

      const isDisqualified = newViolationsCount > limit;
      const status = isDisqualified ? 'disqualified' : attempt.status;

      const updated = await dbService.updateAttempt(id, {
        violations_count: newViolationsCount,
        violations_log: newLog,
        status,
      });

      res.json({
        success: true,
        violations_count: newViolationsCount,
        limit,
        isDisqualified,
        data: updated,
      });
    } catch (err) {
      console.error('logViolation error:', err);
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // POST /api/attempts/:id/submit
  async submitAttempt(req, res) {
    try {
      const { id } = req.params;
      const { answers = {}, time_spent_seconds = 0 } = req.body;

      const attempt = await dbService.getAttemptById(id);
      if (!attempt) {
        return res.status(404).json({ success: false, message: 'Attempt not found' });
      }

      const exam = await dbService.getExamById(attempt.exam_id);
      if (!exam) {
        return res.status(404).json({ success: false, message: 'Associated exam not found' });
      }

      const questions = await dbService.getQuestionsByExamId(exam.id);

      // Automated Evaluation Engine
      let totalCalculatedMarks = 0;
      let earnedScore = 0;
      let correctCount = 0;
      let incorrectCount = 0;
      let unattemptedCount = 0;

      const questionBreakdown = questions.map((q) => {
        const questionMarks = Number(q.marks) || 1;
        const negativeMarks = exam.negative_marking ? Number(q.negative_marks || exam.negative_marks_per_question || 0) : 0;
        totalCalculatedMarks += questionMarks;

        const studentAns = answers[q.id];

        if (studentAns === undefined || studentAns === null || (Array.isArray(studentAns) && studentAns.length === 0) || studentAns === '') {
          unattemptedCount++;
          return {
            question_id: q.id,
            question_text: q.question_text,
            question_type: q.question_type,
            options: q.options,
            student_answer: null,
            correct_answers: q.correct_answers,
            explanation: q.explanation,
            is_correct: false,
            is_attempted: false,
            marks_awarded: 0,
            possible_marks: questionMarks,
          };
        }

        // Compare answer based on question type
        let isCorrect = false;

        if (q.question_type === 'single_choice' || q.question_type === 'true_false') {
          const selected = Array.isArray(studentAns) ? studentAns[0] : studentAns;
          const target = Array.isArray(q.correct_answers) ? q.correct_answers[0] : q.correct_answers;
          isCorrect = String(selected).trim().toLowerCase() === String(target).trim().toLowerCase();
        } else if (q.question_type === 'multi_choice') {
          const studentArr = Array.isArray(studentAns) ? studentAns.map(s => String(s).trim().toLowerCase()) : [String(studentAns).trim().toLowerCase()];
          const targetArr = Array.isArray(q.correct_answers) ? q.correct_answers.map(s => String(s).trim().toLowerCase()) : [String(q.correct_answers).trim().toLowerCase()];
          
          const hasAll = targetArr.every(ans => studentArr.includes(ans));
          const hasNoExtra = studentArr.every(ans => targetArr.includes(ans));
          isCorrect = hasAll && hasNoExtra;
        } else {
          // Short answer / text
          const studentStr = String(studentAns).trim().toLowerCase();
          const targetArr = Array.isArray(q.correct_answers) ? q.correct_answers : [q.correct_answers];
          isCorrect = targetArr.some(t => String(t).trim().toLowerCase() === studentStr);
        }

        let awarded = 0;
        if (isCorrect) {
          awarded = questionMarks;
          earnedScore += awarded;
          correctCount++;
        } else {
          awarded = -negativeMarks;
          earnedScore += awarded;
          incorrectCount++;
        }

        return {
          question_id: q.id,
          question_text: q.question_text,
          question_type: q.question_type,
          options: q.options,
          student_answer: studentAns,
          correct_answers: q.correct_answers,
          explanation: q.explanation,
          is_correct: isCorrect,
          is_attempted: true,
          marks_awarded: awarded,
          possible_marks: questionMarks,
        };
      });

      // Clamp score at zero minimum
      const finalScore = Math.max(0, Number(earnedScore.toFixed(2)));
      const maxMarks = totalCalculatedMarks || exam.total_marks || 100;
      const percentage = Number(((finalScore / maxMarks) * 100).toFixed(2));
      const passed = percentage >= Number(exam.passing_percentage);

      let feedback = '';
      if (percentage >= 90) feedback = 'Outstanding performance! Exemplary mastery of the subject matter.';
      else if (percentage >= 75) feedback = 'Great work! Solid grasp of concepts with minor gaps.';
      else if (passed) feedback = 'Passed! You met the certification requirements. Review explanations to improve.';
      else feedback = 'Needs improvement. Please review the detailed question explanations below and retake.';

      const submissionUpdate = {
        answers,
        submitted_at: new Date().toISOString(),
        time_spent_seconds: Number(time_spent_seconds) || 0,
        score: finalScore,
        total_marks: maxMarks,
        percentage,
        passed,
        status: 'completed',
        feedback,
      };

      const updated = await dbService.updateAttempt(id, submissionUpdate);

      res.json({
        success: true,
        message: 'Exam submitted successfully',
        data: {
          ...updated,
          exam_title: exam.title,
          passing_percentage: exam.passing_percentage,
          correct_count: correctCount,
          incorrect_count: incorrectCount,
          unattempted_count: unattemptedCount,
          total_questions: questions.length,
          breakdown: questionBreakdown,
        },
      });
    } catch (err) {
      console.error('submitAttempt error:', err);
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // GET /api/attempts/:id
  async getAttemptResult(req, res) {
    try {
      const { id } = req.params;
      const attempt = await dbService.getAttemptById(id);
      if (!attempt) {
        return res.status(404).json({ success: false, message: 'Attempt not found' });
      }

      const exam = await dbService.getExamById(attempt.exam_id);
      const questions = exam ? await dbService.getQuestionsByExamId(exam.id) : [];

      // Reconstruct breakdown
      const breakdown = questions.map(q => {
        const studentAns = attempt.answers ? attempt.answers[q.id] : null;
        let isCorrect = false;

        if (studentAns !== undefined && studentAns !== null && studentAns !== '') {
          if (q.question_type === 'single_choice' || q.question_type === 'true_false') {
            const selected = Array.isArray(studentAns) ? studentAns[0] : studentAns;
            const target = Array.isArray(q.correct_answers) ? q.correct_answers[0] : q.correct_answers;
            isCorrect = String(selected).trim().toLowerCase() === String(target).trim().toLowerCase();
          } else if (q.question_type === 'multi_choice') {
            const sArr = Array.isArray(studentAns) ? studentAns.map(s => String(s).trim().toLowerCase()) : [String(studentAns).trim().toLowerCase()];
            const tArr = Array.isArray(q.correct_answers) ? q.correct_answers.map(s => String(s).trim().toLowerCase()) : [String(q.correct_answers).trim().toLowerCase()];
            isCorrect = tArr.every(a => sArr.includes(a)) && sArr.every(a => tArr.includes(a));
          } else {
            const sStr = String(studentAns).trim().toLowerCase();
            const tArr = Array.isArray(q.correct_answers) ? q.correct_answers : [q.correct_answers];
            isCorrect = tArr.some(t => String(t).trim().toLowerCase() === sStr);
          }
        }

        return {
          question_id: q.id,
          question_text: q.question_text,
          question_type: q.question_type,
          options: q.options,
          student_answer: studentAns,
          correct_answers: q.correct_answers,
          explanation: q.explanation,
          is_correct: isCorrect,
          marks: q.marks,
          difficulty: q.difficulty,
        };
      });

      res.json({
        success: true,
        data: {
          ...attempt,
          exam: exam ? { title: exam.title, category: exam.category, passing_percentage: exam.passing_percentage } : null,
          breakdown,
        },
      });
    } catch (err) {
      console.error('getAttemptResult error:', err);
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // GET /api/attempts/student/:email
  async getStudentAttempts(req, res) {
    try {
      const { email } = req.params;
      const attempts = await dbService.getAttemptsByStudent(email);
      res.json({ success: true, count: attempts.length, data: attempts });
    } catch (err) {
      console.error('getStudentAttempts error:', err);
      res.status(500).json({ success: false, message: err.message });
    }
  },
};
