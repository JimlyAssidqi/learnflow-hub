import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { getAllItems, getItemsByIndex, addItem } from '@/lib/db';
import { Quiz, QuizAttempt, Question } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { 
  ClipboardList, 
  Clock, 
  CheckCircle2, 
  XCircle,
  Play,
  Trophy,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';

const StudentQuizzes: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [lastAttempt, setLastAttempt] = useState<QuizAttempt | null>(null);

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;
      const [allQuizzes, userAttempts] = await Promise.all([
        getAllItems<Quiz>('quizzes'),
        getItemsByIndex<QuizAttempt>('quizAttempts', 'studentId', user.id),
      ]);
      setQuizzes(allQuizzes.filter(q => q.isPublished));
      setAttempts(userAttempts);
    };
    loadData();
  }, [user]);

  const getAttemptForQuiz = (quizId: string) => {
    return attempts.find(a => a.quizId === quizId);
  };

  const startQuiz = (quiz: Quiz) => {
    setActiveQuiz(quiz);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setShowResults(false);
    setLastAttempt(null);
  };

  const handleAnswer = (questionId: string, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const nextQuestion = () => {
    if (activeQuiz && currentQuestionIndex < activeQuiz.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const prevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const submitQuiz = async () => {
    if (!activeQuiz || !user) return;

    let score = 0;
    let totalPoints = 0;

    activeQuiz.questions.forEach(question => {
      totalPoints += question.points;
      const userAnswer = answers[question.id]?.trim().toLowerCase();
      const correctAnswer = question.correctAnswer.trim().toLowerCase();
      
      if (userAnswer === correctAnswer) {
        score += question.points;
      }
    });

    const percentage = Math.round((score / totalPoints) * 100);

    const attempt: QuizAttempt = {
      id: `attempt-${Date.now()}`,
      quizId: activeQuiz.id,
      studentId: user.id,
      studentName: user.name,
      answers: Object.entries(answers).map(([questionId, answer]) => ({
        questionId,
        answer,
      })),
      score,
      totalPoints,
      percentage,
      submittedAt: new Date().toISOString(),
    };

    await addItem('quizAttempts', attempt);
    setAttempts(prev => [...prev, attempt]);
    setLastAttempt(attempt);
    setShowResults(true);

    toast({
      title: 'Quiz submitted!',
      description: `You scored ${percentage}%`,
    });
  };

  const closeQuiz = () => {
    setActiveQuiz(null);
    setShowResults(false);
    setLastAttempt(null);
  };

  const currentQuestion = activeQuiz?.questions[currentQuestionIndex];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Kuis</h1>
        </div>

        {/* Quizzes Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quizzes.map((quiz) => {
            const attempt = getAttemptForQuiz(quiz.id);
            
            return (
              <Card key={quiz.id} className="glass glass-hover">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <Badge variant="secondary">
                      {quiz.questions.length} Questions
                    </Badge>
                    {attempt && (
                      <Badge className={`${
                        attempt.percentage >= 70 ? 'bg-success text-success-foreground' :
                        attempt.percentage >= 50 ? 'bg-accent text-accent-foreground' :
                        'bg-destructive text-destructive-foreground'
                      }`}>
                        {attempt.percentage}%
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-lg mt-2">{quiz.title}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {quiz.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {quiz.timeLimit || 15} min
                      </span>
                      <span>by {quiz.teacherName}</span>
                    </div>
                    <Button
                      className="w-full"
                      onClick={() => startQuiz(quiz)}
                    >
                      {attempt ? (
                        <>
                          <Trophy className="h-4 w-4 mr-2" />
                          Retake Quiz
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4 mr-2" />
                          Start Quiz
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {quizzes.length === 0 && (
          <div className="text-center py-12">
            <ClipboardList className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground">No quizzes available</h3>
            <p className="text-muted-foreground mt-1">
              Check back later for new quizzes
            </p>
          </div>
        )}

        {/* Quiz Dialog */}
        <Dialog open={!!activeQuiz} onOpenChange={() => !showResults && closeQuiz()}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            {!showResults && activeQuiz && currentQuestion && (
              <>
                <DialogHeader>
                  <DialogTitle>{activeQuiz.title}</DialogTitle>
                  <DialogDescription>
                    Question {currentQuestionIndex + 1} of {activeQuiz.questions.length}
                  </DialogDescription>
                </DialogHeader>
                
                <Progress 
                  value={(currentQuestionIndex + 1) / activeQuiz.questions.length * 100} 
                  className="h-2"
                />

                <div className="py-6">
                  <p className="text-lg font-medium mb-4">{currentQuestion.text}</p>
                  <Badge variant="outline" className="mb-4">
                    {currentQuestion.points} points
                  </Badge>

                  {currentQuestion.type === 'multiple-choice' ? (
                    <RadioGroup
                      value={answers[currentQuestion.id] || ''}
                      onValueChange={(value) => handleAnswer(currentQuestion.id, value)}
                      className="space-y-3"
                    >
                      {currentQuestion.options?.map((option, idx) => (
                        <div key={idx} className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                          <RadioGroupItem value={option} id={`option-${idx}`} />
                          <Label htmlFor={`option-${idx}`} className="cursor-pointer flex-1">
                            {option}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  ) : (
                    <Input
                      placeholder="Type your answer..."
                      value={answers[currentQuestion.id] || ''}
                      onChange={(e) => handleAnswer(currentQuestion.id, e.target.value)}
                      className="mt-2"
                    />
                  )}
                </div>

                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={prevQuestion}
                    disabled={currentQuestionIndex === 0}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Previous
                  </Button>
                  
                  {currentQuestionIndex === activeQuiz.questions.length - 1 ? (
                    <Button onClick={submitQuiz}>
                      Submit Quiz
                      <CheckCircle2 className="h-4 w-4 ml-2" />
                    </Button>
                  ) : (
                    <Button onClick={nextQuestion}>
                      Next
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  )}
                </div>
              </>
            )}

            {showResults && lastAttempt && activeQuiz && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Trophy className="h-6 w-6 text-accent" />
                    Quiz Complete!
                  </DialogTitle>
                </DialogHeader>

                <div className="py-6 text-center">
                  <div className={`text-6xl font-bold mb-2 ${
                    lastAttempt.percentage >= 70 ? 'text-success' :
                    lastAttempt.percentage >= 50 ? 'text-accent' :
                    'text-destructive'
                  }`}>
                    {lastAttempt.percentage}%
                  </div>
                  <p className="text-muted-foreground">
                    You scored {lastAttempt.score} out of {lastAttempt.totalPoints} points
                  </p>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium">Review Answers:</h4>
                  {activeQuiz.questions.map((q, idx) => {
                    const userAnswer = answers[q.id]?.trim().toLowerCase();
                    const isCorrect = userAnswer === q.correctAnswer.trim().toLowerCase();
                    
                    return (
                      <div key={q.id} className={`p-3 rounded-lg border ${
                        isCorrect ? 'border-success bg-success/5' : 'border-destructive bg-destructive/5'
                      }`}>
                        <div className="flex items-start gap-2">
                          {isCorrect ? (
                            <CheckCircle2 className="h-5 w-5 text-success shrink-0 mt-0.5" />
                          ) : (
                            <XCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                          )}
                          <div>
                            <p className="text-sm font-medium">Q{idx + 1}: {q.text}</p>
                            <p className="text-sm text-muted-foreground mt-1">
                              Your answer: {answers[q.id] || '(no answer)'}
                            </p>
                            {!isCorrect && (
                              <p className="text-sm text-success mt-1">
                                Correct: {q.correctAnswer}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <Button className="w-full mt-4" onClick={closeQuiz}>
                  Close
                </Button>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default StudentQuizzes;
