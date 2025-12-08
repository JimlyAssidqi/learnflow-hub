import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getAllItems, getItemsByIndex } from '@/lib/db';
import { Material, Quiz, QuizAttempt, User } from '@/types';
import { 
  BookOpen, 
  ClipboardList, 
  Users, 
  TrendingUp,
  Plus,
  ArrowRight,
  BarChart3
} from 'lucide-react';

const TeacherDashboard: React.FC = () => {
  const { user } = useAuth();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [students, setStudents] = useState<User[]>([]);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;
      
      const [allMaterials, allQuizzes, allUsers, allAttempts] = await Promise.all([
        getItemsByIndex<Material>('materials', 'teacherId', user.id),
        getItemsByIndex<Quiz>('quizzes', 'teacherId', user.id),
        getAllItems<User>('users'),
        getAllItems<QuizAttempt>('quizAttempts'),
      ]);

      setMaterials(allMaterials);
      setQuizzes(allQuizzes);
      setStudents(allUsers.filter(u => u.role === 'student'));
      
      // Get attempts for teacher's quizzes
      const quizIds = allQuizzes.map(q => q.id);
      setAttempts(allAttempts.filter(a => quizIds.includes(a.quizId)));
    };

    loadData();
  }, [user]);

  const totalDownloads = materials.reduce((acc, m) => acc + m.downloadCount, 0);
  const averageScore = attempts.length > 0
    ? Math.round(attempts.reduce((acc, a) => acc + a.percentage, 0) / attempts.length)
    : 0;

  const stats = [
    {
      label: 'Materials Uploaded',
      value: materials.length,
      icon: BookOpen,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      label: 'Quizzes Created',
      value: quizzes.length,
      icon: ClipboardList,
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
    {
      label: 'Total Students',
      value: students.length,
      icon: Users,
      color: 'text-accent',
      bgColor: 'bg-accent/10',
    },
    {
      label: 'Avg. Quiz Score',
      value: `${averageScore}%`,
      icon: TrendingUp,
      color: 'text-info',
      bgColor: 'bg-info/10',
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Welcome, {user?.name.split(' ')[0]}! 📚
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage your courses and track student progress.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link to="/teacher/materials">
                <Plus className="mr-2 h-4 w-4" />
                Add Material
              </Link>
            </Button>
            <Button asChild>
              <Link to="/teacher/quizzes">
                <Plus className="mr-2 h-4 w-4" />
                Create Quiz
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <Card key={stat.label} className="glass glass-hover">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-lg ${stat.bgColor}`}>
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions & Recent Activity */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Quick Actions */}
          <Card className="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5 text-primary" />
                Quick Actions
              </CardTitle>
              <CardDescription>Common tasks for your courses</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link to="/teacher/materials">
                <Button variant="outline" className="w-full justify-start h-auto py-3">
                  <BookOpen className="mr-3 h-5 w-5 text-primary" />
                  <div className="text-left">
                    <p className="font-medium">Upload Material</p>
                    <p className="text-xs text-muted-foreground">PDF, PPT, or Video</p>
                  </div>
                </Button>
              </Link>
              <Link to="/teacher/quizzes">
                <Button variant="outline" className="w-full justify-start h-auto py-3">
                  <ClipboardList className="mr-3 h-5 w-5 text-success" />
                  <div className="text-left">
                    <p className="font-medium">Create Quiz</p>
                    <p className="text-xs text-muted-foreground">Multiple choice or short answer</p>
                  </div>
                </Button>
              </Link>
              <Link to="/teacher/students">
                <Button variant="outline" className="w-full justify-start h-auto py-3">
                  <Users className="mr-3 h-5 w-5 text-accent" />
                  <div className="text-left">
                    <p className="font-medium">View Students</p>
                    <p className="text-xs text-muted-foreground">Track progress & grades</p>
                  </div>
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Recent Quiz Attempts */}
          <Card className="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Recent Quiz Attempts
              </CardTitle>
              <CardDescription>Latest student submissions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {attempts.slice(0, 4).map((attempt) => {
                  const quiz = quizzes.find(q => q.id === attempt.quizId);
                  return (
                    <div
                      key={attempt.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                    >
                      <div>
                        <p className="font-medium text-sm">{attempt.studentName}</p>
                        <p className="text-xs text-muted-foreground">
                          {quiz?.title || 'Unknown Quiz'}
                        </p>
                      </div>
                      <div className={`text-sm font-bold ${
                        attempt.percentage >= 70 ? 'text-success' : 
                        attempt.percentage >= 50 ? 'text-accent' : 'text-destructive'
                      }`}>
                        {attempt.percentage}%
                      </div>
                    </div>
                  );
                })}
                {attempts.length === 0 && (
                  <p className="text-center text-muted-foreground py-4">
                    No quiz attempts yet
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Materials List */}
        <Card className="glass">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Your Materials</CardTitle>
              <CardDescription>Learning resources you've uploaded</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/teacher/materials">
                View all
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {materials.slice(0, 3).map((material) => (
                <div
                  key={material.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <BookOpen className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{material.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {material.type.toUpperCase()} • {material.downloadCount} downloads
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    Edit
                  </Button>
                </div>
              ))}
              {materials.length === 0 && (
                <div className="text-center py-8">
                  <BookOpen className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
                  <p className="text-muted-foreground">No materials uploaded yet</p>
                  <Button className="mt-4" asChild>
                    <Link to="/teacher/materials">
                      <Plus className="mr-2 h-4 w-4" />
                      Upload Your First Material
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default TeacherDashboard;
