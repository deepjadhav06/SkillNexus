import React, { useState, useEffect } from 'react';
import { QuizQuestion, Certificate as CertificateType } from '../types';
import { Certificate } from './Certificate';
import { mockService } from '../services/mockService';

interface QuizProps {
  skillId: string;
  skillName: string;
  userId: string;
  onComplete?: () => void;
  onClose?: () => void;
}

export const Quiz: React.FC<QuizProps> = ({ skillId, skillName, userId, onComplete, onClose }) => {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [certificate, setCertificate] = useState<CertificateType | null>(null);

  useEffect(() => {
    const loadQuiz = async () => {
      try {
        const quiz = await mockService.getSkillQuiz(skillId);
        setQuestions(quiz);
        setAnswers(new Array(quiz.length).fill(-1));
        setLoading(false);
      } catch (error) {
        console.error('Failed to load quiz:', error);
        setLoading(false);
      }
    };
    loadQuiz();
  }, [skillId]);

  const handleAnswerSelect = (optionIndex: number) => {
    if (!submitted) {
      const newAnswers = [...answers];
      newAnswers[currentQuestion] = optionIndex;
      setAnswers(newAnswers);
    }
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      const submitResult = await mockService.submitQuiz(userId, skillId, answers);
      setResult(submitResult);
      setSubmitted(true);
      
      if (submitResult.passed && submitResult.certificate) {
        setCertificate(submitResult.certificate);
      }
    } catch (error) {
      console.error('Failed to submit quiz:', error);
      setResult({
        passed: false,
        message: 'Failed to submit quiz. Please try again.'
      });
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-center mt-4 text-gray-600">Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (certificate) {
    return <Certificate certificate={certificate} onClose={onClose} />;
  }

  if (questions.length === 0) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md">
          <p className="text-gray-700 mb-4">No quiz available for this skill yet.</p>
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  const question = questions[currentQuestion];
  const answered = answers[currentQuestion] !== -1;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
        {submitted ? (
          <div className="p-8">
            <div className={`text-center mb-6 ${result.passed ? 'text-green-600' : 'text-red-600'}`}>
              {result.passed ? (
                <>
                  <div className="text-6xl mb-4">✓</div>
                  <h2 className="text-2xl font-bold mb-2">Congratulations!</h2>
                  <p className="text-lg mb-4">You passed with {result.score}%</p>
                  <p className="text-gray-600">Your certificate is being generated...</p>
                </>
              ) : (
                <>
                  <div className="text-6xl mb-4">✗</div>
                  <h2 className="text-2xl font-bold mb-2">Need More Practice</h2>
                  <p className="text-lg mb-4">Your score: {result.score}%</p>
                  <p className="text-gray-600">{result.message}</p>
                </>
              )}
            </div>

            <div className="text-center">
              <button
                onClick={onClose}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {result.passed ? 'View Certificate' : 'Try Again'}
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
              <h2 className="text-2xl font-bold mb-2">{skillName} Quiz</h2>
              <div className="flex justify-between items-center text-sm">
                <span>Question {currentQuestion + 1} of {questions.length}</span>
                <div className="w-32 bg-white/20 rounded-full h-2">
                  <div
                    className="bg-white h-2 rounded-full transition-all duration-300"
                    style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">{question.question}</h3>

              <div className="space-y-3 mb-8">
                {question.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(index)}
                    className={`w-full p-4 text-left rounded-lg border-2 transition ${
                      answers[currentQuestion] === index
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          answers[currentQuestion] === index
                            ? 'border-blue-600 bg-blue-600'
                            : 'border-gray-300'
                        }`}
                      >
                        {answers[currentQuestion] === index && (
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        )}
                      </div>
                      <span className="text-gray-700">{option}</span>
                    </div>
                  </button>
                ))}
              </div>

              {/* Question Navigator */}
              <div className="flex flex-wrap gap-2 mb-6">
                {questions.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentQuestion(index)}
                    className={`w-10 h-10 rounded-lg font-semibold transition ${
                      index === currentQuestion
                        ? 'bg-blue-600 text-white'
                        : answers[index] !== -1
                        ? 'bg-green-100 text-green-700 border border-green-300'
                        : 'bg-gray-100 text-gray-600 border border-gray-300'
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-between items-center p-6 border-t bg-gray-50">
              <button
                onClick={handlePrevious}
                disabled={currentQuestion === 0}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>

              {currentQuestion === questions.length - 1 ? (
                <button
                  onClick={handleSubmit}
                  disabled={answers.includes(-1)}
                  className="px-8 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                >
                  Submit Quiz
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Next
                </button>
              )}

              <button
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100"
              >
                Exit
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
