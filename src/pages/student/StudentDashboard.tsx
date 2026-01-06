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
import { getMataPelajaranApi } from '@/api/mataPelajaran';
import { getAllMateriApi } from '@/api/materi';
import { getAllKuis } from '@/api/kuis';

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
        getAllMateriApi(),
        getAllKuis(),
        getItemsByIndex<QuizAttempt>('quizAttempts', 'studentId', user.id),
        getAllItems<OfflineMaterial>('offlineMaterials'),
      ]);
      setMaterials(allMaterials?.materis)
      setQuizzes(allQuizzes?.data)
      setAttempts(userAttempts);
      setOfflineMaterials(offline);
    };
    loadData();
  }, [user]);
  const totalQuizzes = quizzes.length;
  const stats = [
    {
      label: 'Materi Tersedia',
      value: materials.length,
      icon: BookOpen,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      label: 'Kuis Tersedia',
      value: `${totalQuizzes}`,
      icon: ClipboardList,
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
  ];
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Selamat datang kembali, {user?.name.split(' ')[0]}! 👋
            </h1>
            <p className="text-muted-foreground mt-1">
              Siap melanjutkan pembelajaran? Berikut ringkasan kemajuan Anda.
            </p>
          </div>
          <Button asChild>
            <Link to="/student/materials">
              Cari Materi
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
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
        <Card className="glass">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Materi Terbaru</CardTitle>
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
                        by {material.teacherName} • {(material.file_type || 'file').toUpperCase()}
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <Link to={`/student/materials`}>
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
