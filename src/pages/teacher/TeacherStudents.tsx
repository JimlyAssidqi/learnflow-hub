import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { getAllItems, getItemsByIndex } from '@/lib/db';
import { User, Quiz, QuizAttempt } from '@/types';
import { 
  Users, 
  GraduationCap,
  TrendingUp,
  Award
} from 'lucide-react';
import { getUserStudentApi } from '@/api/user';

const TeacherStudents: React.FC = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState<User[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;
      
      const [studentResponse, teacherQuizzes, allAttempts] = await Promise.all([
        getUserStudentApi(),
        getItemsByIndex<Quiz>('quizzes', 'teacherId', user.id),
        getAllItems<QuizAttempt>('quizAttempts'),
      ]);
      setStudents(studentResponse.students || studentResponse); 
      setQuizzes(teacherQuizzes);
      
      const quizIds = teacherQuizzes.map(q => q.id);
      setAttempts(allAttempts.filter(a => quizIds.includes(a.quizId)));
    };

    loadData();
  }, [user]);

  const getStudentStats = (studentId: string) => {
    const studentAttempts = attempts.filter(a => a.studentId === studentId);
    const avgScore = studentAttempts.length > 0
      ? Math.round(studentAttempts.reduce((acc, a) => acc + a.percentage, 0) / studentAttempts.length)
      : 0;
    
    return {
      quizzesTaken: studentAttempts.length,
      totalQuizzes: quizzes.length,
      avgScore,
    };
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Daftar Siswa</h1>
          <p className="text-muted-foreground mt-1">
            
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="glass">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-primary/10">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{students.length}</p>
                  <p className="text-xs text-muted-foreground">Total Students</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Students List */}
        <Card className="glass">
          <CardHeader>
            <CardTitle>All Students</CardTitle>
            <CardDescription>Individual student performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {students.map((student) => {
                const stats = getStudentStats(student.id);
                return (
                  <div
                    key={student.id}
                    className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-lg bg-muted/50 gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {student.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{student.name}</p>
                        <p className="text-sm text-muted-foreground">{student.email}</p>
                      </div>
                    </div>
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-8">
                      <div className="text-sm">
                        <p className="text-muted-foreground">Quizzes</p>
                        <p className="font-medium">{stats.quizzesTaken}/{stats.totalQuizzes}</p>
                      </div>
                      <div className="w-32">
                        <p className="text-sm text-muted-foreground mb-1">Progress</p>
                        <Progress 
                          value={stats.totalQuizzes > 0 ? (stats.quizzesTaken / stats.totalQuizzes) * 100 : 0} 
                          className="h-2"
                        />
                      </div>
                      <Badge className={`${
                        stats.avgScore >= 70 ? 'bg-success text-success-foreground' :
                        stats.avgScore >= 50 ? 'bg-accent text-accent-foreground' :
                        stats.avgScore > 0 ? 'bg-destructive text-destructive-foreground' :
                        'bg-muted text-muted-foreground'
                      }`}>
                        {stats.avgScore > 0 ? `${stats.avgScore}% avg` : 'No attempts'}
                      </Badge>
                    </div>
                  </div>
                );
              })}
              {students.length === 0 && (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
                  <p className="text-muted-foreground">No students registered yet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default TeacherStudents;
