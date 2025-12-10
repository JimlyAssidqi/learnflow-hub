import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getAllItems, getItemsByIndex } from '@/lib/db';
import { Material, Quiz, QuizAttempt } from '@/types';
import { 
  BarChart3, 
  TrendingUp,
  Download,
  Users,
  Award
} from 'lucide-react';

const TeacherAnalytics: React.FC = () => {
  const { user } = useAuth();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;
      
      const [teacherMaterials, teacherQuizzes, allAttempts] = await Promise.all([
        getItemsByIndex<Material>('materials', 'teacherId', user.id),
        getItemsByIndex<Quiz>('quizzes', 'teacherId', user.id),
        getAllItems<QuizAttempt>('quizAttempts'),
      ]);

      setMaterials(teacherMaterials);
      setQuizzes(teacherQuizzes);
      
      const quizIds = teacherQuizzes.map(q => q.id);
      setAttempts(allAttempts.filter(a => quizIds.includes(a.quizId)));
    };

    loadData();
  }, [user]);

  const totalDownloads = materials.reduce((acc, m) => acc + m.downloadCount, 0);
  const avgScore = attempts.length > 0
    ? Math.round(attempts.reduce((acc, a) => acc + a.percentage, 0) / attempts.length)
    : 0;
  const passRate = attempts.length > 0
    ? Math.round((attempts.filter(a => a.percentage >= 70).length / attempts.length) * 100)
    : 0;

  const topMaterials = [...materials]
    .sort((a, b) => b.downloadCount - a.downloadCount)
    .slice(0, 5);

  const quizPerformance = quizzes.map(quiz => {
    const quizAttempts = attempts.filter(a => a.quizId === quiz.id);
    const avg = quizAttempts.length > 0
      ? Math.round(quizAttempts.reduce((acc, a) => acc + a.percentage, 0) / quizAttempts.length)
      : 0;
    return { ...quiz, attempts: quizAttempts.length, avgScore: avg };
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
          <p className="text-muted-foreground mt-1">
            Insights into your course performance
          </p>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="glass">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-primary/10">
                  <Download className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalDownloads}</p>
                  <p className="text-xs text-muted-foreground">Total Downloads</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="glass">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-success/10">
                  <Users className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{attempts.length}</p>
                  <p className="text-xs text-muted-foreground">Quiz Attempts</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="glass">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-accent/10">
                  <TrendingUp className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{avgScore}%</p>
                  <p className="text-xs text-muted-foreground">Avg Quiz Score</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="glass">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-info/10">
                  <Award className="h-5 w-5 text-info" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{passRate}%</p>
                  <p className="text-xs text-muted-foreground">Pass Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Top Materials */}
          <Card className="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5 text-primary" />
                Top Materials
              </CardTitle>
              <CardDescription>Most downloaded content</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topMaterials.map((material, idx) => (
                  <div key={material.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold text-muted-foreground w-6">
                        {idx + 1}
                      </span>
                      <div>
                        <p className="font-medium text-sm">{material.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {(material.file_type || 'file').toUpperCase()}
                        </p>
                      </div>
                    </div>
                    <span className="text-sm font-medium">{material.downloadCount}</span>
                  </div>
                ))}
                {topMaterials.length === 0 && (
                  <p className="text-center text-muted-foreground py-4">
                    No materials uploaded yet
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quiz Performance */}
          <Card className="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Quiz Performance
              </CardTitle>
              <CardDescription>Average scores per quiz</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {quizPerformance.map((quiz) => (
                  <div key={quiz.id}>
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium text-sm truncate pr-4">{quiz.title}</p>
                      <span className="text-sm text-muted-foreground">
                        {quiz.attempts} attempts
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all ${
                            quiz.avgScore >= 70 ? 'bg-success' :
                            quiz.avgScore >= 50 ? 'bg-accent' :
                            'bg-destructive'
                          }`}
                          style={{ width: `${quiz.avgScore}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium w-12 text-right">
                        {quiz.avgScore}%
                      </span>
                    </div>
                  </div>
                ))}
                {quizPerformance.length === 0 && (
                  <p className="text-center text-muted-foreground py-4">
                    No quizzes created yet
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TeacherAnalytics;
