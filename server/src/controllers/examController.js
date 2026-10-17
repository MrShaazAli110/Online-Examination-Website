import { dbService } from '../config/db.js';

export const examController = {
  // GET /api/exams
  async getExams(req, res) {
    try {
      const { category, status, search } = req.query;
      const exams = await dbService.getExams({ category, status, search });
      
      // Attach question count
      const enriched = await Promise.all(
        exams.map(async (exam) => {
          const questions = await dbService.getQuestionsByExamId(exam.id);
          return {
            ...exam,
            question_count: questions.length,
          };
        })
      );

      res.json({ success: true, count: enriched.length, data: enriched });
    } catch (err) {
      console.error('getExams error:', err);
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // GET /api/exams/:id
  async getExamById(req, res) {
    try {
      const { id } = req.params;
      const { role } = req.query; // 'examiner' or 'student'
      
      const exam = await dbService.getExamById(id);
      if (!exam) {
        return res.status(404).json({ success: false, message: 'Exam not found' });
      }

      let questions = await dbService.getQuestionsByExamId(id);

      // SECURITY: If student is taking the exam, redact the correct_answers and explanations!
      if (role !== 'examiner' && role !== 'admin' && role !== 'super_admin') {
        questions = questions.map((q) => {
          const { correct_answers, explanation, ...sanitized } = q;
          return sanitized;
        });
      }

      res.json({
        success: true,
        data: {
          ...exam,
          questions,
          question_count: questions.length,
        },
      });
    } catch (err) {
      console.error('getExamById error:', err);
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // POST /api/exams
  async createExam(req, res) {
    try {
      const examData = req.body;
      if (!examData.title) {
        return res.status(400).json({ success: false, message: 'Title is required' });
      }

      const created = await dbService.createExam(examData);

      // If initial questions were sent with exam creation
      if (Array.isArray(examData.questions) && examData.questions.length > 0) {
        for (let i = 0; i < examData.questions.length; i++) {
          await dbService.createQuestion({
            ...examData.questions[i],
            exam_id: created.id,
            order_index: i + 1,
          });
        }
      }

      res.status(201).json({ success: true, data: created, message: 'Exam created successfully' });
    } catch (err) {
      console.error('createExam error:', err);
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // PUT /api/exams/:id
  async updateExam(req, res) {
    try {
      const { id } = req.params;
      const updated = await dbService.updateExam(id, req.body);
      if (!updated) {
        return res.status(404).json({ success: false, message: 'Exam not found' });
      }
      res.json({ success: true, data: updated, message: 'Exam updated successfully' });
    } catch (err) {
      console.error('updateExam error:', err);
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // DELETE /api/exams/:id
  async deleteExam(req, res) {
    try {
      const { id } = req.params;
      await dbService.deleteExam(id);
      res.json({ success: true, message: 'Exam deleted successfully' });
    } catch (err) {
      console.error('deleteExam error:', err);
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // POST /api/exams/:id/questions
  async addQuestion(req, res) {
    try {
      const { id } = req.params;
      const questionData = { ...req.body, exam_id: id };
      const created = await dbService.createQuestion(questionData);
      res.status(201).json({ success: true, data: created, message: 'Question added' });
    } catch (err) {
      console.error('addQuestion error:', err);
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // DELETE /api/questions/:id
  async deleteQuestion(req, res) {
    try {
      const { id } = req.params;
      await dbService.deleteQuestion(id);
      res.json({ success: true, message: 'Question deleted' });
    } catch (err) {
      console.error('deleteQuestion error:', err);
      res.status(500).json({ success: false, message: err.message });
    }
  },
};
