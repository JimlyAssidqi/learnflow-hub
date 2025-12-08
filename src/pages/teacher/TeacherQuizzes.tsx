import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getItemsByIndex, addItem, updateItem, deleteItem } from '@/lib/db';
import { Quiz, Question } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { 
  ClipboardList, 
  Plus, 
  Trash2,
  Edit,
  CheckCircle2,
  XCircle
} from 'lucide-react';

const TeacherQuizzes: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    timeLimit: 15,
    isPublished: false,
  });
  
  const [questions, setQuestions] = useState<Question[]>([]);
  const [newQuestion, setNewQuestion] = useState({
    type: 'multiple-choice' as 'multiple-choice' | 'short-answer',
    text: '',
    options: ['', '', '', ''],
    correctAnswer: '',
    points: 10,
  });

  useEffect(() => {
    const loadQuizzes = async () => {
      if (!user) return;
      const userQuizzes = await getItemsByIndex<Quiz>('quizzes', 'teacherId', user.id);
      setQuizzes(userQuizzes);
    };
    loadQuizzes();
  }, [user]);

  const resetForm = () => {
    setFormData({ title: '', description: '', timeLimit: 15, isPublished: false });
    setQuestions([]);
    setNewQuestion({
      type: 'multiple-choice',
      text: '',
      options: ['', '', '', ''],
      correctAnswer: '',
      points: 10,
    });
    setEditingQuiz(null);
  };

  const addQuestion = () => {
    if (!newQuestion.text || !newQuestion.correctAnswer) {
      toast({
        title: 'Missing information',
        description: 'Please fill in the question and correct answer.',
        variant: 'destructive',
      });
      return;
    }

    const question: Question = {
      id: `q-${Date.now()}`,
      type: newQuestion.type,
      text: newQuestion.text,
      options: newQuestion.type === 'multiple-choice' ? newQuestion.options.filter(o => o) : undefined,
      correctAnswer: newQuestion.correctAnswer,
      points: newQuestion.points,
    };

    setQuestions(prev => [...prev, question]);
    setNewQuestion({
      type: 'multiple-choice',
      text: '',
      options: ['', '', '', ''],
      correctAnswer: '',
      points: 10,
    });
  };

  const removeQuestion = (id: string) => {
    setQuestions(prev => prev.filter(q => q.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (questions.length === 0) {
      toast({
        title: 'No questions',
        description: 'Please add at least one question.',
        variant: 'destructive',
      });
      return;
    }

    const quizData: Quiz = {
      id: editingQuiz?.id || `quiz-${Date.now()}`,
      title: formData.title,
      description: formData.description,
      teacherId: user.id,
      teacherName: user.name,
      questions,
      timeLimit: formData.timeLimit,
      createdAt: editingQuiz?.createdAt || new Date().toISOString(),
      isPublished: formData.isPublished,
    };

    if (editingQuiz) {
      await updateItem('quizzes', quizData);
      setQuizzes(prev => prev.map(q => q.id === quizData.id ? quizData : q));
    } else {
      await addItem('quizzes', quizData);
      setQuizzes(prev => [...prev, quizData]);
    }

    setIsDialogOpen(false);
    resetForm();

    toast({
      title: editingQuiz ? 'Quiz updated!' : 'Quiz created!',
      description: formData.isPublished ? 'Students can now take this quiz.' : 'Quiz saved as draft.',
    });
  };

  const handleEdit = (quiz: Quiz) => {
    setEditingQuiz(quiz);
    setFormData({
      title: quiz.title,
      description: quiz.description,
      timeLimit: quiz.timeLimit || 15,
      isPublished: quiz.isPublished,
    });
    setQuestions(quiz.questions);
    setIsDialogOpen(true);
  };

  const handleDelete = async (quizId: string) => {
    await deleteItem('quizzes', quizId);
    setQuizzes(prev => prev.filter(q => q.id !== quizId));
    toast({
      title: 'Quiz deleted',
      description: 'The quiz has been removed.',
    });
  };

  const togglePublish = async (quiz: Quiz) => {
    const updated = { ...quiz, isPublished: !quiz.isPublished };
    await updateItem('quizzes', updated);
    setQuizzes(prev => prev.map(q => q.id === quiz.id ? updated : q));
    toast({
      title: updated.isPublished ? 'Quiz published!' : 'Quiz unpublished',
      description: updated.isPublished ? 'Students can now take this quiz.' : 'Quiz is now a draft.',
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Quizzes</h1>
            <p className="text-muted-foreground mt-1">
              Create and manage quizzes for your students
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Quiz
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingQuiz ? 'Edit Quiz' : 'Create New Quiz'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Quiz Details */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Quiz Title</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="e.g., JavaScript Basics Quiz"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Brief description of the quiz..."
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="timeLimit">Time Limit (minutes)</Label>
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
                      <Label htmlFor="publish">Publish immediately</Label>
                      <Switch
                        id="publish"
                        checked={formData.isPublished}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isPublished: checked }))}
                      />
                    </div>
                  </div>
                </div>

                {/* Questions List */}
                {questions.length > 0 && (
                  <div className="space-y-3">
                    <Label>Questions ({questions.length})</Label>
                    {questions.map((q, idx) => (
                      <div key={q.id} className="flex items-center justify-between p-3 rounded-lg bg-muted">
                        <div>
                          <p className="text-sm font-medium">Q{idx + 1}: {q.text}</p>
                          <p className="text-xs text-muted-foreground">
                            {q.type} • {q.points} points
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeQuestion(q.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add Question Form */}
                <div className="space-y-4 p-4 rounded-lg border border-dashed border-border">
                  <Label>Add Question</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Type</Label>
                      <Select
                        value={newQuestion.type}
                        onValueChange={(value) => setNewQuestion(prev => ({ 
                          ...prev, 
                          type: value as any,
                          options: value === 'multiple-choice' ? ['', '', '', ''] : []
                        }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
                          <SelectItem value="short-answer">Short Answer</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Points</Label>
                      <Input
                        type="number"
                        value={newQuestion.points}
                        onChange={(e) => setNewQuestion(prev => ({ ...prev, points: parseInt(e.target.value) }))}
                        min={1}
                        max={100}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Question Text</Label>
                    <Input
                      value={newQuestion.text}
                      onChange={(e) => setNewQuestion(prev => ({ ...prev, text: e.target.value }))}
                      placeholder="Enter your question..."
                    />
                  </div>
                  {newQuestion.type === 'multiple-choice' && (
                    <div className="space-y-2">
                      <Label>Options</Label>
                      {newQuestion.options.map((option, idx) => (
                        <Input
                          key={idx}
                          value={option}
                          onChange={(e) => {
                            const newOptions = [...newQuestion.options];
                            newOptions[idx] = e.target.value;
                            setNewQuestion(prev => ({ ...prev, options: newOptions }));
                          }}
                          placeholder={`Option ${idx + 1}`}
                        />
                      ))}
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label>Correct Answer</Label>
                    <Input
                      value={newQuestion.correctAnswer}
                      onChange={(e) => setNewQuestion(prev => ({ ...prev, correctAnswer: e.target.value }))}
                      placeholder={newQuestion.type === 'multiple-choice' ? 'Enter the exact correct option text' : 'Enter the correct answer'}
                    />
                  </div>
                  <Button type="button" variant="outline" onClick={addQuestion}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Question
                  </Button>
                </div>

                <Button type="submit" className="w-full">
                  {editingQuiz ? 'Update Quiz' : 'Create Quiz'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Quizzes Grid */}
        {quizzes.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {quizzes.map((quiz) => (
              <Card key={quiz.id} className="glass glass-hover">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <Badge variant={quiz.isPublished ? 'default' : 'secondary'}>
                      {quiz.isPublished ? (
                        <><CheckCircle2 className="h-3 w-3 mr-1" />Published</>
                      ) : (
                        <><XCircle className="h-3 w-3 mr-1" />Draft</>
                      )}
                    </Badge>
                    <div className="flex gap-1">
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
                  <CardTitle className="text-lg mt-2">{quiz.title}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {quiz.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
                    <span>{quiz.questions.length} questions</span>
                    <span>{quiz.timeLimit || 15} min</span>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => togglePublish(quiz)}
                  >
                    {quiz.isPublished ? 'Unpublish' : 'Publish'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="glass">
            <CardContent className="py-12">
              <div className="text-center">
                <ClipboardList className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground">No quizzes yet</h3>
                <p className="text-muted-foreground mt-1">
                  Create your first quiz to test student knowledge.
                </p>
                <Button className="mt-4" onClick={() => setIsDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Quiz
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
