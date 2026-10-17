import { dbService } from '../config/db.js';

export const analyticsController = {
  // GET /api/analytics/dashboard
  async getDashboardOverview(req, res) {
    try {
      const stats = await dbService.getDashboardStats();
      const recentAttempts = (await dbService.getAllAttempts()).slice(0, 5);
      const exams = await dbService.getExams();

      res.json({
        success: true,
        data: {
          ...stats,
          recentAttempts,
          exams: exams.slice(0, 6),
        },
      });
    } catch (err) {
      console.error('getDashboardOverview error:', err);
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // GET /api/analytics/exam/:examId
  async getExamAnalytics(req, res) {
    try {
      const { examId } = req.params;
      const exam = await dbService.getExamById(examId);
      if (!exam) {
        return res.status(404).json({ success: false, message: 'Exam not found' });
      }

      const attempts = await dbService.getAttemptsByExam(examId);
      const questions = await dbService.getQuestionsByExamId(examId);

      const totalAttempts = attempts.length;
      const completed = attempts.filter(a => a.status === 'completed');
      const disqualified = attempts.filter(a => a.status === 'disqualified');

      let avgScore = 0;
      let highestScore = 0;
      let lowestScore = 100;
      let passedCount = 0;
      let totalTimeSpent = 0;

      if (completed.length > 0) {
        let scoreSum = 0;
        completed.forEach(a => {
          const s = Number(a.score) || 0;
          scoreSum += s;
          if (s > highestScore) highestScore = s;
          if (s < lowestScore) lowestScore = s;
          if (a.passed) passedCount++;
          totalTimeSpent += (a.time_spent_seconds || 0);
        });
        avgScore = Number((scoreSum / completed.length).toFixed(2));
      } else {
        lowestScore = 0;
      }

      // Per-question accuracy analytics
      const questionStats = questions.map((q) => {
        let correctAnswersForQ = 0;
        let attemptedAnswersForQ = 0;

        completed.forEach(att => {
          const ans = att.answers ? att.answers[q.id] : null;
          if (ans !== undefined && ans !== null && ans !== '') {
            attemptedAnswersForQ++;
            // Check correctness
            const target = Array.isArray(q.correct_answers) ? q.correct_answers : [q.correct_answers];
            const studentAns = Array.isArray(ans) ? ans : [ans];
            const match = target.length === studentAns.length && target.every(t => studentAns.includes(t));
            if (match) correctAnswersForQ++;
          }
        });

        const accuracyRate = attemptedAnswersForQ > 0 ? Math.round((correctAnswersForQ / attemptedAnswersForQ) * 100) : 0;

        return {
          id: q.id,
          question_text: q.question_text,
          difficulty: q.difficulty,
          marks: q.marks,
          attempted_count: attemptedAnswersForQ,
          correct_count: correctAnswersForQ,
          accuracy_rate: accuracyRate,
        };
      });

      res.json({
        success: true,
        data: {
          exam: {
            id: exam.id,
            title: exam.title,
            category: exam.category,
            total_marks: exam.total_marks,
            passing_percentage: exam.passing_percentage,
          },
          summary: {
            total_attempts: totalAttempts,
            completed_count: completed.length,
            disqualified_count: disqualified.length,
            passed_count: passedCount,
            pass_rate: completed.length > 0 ? Math.round((passedCount / completed.length) * 100) : 0,
            average_score: avgScore,
            highest_score: highestScore,
            lowest_score: lowestScore,
            average_time_seconds: completed.length > 0 ? Math.round(totalTimeSpent / completed.length) : 0,
          },
          question_stats: questionStats,
          submissions: attempts,
        },
      });
    } catch (err) {
      console.error('getExamAnalytics error:', err);
      res.status(500).json({ success: false, message: err.message });
    }
  },
};
