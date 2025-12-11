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
import { getMateriByGuruApi } from '@/api/materi';

const TeacherDashboard: React.FC = () => {
  const { user } = useAuth();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [students, setStudents] = useState<User[]>([]);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);

    // useEffect(() => {
    //   loadMaterials();
    // }, [user]);
    
    // const loadMaterials = async () => {
    //   if (!user) return;
    //   const response = await getMateriByGuruApi(user.id);
    //   setMaterials(response.materi);
    // };

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;
      
      const [response, allQuizzes, allUsers, allAttempts] = await Promise.all([
        getMateriByGuruApi(user.id),
        getItemsByIndex<Quiz>('quizzes', 'teacherId', user.id),
        getAllItems<User>('users'),
        getAllItems<QuizAttempt>('quizAttempts'),
      ]);

      setMaterials(response.materi);
      console.log(response.materi);
      setQuizzes(allQuizzes);
      
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
      label: 'Materi Diupload',
      value: materials.length,
      icon: BookOpen,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      label: 'Kuis Dibuat',
      value: quizzes.length,
      icon: ClipboardList,
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
    {
      label: 'Jumlah Siswa',
      value: students.length,
      icon: Users,
      color: 'text-accent',
      bgColor: 'bg-accent/10',
    }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Selamat datang, {user?.name.split(' ')[0]}! 📚
            </h1>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link to="/teacher/materials">
                <Plus className="mr-2 h-4 w-4" />
                Tambah Materi
              </Link>
            </Button>
            <Button className='bg-blue-600 hover:bg-blue-600' asChild>
              <Link to="/teacher/quizzes">
                <Plus className="mr-2 h-4 w-4" />
                Buiat Kuis
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

        {/* Materials List */}
        <Card className="glass">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Materi Anda</CardTitle>
              <CardDescription>Sumber pembelajaran yang anda upload</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/teacher/materials">
                View all
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-3">
              {materials.map((material) => (
                <div
                  key={material.id}
                  className="flex border items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <BookOpen className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{material.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {(material.file_type || 'file').toUpperCase()} • {material.downloadCount} downloads
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
