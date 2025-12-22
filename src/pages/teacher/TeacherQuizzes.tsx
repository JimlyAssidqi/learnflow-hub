import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getAllItems, addItem, updateItem, deleteItem, getItemsByIndex } from '@/lib/db';
import { Quiz, Question, Subject, KuisData } from '@/types';
import { useToast } from '@/hooks/use-toast';
import {
  ClipboardList,
  Plus,
  Trash2,
  Edit,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  BookOpen,
  Users
} from 'lucide-react';
import { getMateriByGuruApi } from '@/api/materi';
import { getMataPelajaranApi } from '@/api/mataPelajaran';
import { deleteKuisApi, deleteSoalkuis, getKuisByGuru, getSoalBuKuis, getSiswaDoneQuiz, getJawabanBySiswa, tambahKuisApi, tambahSoalKuisApi, ubahKuisApi, ubahSoalKuisApi } from '@/api/kuis';

interface StudentDone {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface JawabanSiswa {
  id: number;
  id_soal: number;
  id_siswa: number;
  jawaban_siswa: string;
  apakah_benar: string;
  skor_jawaban: number;
}

interface StudentResult {
  id_siswa: string;
  total_skor: number;
  jawaban: JawabanSiswa[];
}

const TeacherQuizzes: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isQuestionDialogOpen, setIsQuestionDialogOpen] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [showStudents, setShowStudents] = useState(false);
  const [studentsDone, setStudentsDone] = useState<StudentDone[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<StudentDone | null>(null);
  const [studentResult, setStudentResult] = useState<StudentResult | null>(null);
  const [loadingStudents, setLoadingStudents] = useState(false);

  const [formData, setFormData] = useState({
    id_matapelajaran: '',
    judul_kuis: '',
    timeLimit: 15,
    isPublished: false,
  });

  const [questionForm, setQuestionForm] = useState({
    pertanyaan: '',
    opsi_a: '',
    opsi_b: '',
    opsi_c: '',
    opsi_d: '',
    jawaban_benar: '' as string,
    skor: 10,
  });

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    const [userQuizzes, allSubjects] = await Promise.all([
      getKuisByGuru(user.id),
      getMataPelajaranApi()
    ]);
    setQuizzes(userQuizzes.data);
    setSubjects(allSubjects.data);
  };

  useEffect(() => {
    loadQuestions();
  }, [selectedQuiz]);
  
  const loadQuestions = async () => {
    if (!selectedQuiz) {
      setQuestions([]);
      return;
    }
    const response = await getSoalBuKuis(selectedQuiz.id!);
    setQuestions(response.data);
  };

  const resetForm = () => {
    setFormData({ id_matapelajaran: '', judul_kuis: '', timeLimit: 15, isPublished: false });
    setEditingQuiz(null);
  };

  const resetQuestionForm = () => {
    setQuestionForm({
      pertanyaan: '',
      opsi_a: '',
      opsi_b: '',
      opsi_c: '',
      opsi_d: '',
      jawaban_benar: 'A',
      skor: 10,
    });
    setEditingQuestion(null);
  };

  const handleSubmitQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!formData.id_matapelajaran || !formData.judul_kuis) {
      toast({
        title: 'Data tidak lengkap',
        description: 'Pilih mata pelajaran dan isi judul kuis.',
        variant: 'destructive',
      });
      return;
    }

    const subject = subjects.find(s => s.id === parseInt(formData.id_matapelajaran));

    const quizData: Quiz = {
      id: editingQuiz?.id || `quiz-${Date.now()}`,
      id_guru: user.id,
      id_matapelajaran: parseInt(formData.id_matapelajaran),
      judul_kuis: formData.judul_kuis,
      teacherName: user.name,
      subjectName: subject?.mata_pelajaran || '',
      timeLimit: formData.timeLimit,
      createdAt: editingQuiz?.createdAt || new Date().toISOString(),
      isPublished: formData.isPublished,
    };


    if (editingQuiz) {
      await ubahKuisApi(editingQuiz.id!, quizData);
    } else {
      await tambahKuisApi(quizData);
    }

    setIsDialogOpen(false);
    resetForm();
    loadData();

    toast({
      title: editingQuiz ? 'Kuis diperbarui!' : 'Kuis dibuat!',
      description: 'Klik kuis untuk menambahkan soal.',
    });
  };

  const handleSubmitQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedQuiz) return;

    if (!questionForm.pertanyaan || !questionForm.opsi_a || !questionForm.opsi_b ||
      !questionForm.opsi_c || !questionForm.opsi_d) {
      toast({
        title: 'Data tidak lengkap',
        description: 'Isi semua field pertanyaan dan opsi.',
        variant: 'destructive',
      });
      return;
    }

    const questionData: Question = {
      id_kuis: selectedQuiz.id,
      pertanyaan: questionForm.pertanyaan,
      opsi_a: questionForm.opsi_a,
      opsi_b: questionForm.opsi_b,
      opsi_c: questionForm.opsi_c,
      opsi_d: questionForm.opsi_d,
      jawaban_benar: questionForm.jawaban_benar,
      skor_soal: questionForm.skor,
    };

    if (editingQuestion) {
      await ubahSoalKuisApi(editingQuestion.id!, questionData);
      toast({
        title: 'Soal diperbarui!',
        description: `Soal berhasil diperbarui.`,
      });
    } else {
      await tambahSoalKuisApi(questionData);
      toast({
        title: 'Soal ditambahkan!',
        description: `Soal berhasil ditambahkan ke kuis "${selectedQuiz.judul_kuis}".`,
      });
    }
    
    loadQuestions();
    setIsQuestionDialogOpen(false);
    resetQuestionForm();
  };

  const handleEditQuestion = (question: Question) => {
    setEditingQuestion(question);
    setQuestionForm({
      pertanyaan: question.pertanyaan,
      opsi_a: question.opsi_a,
      opsi_b: question.opsi_b,
      opsi_c: question.opsi_c,
      opsi_d: question.opsi_d,
      jawaban_benar: question.jawaban_benar,
      skor: question.skor_soal,
    });
    setIsQuestionDialogOpen(true);
  };

  const handleEdit = (quiz: Quiz) => {
    setEditingQuiz(quiz);
    setFormData({
      id_matapelajaran: quiz.id_matapelajaran.toString(),
      judul_kuis: quiz.judul_kuis,
      timeLimit: quiz.timeLimit || 15,
      isPublished: quiz.isPublished,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (quizId: string) => {
    await deleteKuisApi(quizId);
    loadData();
    toast({
      title: 'Kuis dihapus',
      description: 'Kuis dan semua soalnya telah dihapus.',
    });
  };

  const handleDeleteQuestion = async (questionId: string) => {
    await deleteSoalkuis(questionId);
    loadQuestions();
    toast({
      title: 'Soal dihapus',
      description: 'Soal berhasil dihapus.',
    });
  };

  const togglePublish = async (quiz: Quiz) => {
    const updated = { ...quiz, isPublished: !quiz.isPublished };
    await updateItem('quizzes', updated);
    setQuizzes(prev => prev.map(q => q.id === quiz.id ? updated : q));
    toast({
      title: updated.isPublished ? 'Kuis dipublikasi!' : 'Kuis tidak dipublikasi',
      description: updated.isPublished ? 'Siswa sekarang bisa mengerjakan kuis ini.' : 'Kuis sekarang menjadi draft.',
    });
  };

  const loadStudentsDone = async () => {
    if (!selectedQuiz) return;
    setLoadingStudents(true);
    try {
      const response = await getSiswaDoneQuiz(selectedQuiz.id!);
      if (response?.students) {
        setStudentsDone(response.students);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Gagal memuat daftar siswa',
        variant: 'destructive',
      });
    } finally {
      setLoadingStudents(false);
    }
  };

  const loadStudentResult = async (studentId: number) => {
    try {
      const response = await getJawabanBySiswa(studentId.toString());
      if (response) {
        setStudentResult(response);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Gagal memuat hasil siswa',
        variant: 'destructive',
      });
    }
  };

  const handleViewStudents = async () => {
    setShowStudents(true);
    setSelectedStudent(null);
    setStudentResult(null);
    await loadStudentsDone();
  };

  const handleSelectStudent = async (student: StudentDone) => {
    setSelectedStudent(student);
    await loadStudentResult(student.id);
  };

  const getQuestionById = (id_soal: number) => {
    return questions.find(q => parseInt(q.id!) === id_soal);
  };

  // Student Result View
  if (selectedQuiz && showStudents && selectedStudent && studentResult) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => {
              setSelectedStudent(null);
              setStudentResult(null);
            }}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-foreground">Hasil: {selectedStudent.name}</h1>
              <p className="text-muted-foreground mt-1">{selectedStudent.email}</p>
            </div>
          </div>

          <Card className="glass">
            <CardHeader>
              <CardTitle className="text-2xl">Total Skor: {studentResult.total_skor}</CardTitle>
            </CardHeader>
          </Card>

          <div className="space-y-4">
            {studentResult.jawaban
              .filter(j => {
                const question = getQuestionById(j.id_soal);
                return question && question.id_kuis === selectedQuiz.id;
              })
              .map((jawaban, idx) => {
                const question = getQuestionById(jawaban.id_soal);
                const isCorrect = jawaban.apakah_benar === 'benar';

                return (
                  <Card key={jawaban.id} className={`glass border-2 ${isCorrect ? 'border-green-500/50' : 'border-red-500/50'}`}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <Badge variant="secondary" className="mb-2">Soal {idx + 1}</Badge>
                          <CardTitle className="text-lg">{question?.pertanyaan || 'Pertanyaan tidak ditemukan'}</CardTitle>
                        </div>
                        <div className="flex items-center gap-2">
                          {isCorrect ? (
                            <Badge className="bg-green-500">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Benar (+{jawaban.skor_jawaban})
                            </Badge>
                          ) : (
                            <Badge variant="destructive">
                              <XCircle className="h-3 w-3 mr-1" />
                              Salah
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="p-3 rounded-lg bg-muted">
                          <span className="font-medium">Jawaban Siswa:</span> {jawaban.jawaban_siswa}
                        </div>
                        {question && (
                          <div className="p-3 rounded-lg bg-green-500/20 border border-green-500">
                            <span className="font-medium">Jawaban Benar:</span> {question.jawaban_benar}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Students List View
  if (selectedQuiz && showStudents) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => setShowStudents(false)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-foreground">Siswa yang Mengerjakan</h1>
              <p className="text-muted-foreground mt-1">{selectedQuiz.judul_kuis}</p>
            </div>
          </div>

          {loadingStudents ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Memuat data...</p>
            </div>
          ) : studentsDone.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {studentsDone.map((student) => (
                <Card
                  key={student.id}
                  className="glass cursor-pointer hover:shadow-lg transition-all hover:scale-[1.02]"
                  onClick={() => handleSelectStudent(student)}
                >
                  <CardHeader>
                    <CardTitle className="text-lg">{student.name}</CardTitle>
                    <CardDescription>{student.email}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Badge variant="secondary">Lihat Jawaban</Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="glass">
              <CardContent className="py-12">
                <div className="text-center">
                  <Users className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground">Belum ada siswa</h3>
                  <p className="text-muted-foreground mt-1">
                    Belum ada siswa yang mengerjakan kuis ini
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DashboardLayout>
    );
  }

  // Quiz Detail View
  if (selectedQuiz) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => setSelectedQuiz(null)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-foreground">{selectedQuiz.judul_kuis}</h1>
              {/* <p className="text-muted-foreground mt-1">
                {selectedQuiz.subjectName} • ID Guru: {selectedQuiz.id_guru}
              </p> */}
            </div>
            <Button variant="outline" onClick={handleViewStudents}>
              <Users className="h-4 w-4 mr-2" />
              Lihat Siswa
            </Button>
            <Dialog open={isQuestionDialogOpen} onOpenChange={(open) => {
              setIsQuestionDialogOpen(open);
              if (!open) resetQuestionForm();
            }}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => resetQuestionForm()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah Soal
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>{editingQuestion ? 'Edit Soal' : 'Tambah Soal Baru'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmitQuestion} className="space-y-4">
                  <div className="space-y-2">
                    <Label>ID Kuis</Label>
                    <Input value={selectedQuiz.id} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pertanyaan">Pertanyaan</Label>
                    <Input
                      id="pertanyaan"
                      value={questionForm.pertanyaan}
                      onChange={(e) => setQuestionForm(prev => ({ ...prev, pertanyaan: e.target.value }))}
                      placeholder="Masukkan pertanyaan..."
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="opsi_a">Opsi A</Label>
                      <Input
                        id="opsi_a"
                        value={questionForm.opsi_a}
                        onChange={(e) => setQuestionForm(prev => ({ ...prev, opsi_a: e.target.value }))}
                        placeholder="Opsi A"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="opsi_b">Opsi B</Label>
                      <Input
                        id="opsi_b"
                        value={questionForm.opsi_b}
                        onChange={(e) => setQuestionForm(prev => ({ ...prev, opsi_b: e.target.value }))}
                        placeholder="Opsi B"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="opsi_c">Opsi C</Label>
                      <Input
                        id="opsi_c"
                        value={questionForm.opsi_c}
                        onChange={(e) => setQuestionForm(prev => ({ ...prev, opsi_c: e.target.value }))}
                        placeholder="Opsi C"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="opsi_d">Opsi D</Label>
                      <Input
                        id="opsi_d"
                        value={questionForm.opsi_d}
                        onChange={(e) => setQuestionForm(prev => ({ ...prev, opsi_d: e.target.value }))}
                        placeholder="Opsi D"
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Jawaban Benar</Label>
                      <Select
                        value={questionForm.jawaban_benar}
                        onValueChange={(value) =>
                          setQuestionForm(prev => ({ ...prev, jawaban_benar: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih jawaban benar" />
                        </SelectTrigger>

                        <SelectContent>
                          <SelectItem value={questionForm.opsi_a || "__A__"}>
                            {questionForm.opsi_a || "Opsi A"}
                          </SelectItem>

                          <SelectItem value={questionForm.opsi_b || "__B__"}>
                            {questionForm.opsi_b || "Opsi B"}
                          </SelectItem>

                          <SelectItem value={questionForm.opsi_c || "__C__"}>
                            {questionForm.opsi_c || "Opsi C"}
                          </SelectItem>

                          <SelectItem value={questionForm.opsi_d || "__D__"}>
                            {questionForm.opsi_d || "Opsi D"}
                          </SelectItem>
                        </SelectContent>
                      </Select>


                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="skor">Skor</Label>
                      <Input
                        id="skor"
                        type="number"
                        value={questionForm.skor}
                        onChange={(e) => setQuestionForm(prev => ({ ...prev, skor: parseInt(e.target.value) }))}
                        min={1}
                        max={100}
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                    {editingQuestion ? 'Perbarui Soal' : 'Simpan Soal'}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Questions List */}
          {questions.length > 0 ? (
            <div className="space-y-4">
              {questions.map((question, idx) => (
                <Card key={question.id} className="glass">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <Badge variant="secondary" className="mb-2">Soal {idx + 1}</Badge>
                        <CardTitle className="text-lg">{question.pertanyaan}</CardTitle>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge>{question.skor_soal} poin</Badge>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleEditQuestion(question)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => handleDeleteQuestion(question.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-2">
                      <div className={`p-3 rounded-lg ${question.jawaban_benar === question.opsi_a ? 'bg-green-500/20 border border-green-500' : 'bg-muted'}`}>
                        <span className="font-medium">A.</span> {question.opsi_a}
                      </div>
                      <div className={`p-3 rounded-lg ${question.jawaban_benar === question.opsi_b ? 'bg-green-500/20 border border-green-500' : 'bg-muted'}`}>
                        <span className="font-medium">B.</span> {question.opsi_b}
                      </div>
                      <div className={`p-3 rounded-lg ${question.jawaban_benar === question.opsi_c ? 'bg-green-500/20 border border-green-500' : 'bg-muted'}`}>
                        <span className="font-medium">C.</span> {question.opsi_c}
                      </div>
                      <div className={`p-3 rounded-lg ${question.jawaban_benar === question.opsi_d ? 'bg-green-500/20 border border-green-500' : 'bg-muted'}`}>
                        <span className="font-medium">D.</span> {question.opsi_d}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="glass">
              <CardContent className="py-12">
                <div className="text-center">
                  <ClipboardList className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground">Belum ada soal</h3>
                  <p className="text-muted-foreground mt-1">
                    Tambahkan soal untuk kuis ini
                  </p>
                  <Button className="mt-4 bg-blue-600 hover:bg-blue-700" onClick={() => setIsQuestionDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Tambah Soal
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DashboardLayout>
    );
  }

  // Quiz List View
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Kuis</h1>
            <p className="text-muted-foreground mt-1">
              Buat dan kelola kuis untuk siswa Anda.
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Buat Kuis
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{editingQuiz ? 'Edit Kuis' : 'Buat Kuis Baru'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmitQuiz} className="space-y-4">
                <div className="space-y-2">
                  <Label>ID Guru</Label>
                  <Input value={user?.id || ''} disabled />
                </div>
                <div className="space-y-2">
                  <Label>Mata Pelajaran</Label>
                  <Select
                    value={formData.id_matapelajaran}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, id_matapelajaran: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih mata pelajaran" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map((subject) => (
                        <SelectItem key={subject.id} value={subject.id.toString()}>
                          {subject.mata_pelajaran}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="judul_kuis">Judul Kuis</Label>
                  <Input
                    id="judul_kuis"
                    value={formData.judul_kuis}
                    onChange={(e) => setFormData(prev => ({ ...prev, judul_kuis: e.target.value }))}
                    placeholder="Masukkan judul kuis..."
                    required
                  />
                </div>
                {/* <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="timeLimit">Batas Waktu (menit)</Label>
                    <Input
                      id="timeLimit"
                      type="number"
                      value={formData.timeLimit}
                      onChange={(e) => setFormData(prev => ({ ...prev, timeLimit: parseInt(e.target.value) }))}
                      min={1}
                      max={120}
                    />
                  </div>
                  <div className="flex items-center justify-between pt-7">
                    <Label htmlFor="publish">Publikasi</Label>
                    <Switch
                      id="publish"
                      checked={formData.isPublished}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isPublished: checked }))}
                    />
                  </div>
                </div> */}
                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                  {editingQuiz ? 'Perbarui Kuis' : 'Buat Kuis'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Quizzes Grid */}
        {quizzes.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {quizzes.map((quiz) => (
              <Card
                key={quiz.id}
                className="glass glass-hover cursor-pointer transition-all hover:scale-[1.02]"
                onClick={() => setSelectedQuiz(quiz)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <Badge variant={quiz.isPublished ? 'default' : 'secondary'}>
                      {quiz.isPublished ? (
                        <><CheckCircle2 className="h-3 w-3 mr-1" />Published</>
                      ) : (
                        <><CheckCircle2 className="h-3 w-3 mr-1" />Published</>
                        // <><XCircle className="h-3 w-3 mr-1" />Draft</>
                      )}
                    </Badge>
                    <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleEdit(quiz)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => handleDelete(quiz.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <CardTitle className="text-lg mt-2">{quiz.judul_kuis}</CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    {quiz.subjectName}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>ID Guru: {quiz.id_guru}</span>
                    {/* <span>{quiz.timeLimit || 15} menit</span> */}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="glass">
            <CardContent className="py-12">
              <div className="text-center">
                <ClipboardList className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground">Kuis belum ada</h3>
                <p className="text-muted-foreground mt-1">
                  Buat kuis untuk mengetes kemampuan siswa
                </p>
                <Button className="mt-4 bg-blue-600 hover:bg-blue-700" onClick={() => setIsDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Buat Kuis
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default TeacherQuizzes;
