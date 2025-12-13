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
import { getAllKuis, getJawabanBySiswa, getSoalBuKuis, jawabSoalKuis } from '@/api/kuis';
import { Quiz, Question } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import {
  ClipboardList,
  Clock,
  CheckCircle2,
  Play,
  Trophy,
  ArrowRight,
  ArrowLeft,
  BookOpen
} from 'lucide-react';

interface ApiQuiz {
  id: number;
  id_guru: number;
  id_matapelajaran: number;
  judul_kuis: string;
  created_at: string;
  updated_at: string;
}

interface ApiQuestion {
  id: number;
  id_kuis: number;
  pertanyaan: string;
  opsi_a: string;
  opsi_b: string;
  opsi_c: string;
  opsi_d: string;
  jawaban_benar: string;
  skor_soal: number;
}

interface JawabanSiswa {
  id: number;
  id_soal: number;
  id_siswa: number;
  jawaban_siswa: string;
  apakah_benar: string;
  skor_jawaban: number;
  created_at: string;
  updated_at: string;
}

interface CompletedQuizResult {
  quizId: number;
  totalSkor: number;
  jawaban: JawabanSiswa[];
  questions: ApiQuestion[];
}

const StudentQuizzes: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [quizzes, setQuizzes] = useState<ApiQuiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [completedQuizzes, setCompletedQuizzes] = useState<Map<number, CompletedQuizResult>>(new Map());
  const [viewingResult, setViewingResult] = useState<CompletedQuizResult | null>(null);

  const [activeQuiz, setActiveQuiz] = useState<ApiQuiz | null>(null);
  const [activeQuestions, setActiveQuestions] = useState<ApiQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });

  useEffect(() => {
    loadKuis();
  }, []);
  const loadKuis = async () => {
    setLoading(true);
    try {
      const response = await getAllKuis();
      if (response?.data) {
        setQuizzes(response.data);
        await loadAnswer(response.data);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Gagal memuat daftar kuis',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadAnswer = async (quizList: ApiQuiz[]) => {
    if (!user?.id) return;
    
    try {
      const response = await getJawabanBySiswa(user.id);
      if (response?.jawaban && response.jawaban.length > 0) {
        // Group answers by quiz
        const jawabanMap = new Map<number, JawabanSiswa[]>();
        const soalIdSet = new Set<number>();
        
        response.jawaban.forEach((jawaban: JawabanSiswa) => {
          soalIdSet.add(jawaban.id_soal);
        });
        
        // For each quiz, check if it has answered questions
        const completedMap = new Map<number, CompletedQuizResult>();
        
        for (const quiz of quizList) {
          try {
            const soalResponse = await getSoalBuKuis(quiz.id.toString());
            if (soalResponse?.data) {
              const quizSoalIds = soalResponse.data.map((s: ApiQuestion) => s.id);
              const quizJawaban = response.jawaban.filter((j: JawabanSiswa) => 
                quizSoalIds.includes(j.id_soal)
              );
              
              if (quizJawaban.length > 0) {
                const totalSkor = quizJawaban.reduce((acc: number, j: JawabanSiswa) => acc + j.skor_jawaban, 0);
                completedMap.set(quiz.id, {
                  quizId: quiz.id,
                  totalSkor,
                  jawaban: quizJawaban,
                  questions: soalResponse.data
                });
              }
            }
          } catch (e) {
            console.error('Error loading quiz questions:', e);
          }
        }
        
        setCompletedQuizzes(completedMap);
      }
    } catch (error) {
      console.error('Error loading answers:', error);
    }
  };

  const startQuiz = async (quiz: ApiQuiz) => {
    try {
      setLoadingQuestions(true);
      const response = await getSoalBuKuis(quiz.id.toString());
      if (response?.data && response.data.length > 0) {
        setActiveQuiz(quiz);
        setActiveQuestions(response.data);
        setCurrentQuestionIndex(0);
        setAnswers({});
        setShowResults(false);
        setScore({ correct: 0, total: 0 });
      } else {
        toast({
          title: 'Kuis belum memiliki soal',
          description: 'Kuis ini belum memiliki soal yang bisa dikerjakan.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Gagal memuat soal kuis',
        variant: 'destructive',
      });
    } finally {
      setLoadingQuestions(false);
    }
  };

  const viewResult = (quiz: ApiQuiz) => {
    const result = completedQuizzes.get(quiz.id);
    if (result) {
      setViewingResult(result);
      setActiveQuiz(quiz);
    }
  };

  const handleAnswer = (questionId: number, answer: string) => {
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

    try {
      setSubmitting(true);

      // Submit each answer to the API
      for (const question of activeQuestions) {
        const jawaban = answers[question.id]; // "A" / "B" / "C" / "D"
        // const jawabanTeks = getOptionByKey(question, pilihanHuruf); // teks asli
        // console.log(question, pilihanHuruf);
        // console.log(pilihanHuruf);

        await jawabSoalKuis({
          id_soal: question.id,
          id_siswa: parseInt(user.id),
          jawaban_siswa: jawaban
        });
      }

      // Calculate score locally for display
      let correctCount = 0;
      activeQuestions.forEach(question => {
        const userAnswer = answers[question.id];
        if (userAnswer === question.jawaban_benar) {
          correctCount++;
        }
      });

      setScore({ correct: correctCount, total: activeQuestions.length });
      setShowResults(true);
      loadKuis();

      toast({
        title: 'Kuis selesai!',
        description: `Jawaban Anda telah dikirim.`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Gagal mengirim jawaban',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const closeQuiz = () => {
    setActiveQuiz(null);
    setActiveQuestions([]);
    setShowResults(false);
    setScore({ correct: 0, total: 0 });
    setViewingResult(null);
  };

  const currentQuestion = activeQuestions[currentQuestionIndex];

  const getOptionByKey = (question: ApiQuestion, key: string) => {
    switch (key) {
      case 'A': return question.opsi_a;
      case 'B': return question.opsi_b;
      case 'C': return question.opsi_c;
      case 'D': return question.opsi_d;
      default: return '';
    }
  };

  const answeredCount = Object.keys(answers).length;
  const allAnswered = answeredCount === activeQuestions.length;

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Kuis</h1>
          <p className="text-muted-foreground mt-1">Daftar kuis yang tersedia</p>
        </div>

        {/* Quizzes Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quizzes.map((quiz) => {
            const isCompleted = completedQuizzes.has(quiz.id);
            const result = completedQuizzes.get(quiz.id);
            
            return (
              <Card key={quiz.id} className="glass glass-hover">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{quiz.judul_kuis}</CardTitle>
                    {isCompleted && (
                      <Badge variant="secondary" className="bg-green-500/20 text-green-600">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Selesai
                      </Badge>
                    )}
                  </div>
                  <CardDescription className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    Mata Pelajaran ID: {quiz.id_matapelajaran}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {new Date(quiz.created_at).toLocaleDateString('id-ID')}
                      </span>
                      {isCompleted && result && (
                        <span className="flex items-center gap-1 text-primary font-medium">
                          <Trophy className="h-4 w-4" />
                          Skor: {result.totalSkor}
                        </span>
                      )}
                    </div>
                    {isCompleted ? (
                      <Button
                        className="w-full"
                        variant="outline"
                        onClick={() => viewResult(quiz)}
                        disabled={loadingQuestions}
                      >
                        {loadingQuestions ? (
                          <LoadingSpinner size="sm" />
                        ) : (
                          <>
                            <Trophy className="h-4 w-4 mr-2" />
                            Lihat Hasil
                          </>
                        )}
                      </Button>
                    ) : (
                      <Button
                        className="w-full"
                        onClick={() => startQuiz(quiz)}
                        disabled={loadingQuestions}
                      >
                        {loadingQuestions ? (
                          <LoadingSpinner size="sm" />
                        ) : (
                          <>
                            <Play className="h-4 w-4 mr-2" />
                            Mulai Kuis
                          </>
                        )}
                      </Button>
                    )}
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
        <Dialog open={!!activeQuiz} onOpenChange={() => !showResults && !submitting && !viewingResult && closeQuiz()}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* View Result Mode */}
            {viewingResult && activeQuiz && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Trophy className="h-6 w-6 text-accent" />
                    Hasil: {activeQuiz.judul_kuis}
                  </DialogTitle>
                  <DialogDescription>
                    Total Skor: <span className="font-bold text-primary">{viewingResult.totalSkor}</span>
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                  {viewingResult.questions.map((question, index) => {
                    const jawaban = viewingResult.jawaban.find(j => j.id_soal === question.id);
                    const isCorrect = jawaban?.apakah_benar === 'benar';
                    
                    return (
                      <div 
                        key={question.id} 
                        className={`p-4 rounded-lg border ${
                          isCorrect 
                            ? 'border-green-500/50 bg-green-500/10' 
                            : 'border-red-500/50 bg-red-500/10'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <p className="font-medium">
                            {index + 1}. {question.pertanyaan}
                          </p>
                          <Badge variant={isCorrect ? 'default' : 'destructive'} className={isCorrect ? 'bg-green-500' : ''}>
                            {jawaban?.skor_jawaban || 0} poin
                          </Badge>
                        </div>
                        
                        <div className="space-y-1 text-sm">
                          <p className="text-muted-foreground">
                            Jawaban Anda: <span className={isCorrect ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                              {jawaban?.jawaban_siswa || '-'}
                            </span>
                            {isCorrect ? (
                              <CheckCircle2 className="h-4 w-4 inline ml-2 text-green-500" />
                            ) : (
                              <span className="ml-2 text-red-500">✕</span>
                            )}
                          </p>
                          {!isCorrect && (
                            <p className="text-muted-foreground">
                              Jawaban Benar: <span className="text-green-600 font-medium">{question.jawaban_benar}</span>
                            </p>
                          )}
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

            {/* Take Quiz Mode */}
            {!showResults && !viewingResult && activeQuiz && currentQuestion && (
              <>
                <DialogHeader>
                  <DialogTitle>{activeQuiz.judul_kuis}</DialogTitle>
                  <DialogDescription>
                    Soal {currentQuestionIndex + 1} dari {activeQuestions.length} |
                    Dijawab: {answeredCount}/{activeQuestions.length}
                  </DialogDescription>
                </DialogHeader>

                <Progress
                  value={(currentQuestionIndex + 1) / activeQuestions.length * 100}
                  className="h-2"
                />

                <div className="py-6">
                  <p className="text-lg font-medium mb-4">{currentQuestion.pertanyaan}</p>
                  <Badge variant="outline" className="mb-4">
                    {currentQuestion.skor_soal} poin
                  </Badge>

                  <RadioGroup
                    value={answers[currentQuestion.id] || ''}
                    onValueChange={(value) => handleAnswer(currentQuestion.id, value)}
                    className="space-y-3"
                  >
                    {([
                      { key: 'A', value: currentQuestion.opsi_a },
                      { key: 'B', value: currentQuestion.opsi_b },
                      { key: 'C', value: currentQuestion.opsi_c },
                      { key: 'D', value: currentQuestion.opsi_d },
                    ]).map((option) => (
                      <div key={option.key} className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                        <RadioGroupItem value={option.value} id={`option-${option.key}`} />
                        <Label htmlFor={`option-${option.key}`} className="cursor-pointer flex-1">
                          {option.key}. {option.value}
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

                  <div className="flex gap-2">
                    {currentQuestionIndex === activeQuestions.length - 1 ? (
                      <Button
                        onClick={submitQuiz}
                        disabled={!allAnswered || submitting}
                      >
                        {submitting ? (
                          <LoadingSpinner size="sm" />
                        ) : (
                          <>
                            Submit
                            <CheckCircle2 className="h-4 w-4 ml-2" />
                          </>
                        )}
                      </Button>
                    ) : (
                      <Button onClick={nextQuestion}>
                        Selanjutnya
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    )}
                  </div>
                </div>

                {!allAnswered && currentQuestionIndex === activeQuestions.length - 1 && (
                  <p className="text-sm text-muted-foreground text-center mt-2">
                    Jawab semua soal terlebih dahulu untuk submit
                  </p>
                )}
              </>
            )}

            {showResults && activeQuiz && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Trophy className="h-6 w-6 text-accent" />
                    Kuis Selesai!
                  </DialogTitle>
                </DialogHeader>

                <div className="py-6 text-center">
                  <div className={`text-6xl font-bold mb-2 ${(score.correct / score.total * 100) >= 70 ? 'text-success' :
                    (score.correct / score.total * 100) >= 50 ? 'text-accent' :
                      'text-destructive'
                    }`}>
                    {Math.round(score.correct / score.total * 100)}%
                  </div>
                  <p className="text-muted-foreground">
                    Jawaban benar: {score.correct} dari {score.total} soal
                  </p>
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
