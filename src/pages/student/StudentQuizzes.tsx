import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
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
  ArrowLeft,
  BookOpen
} from 'lucide-react';

const StudentQuizzes: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [activeQuestions, setActiveQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [lastAttempt, setLastAttempt] = useState<QuizAttempt | null>(null);

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;
      const [allQuizzes, allQuestions, userAttempts] = await Promise.all([
        getAllItems<Quiz>('quizzes'),
        getAllItems<Question>('questions'),
        getItemsByIndex<QuizAttempt>('quizAttempts', 'studentId', user.id),
      ]);
      setQuizzes(allQuizzes.filter(q => q.isPublished));
      setQuestions(allQuestions);
      setAttempts(userAttempts);
    };
    loadData();
  }, [user]);

  const getQuestionsForQuiz = (quizId: string) => {
    return questions.filter(q => q.id_kuis === quizId);
  };

  const getAttemptForQuiz = (quizId: string) => {
    return attempts.find(a => a.quizId === quizId);
  };

  const startQuiz = (quiz: Quiz) => {
    const quizQuestions = getQuestionsForQuiz(quiz.id);
    if (quizQuestions.length === 0) {
      toast({
        title: 'Kuis belum memiliki soal',
        description: 'Kuis ini belum memiliki soal yang bisa dikerjakan.',
        variant: 'destructive',
      });
      return;
    }
    setActiveQuiz(quiz);
    setActiveQuestions(quizQuestions);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setShowResults(false);
    setLastAttempt(null);
  };

  const handleAnswer = (questionId: string, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < activeQuestions.length - 1) {
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

    activeQuestions.forEach(question => {
      totalPoints += question.skor;
      const userAnswer = answers[question.id];
      
      if (userAnswer === question.jawaban_benar) {
        score += question.skor;
      }
    });

    const percentage = totalPoints > 0 ? Math.round((score / totalPoints) * 100) : 0;

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
      title: 'Kuis selesai!',
      description: `Skor Anda: ${percentage}%`,
    });
  };

  const closeQuiz = () => {
    setActiveQuiz(null);
    setActiveQuestions([]);
    setShowResults(false);
    setLastAttempt(null);
  };

  const currentQuestion = activeQuestions[currentQuestionIndex];

  const getOptionByKey = (question: Question, key: string) => {
    switch (key) {
      case 'A': return question.opsi_a;
      case 'B': return question.opsi_b;
      case 'C': return question.opsi_c;
      case 'D': return question.opsi_d;
      default: return '';
    }
  };

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
            const quizQuestions = getQuestionsForQuiz(quiz.id);
            
            return (
              <Card key={quiz.id} className="glass glass-hover">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <Badge variant="secondary">
                      {quizQuestions.length} Soal
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
                  <CardTitle className="text-lg mt-2">{quiz.judul_kuis}</CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    {quiz.subjectName}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {quiz.timeLimit || 15} menit
                      </span>
                      <span>oleh {quiz.teacherName}</span>
                    </div>
                    <Button
                      className="w-full"
                      onClick={() => startQuiz(quiz)}
                      disabled={quizQuestions.length === 0}
                    >
                      {attempt ? (
                        <>
                          <Trophy className="h-4 w-4 mr-2" />
                          Kerjakan Ulang
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4 mr-2" />
                          Mulai Kuis
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
            <h3 className="text-lg font-medium text-foreground">Tidak ada kuis tersedia</h3>
            <p className="text-muted-foreground mt-1">
              Periksa kembali nanti untuk kuis baru
            </p>
          </div>
        )}

        {/* Quiz Dialog */}
        <Dialog open={!!activeQuiz} onOpenChange={() => !showResults && closeQuiz()}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            {!showResults && activeQuiz && currentQuestion && (
              <>
                <DialogHeader>
                  <DialogTitle>{activeQuiz.judul_kuis}</DialogTitle>
                  <DialogDescription>
                    Soal {currentQuestionIndex + 1} dari {activeQuestions.length}
                  </DialogDescription>
                </DialogHeader>
                
                <Progress 
                  value={(currentQuestionIndex + 1) / activeQuestions.length * 100} 
                  className="h-2"
                />

                <div className="py-6">
                  <p className="text-lg font-medium mb-4">{currentQuestion.pertanyaan}</p>
                  <Badge variant="outline" className="mb-4">
                    {currentQuestion.skor} poin
                  </Badge>

                  <RadioGroup
                    value={answers[currentQuestion.id] || ''}
                    onValueChange={(value) => handleAnswer(currentQuestion.id, value)}
                    className="space-y-3"
                  >
                    {(['A', 'B', 'C', 'D'] as const).map((key) => (
                      <div key={key} className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                        <RadioGroupItem value={key} id={`option-${key}`} />
                        <Label htmlFor={`option-${key}`} className="cursor-pointer flex-1">
                          {key}. {getOptionByKey(currentQuestion, key)}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={prevQuestion}
                    disabled={currentQuestionIndex === 0}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Sebelumnya
                  </Button>
                  
                  {currentQuestionIndex === activeQuestions.length - 1 ? (
                    <Button onClick={submitQuiz}>
                      Selesai
                      <CheckCircle2 className="h-4 w-4 ml-2" />
                    </Button>
                  ) : (
                    <Button onClick={nextQuestion}>
                      Selanjutnya
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
                    Kuis Selesai!
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
                    Skor Anda {lastAttempt.score} dari {lastAttempt.totalPoints} poin
                  </p>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium">Review Jawaban:</h4>
                  {activeQuestions.map((q, idx) => {
                    const userAnswer = answers[q.id];
                    const isCorrect = userAnswer === q.jawaban_benar;
                    
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
                            <p className="text-sm font-medium">Q{idx + 1}: {q.pertanyaan}</p>
                            <p className="text-sm text-muted-foreground mt-1">
                              Jawaban Anda: {userAnswer ? `${userAnswer}. ${getOptionByKey(q, userAnswer)}` : '(tidak dijawab)'}
                            </p>
                            {!isCorrect && (
                              <p className="text-sm text-success mt-1">
                                Jawaban Benar: {q.jawaban_benar}. {getOptionByKey(q, q.jawaban_benar)}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <Button className="w-full mt-4" onClick={closeQuiz}>
                  Tutup
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
