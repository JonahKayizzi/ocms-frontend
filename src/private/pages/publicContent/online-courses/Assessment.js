'use client';

/* eslint-disable react/no-array-index-key */
import { useState } from 'react';
import {
  Plus, Search, Edit, Trash2, ClipboardList, HelpCircle, Calendar,
} from 'lucide-react';

const Quizzes = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState(null);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [quizzes, setQuizzes] = useState([
    {
      id: 1,
      quiz_title: 'ATC Basics Assessment',
      quiz_description: 'Test your understanding of basic air traffic control principles',
      lesson_id: 1,
      lesson_name: 'Introduction to Air Traffic Control',
      questions: 10,
      created: '2024-01-15',
    },
    {
      id: 2,
      quiz_title: 'Radio Communication Quiz',
      quiz_description: 'Assessment of radio communication procedures and phraseology',
      lesson_id: 2,
      lesson_name: 'Radio Communication Basics',
      questions: 8,
      created: '2024-01-16',
    },
  ]);
  const [questions, setQuestions] = useState([
    {
      id: 1,
      quiz_id: 1,
      question_text: 'What is the primary responsibility of an air traffic controller?',
      question_answers: [
        'Managing airport operations',
        'Ensuring safe separation of aircraft',
        'Weather forecasting',
        'Aircraft maintenance',
      ],
      correct_answer: 1,
      question_objectives: 'Understanding ATC responsibilities',
    },
    {
      id: 2,
      quiz_id: 1,
      question_text: 'Which frequency band is commonly used for air traffic control?',
      question_answers: [
        'HF (High Frequency)',
        'VHF (Very High Frequency)',
        'UHF (Ultra High Frequency)',
        'LF (Low Frequency)',
      ],
      correct_answer: 1,
      question_objectives: 'Knowledge of communication frequencies',
    },
  ]);
  const [lessons] = useState([
    { id: 1, lesson_title: 'Introduction to Air Traffic Control' },
    { id: 2, lesson_title: 'Radio Communication Basics' },
    { id: 3, lesson_title: 'GPS Fundamentals' },
  ]);
  const [formData, setFormData] = useState({
    quiz_title: '',
    quiz_description: '',
    lesson_id: '',
  });
  const [questionFormData, setQuestionFormData] = useState({
    question_text: '',
    question_answers: ['', '', '', ''],
    correct_answer: 0,
    question_objectives: '',
  });
  const filteredQuizzes = quizzes.filter(
    (quiz) => quiz.quiz_title.toLowerCase().includes(searchTerm.toLowerCase())
      || quiz.quiz_description.toLowerCase().includes(searchTerm.toLowerCase()),
  );
  const handleSubmit = (e) => {
    e.preventDefault();
    const selectedLesson = lessons.find((l) => l.id === Number.parseInt(formData.lesson_id, 10));
    if (editingQuiz) {
      setQuizzes(
        quizzes.map((quiz) => (quiz.id === editingQuiz.id
          ? {
            ...quiz,
            ...formData,
            lesson_id: Number.parseInt(formData.lesson_id, 10),
            lesson_name: selectedLesson?.lesson_title || '',
          }
          : quiz)),
      );
    } else {
      const newQuiz = {
        id: Date.now(),
        ...formData,
        lesson_id: Number.parseInt(formData.lesson_id, 10),
        lesson_name: selectedLesson?.lesson_title || '',
        questions: 0,
        created: new Date().toISOString().split('T')[0],
      };
      setQuizzes([...quizzes, newQuiz]);
    }
    setShowModal(false);
    setEditingQuiz(null);
    setFormData({ quiz_title: '', quiz_description: '', lesson_id: '' });
  };
  const handleQuestionSubmit = (e) => {
    e.preventDefault();
    const newQuestion = {
      id: Date.now(),
      quiz_id: selectedQuiz.id,
      ...questionFormData,
      correct_answer: Number.parseInt(questionFormData.correct_answer, 10),
    };
    setQuestions([...questions, newQuestion]);
    // Update quiz question count
    setQuizzes(quizzes.map((quiz) => (quiz.id === selectedQuiz.id
      ? { ...quiz, questions: quiz.questions + 1 } : quiz)));
    setShowQuestionModal(false);
    setQuestionFormData({
      question_text: '',
      question_answers: ['', '', '', ''],
      correct_answer: 0,
      question_objectives: '',
    });
  };
  const handleEdit = (quiz) => {
    setEditingQuiz(quiz);
    setFormData({
      quiz_title: quiz.quiz_title,
      quiz_description: quiz.quiz_description,
      lesson_id: quiz.lesson_id.toString(),
    });
    setShowModal(true);
  };
  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this quiz?')) {
      setQuizzes(quizzes.filter((quiz) => quiz.id !== id));
      setQuestions(questions.filter((q) => q.quiz_id !== id));
    }
  };
  // const getQuizQuestions = (quizId) => questions.filter((q) => q.quiz_id === quizId);
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-100">Quiz Management</h1>
        <button
          type="button"
          onClick={() => {
            setEditingQuiz(null); // Ensure no quiz is being edited when adding new
            setFormData({ quiz_title: '', quiz_description: '', lesson_id: '' }); // Reset form data
            setShowModal(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Add Quiz</span>
        </button>
      </div>
      {/* Search */}
      <div className="bg-gray-800 rounded-lg shadow p-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search quizzes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-700 bg-gray-700 text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
      {/* Quizzes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredQuizzes.map((quiz) => (
          <div
            key={quiz.id}
            className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 hover:shadow-xl transition-shadow"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <ClipboardList className="h-8 w-8 text-blue-400" />
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => handleEdit(quiz)}
                    className="p-2 text-gray-400 hover:text-indigo-400 hover:bg-indigo-900/30 rounded-lg transition-all duration-200 group/btn"
                  >
                    <Edit className="h-4 w-4 group-hover/btn:scale-110 transition-transform" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(quiz.id)}
                    className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-900/30 rounded-lg transition-all duration-200 group/btn"
                  >
                    <Trash2 className="h-4 w-4 group-hover/btn:scale-110 transition-transform" />
                  </button>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-100 mb-2">{quiz.quiz_title}</h3>
              <p className="text-sm text-gray-300 mb-4">{quiz.quiz_description}</p>
              <div className="space-y-2 text-sm text-gray-400">
                <div className="flex items-center">
                  <ClipboardList className="h-4 w-4 mr-2 text-gray-500" />
                  Lesson:
                  {' '}
                  {quiz.lesson_name}
                </div>
                <div className="flex items-center">
                  <HelpCircle className="h-4 w-4 mr-2 text-gray-500" />
                  Questions:
                  {' '}
                  {quiz.questions}
                </div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                  Created:
                  {' '}
                  {new Date(quiz.created).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-700">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedQuiz(quiz);
                    setShowQuestionModal(true);
                  }}
                  className="w-full bg-blue-900/30 text-blue-400 px-4 py-2 rounded-lg hover:bg-blue-900/50 flex items-center justify-center space-x-2 transition-colors"
                >
                  <HelpCircle className="h-4 w-4" />
                  <span>Add Question</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* Quiz Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-gray-800 text-gray-100 rounded-lg p-6 w-full max-w-md shadow-xl">
            <h2 className="text-lg font-semibold mb-4 text-gray-100">{editingQuiz ? 'Edit Quiz' : 'Add New Quiz'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <span htmlFor="quiz_title" className="block text-sm font-medium text-gray-300 mb-1">Quiz Title</span>
                <input
                  id="quiz_title"
                  type="text"
                  value={formData.quiz_title}
                  onChange={(e) => setFormData({ ...formData, quiz_title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-700 bg-gray-700 text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <span className="block text-sm font-medium text-gray-300 mb-1">Description</span>
                <textarea
                  value={formData.quiz_description}
                  onChange={(e) => setFormData({ ...formData, quiz_description: e.target.value })}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-700 bg-gray-700 text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <span className="block text-sm font-medium text-gray-300 mb-1">Lesson</span>
                <select
                  value={formData.lesson_id}
                  onChange={(e) => setFormData({ ...formData, lesson_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-700 bg-gray-700 text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select a lesson</option>
                  {lessons.map((lesson) => (
                    <option key={lesson.id} value={lesson.id}>
                      {lesson.lesson_title}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingQuiz(null);
                    setFormData({ quiz_title: '', quiz_description: '', lesson_id: '' });
                  }}
                  className="px-4 py-2 text-gray-300 border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingQuiz ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Question Modal */}
      {showQuestionModal && selectedQuiz && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-gray-800 text-gray-100 rounded-lg p-6 w-full max-w-2xl shadow-xl">
            <h2 className="text-lg font-semibold mb-4 text-gray-100">
              Add Question to &quot;
              {selectedQuiz.quiz_title}
              &quot;
            </h2>
            <form onSubmit={handleQuestionSubmit} className="space-y-4">
              <div>
                <span className="block text-sm font-medium text-gray-300 mb-1">Question Text</span>
                <textarea
                  value={questionFormData.question_text}
                  onChange={(e) => setQuestionFormData(
                    {
                      ...questionFormData,
                      question_text: e.target.value,
                    },
                  )}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-700 bg-gray-700 text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <span className="block text-sm font-medium text-gray-300 mb-2">Answer Options</span>
                {questionFormData.question_answers.map((answer, index) => (
                  <div key={index} className="flex items-center space-x-3 mb-2">
                    <input
                      type="radio"
                      name="correct_answer"
                      value={index}
                      checked={questionFormData.correct_answer === index}
                      onChange={(e) => setQuestionFormData({
                        ...questionFormData,
                        correct_answer: Number.parseInt(e.target.value, 10),
                      })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-600 rounded bg-gray-700"
                    />
                    <input
                      type="text"
                      value={answer}
                      onChange={(e) => {
                        const newAnswers = [...questionFormData.question_answers];
                        newAnswers[index] = e.target.value;
                        setQuestionFormData({ ...questionFormData, question_answers: newAnswers });
                      }}
                      placeholder={`Option ${index + 1}`}
                      className="flex-1 px-3 py-2 border border-gray-700 bg-gray-700 text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                ))}
                <p className="text-xs text-gray-400 mt-1">Select the radio button next to the correct answer</p>
              </div>
              <div>
                <span className="block text-sm font-medium text-gray-300 mb-1">Learning Objectives</span>
                <input
                  type="text"
                  value={questionFormData.question_objectives}
                  onChange={(e) => setQuestionFormData(
                    { ...questionFormData, question_objectives: e.target.value },
                  )}
                  className="w-full px-3 py-2 border border-gray-700 bg-gray-700 text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="What does this question test?"
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowQuestionModal(false);
                    setSelectedQuiz(null);
                    setQuestionFormData({
                      question_text: '',
                      question_answers: ['', '', '', ''],
                      correct_answer: 0,
                      question_objectives: '',
                    });
                  }}
                  className="px-4 py-2 text-gray-300 border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add Question
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default Quizzes;
