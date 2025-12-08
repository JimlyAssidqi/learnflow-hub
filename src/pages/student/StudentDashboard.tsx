import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { getAllItems, getItemsByIndex } from '@/lib/db';
import { Material, Quiz, QuizAttempt, OfflineMaterial } from '@/types';
import { 
  BookOpen, 
  ClipboardList, 
  Download, 
  MessageSquare, 
  TrendingUp,
  Clock,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';

const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [offlineMaterials, setOfflineMaterials] = useState<OfflineMaterial[]>([]);

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;
      
      const [allMaterials, allQuizzes, userAttempts, offline] = await Promise.all([
        getAllItems<Material>('materials'),
        getAllItems<Quiz>('quizzes'),
        getItemsByIndex<QuizAttempt>('quizAttempts', 'studentId', user.id),
        getAllItems<OfflineMaterial>('offlineMaterials'),
      ]);

      setMaterials(allMaterials);
      setQuizzes(allQuizzes.filter(q => q.isPublished));
      setAttempts(userAttempts);
      setOfflineMaterials(offline);
    };

    loadData();
  }, [user]);

  const completedQuizzes = attempts.length;
  const totalQuizzes = quizzes.length;
  const averageScore = attempts.length > 0 
    ? Math.round(attempts.reduce((acc, a) => acc + a.percentage, 0) / attempts.length)
    : 0;

  const stats = [
    {
      label: 'Materials Available',
      value: materials.length,
      icon: BookOpen,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      label: 'Quizzes Completed',
      value: `${completedQuizzes}/${totalQuizzes}`,
      icon: ClipboardList,
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
    {
      label: 'Average Score',
      value: `${averageScore}%`,
      icon: TrendingUp,
      color: 'text-accent',
      bgColor: 'bg-accent/10',
    },
    {
      label: 'Offline Materials',
      value: offlineMaterials.length,
      icon: Download,
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
              Welcome back, {user?.name.split(' ')[0]}! 👋
            </h1>
            <p className="text-muted-foreground mt-1">
              Ready to continue learning? Here's your progress overview.
            </p>
          </div>
          <Button asChild>
            <Link to="/student/materials">
              Browse Materials
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
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

        {/* Progress & Recent Activity */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Learning Progress */}
          <Card className="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Learning Progress
              </CardTitle>
              <CardDescription>Your overall course completion</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Materials Viewed</span>
                  <span className="font-medium">{Math.min(materials.length, 2)}/{materials.length}</span>
                </div>
                <Progress value={materials.length > 0 ? (2 / materials.length) * 100 : 0} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Quizzes Completed</span>
                  <span className="font-medium">{completedQuizzes}/{totalQuizzes}</span>
                </div>
                <Progress value={totalQuizzes > 0 ? (completedQuizzes / totalQuizzes) * 100 : 0} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Average Score</span>
                  <span className="font-medium">{averageScore}%</span>
                </div>
                <Progress value={averageScore} className="h-2" />
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Quick Actions
              </CardTitle>
              <CardDescription>Jump right into learning</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link to="/student/materials">
                <Button variant="outline" className="w-full justify-start h-auto py-3">
                  <BookOpen className="mr-3 h-5 w-5 text-primary" />
                  <div className="text-left">
                    <p className="font-medium">Browse Materials</p>
                    <p className="text-xs text-muted-foreground">{materials.length} available</p>
                  </div>
                </Button>
              </Link>
              <Link to="/student/quizzes">
                <Button variant="outline" className="w-full justify-start h-auto py-3">
                  <ClipboardList className="mr-3 h-5 w-5 text-success" />
                  <div className="text-left">
                    <p className="font-medium">Take a Quiz</p>
                    <p className="text-xs text-muted-foreground">{quizzes.length - completedQuizzes} pending</p>
                  </div>
                </Button>
              </Link>
              <Link to="/student/discussions">
                <Button variant="outline" className="w-full justify-start h-auto py-3">
                  <MessageSquare className="mr-3 h-5 w-5 text-accent" />
                  <div className="text-left">
                    <p className="font-medium">Join Discussion</p>
                    <p className="text-xs text-muted-foreground">Chat with peers</p>
                  </div>
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Recent Materials */}
        <Card className="glass">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Materials</CardTitle>
              <CardDescription>Latest learning resources</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/student/materials">View all</Link>
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
                        by {material.teacherName} • {material.type.toUpperCase()}
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <Link to={`/student/materials/${material.id}`}>
                      View
                    </Link>
                  </Button>
                </div>
              ))}
              {materials.length === 0 && (
                <p className="text-center text-muted-foreground py-4">
                  No materials available yet
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default StudentDashboard;
