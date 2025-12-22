import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getAllItems } from '@/lib/db';
import { Material, Quiz, User } from '@/types';
import { 
  Users, 
  BookOpen, 
  ClipboardList, 
  Shield,
  UserPlus,
  Settings,
  ArrowRight,
  GraduationCap,
  UserCog
} from 'lucide-react';
import { getUserApi, getUserStudentApi, getUserTeacherApi } from '@/api/user';
import { getAllMateriApi } from '@/api/materi';

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [students, setStudents] = useState<User[]>([]);
  const [teachers, setTeachers] = useState<User[]>([]);

  useEffect(() => {
    const loadData = async () => {
      const [allUsers, allMaterials, allQuizzes, allStudents, allTeachers] = await Promise.all([
        getUserApi(),
        getAllMateriApi(),
        getAllItems<Quiz>('quizzes'),
        getUserStudentApi(),
        getUserTeacherApi()
      ]);

      setUsers(allUsers.users);
      setMaterials(allMaterials.materis);
      setQuizzes(allQuizzes);
      setStudents(allStudents.students);
      setTeachers(allTeachers.teachers);
    };

    loadData();
  }, []);

  // const studentCount = users.filter(u => u.role === 'student').length;
  // const teacherCount = users.filter(u => u.role === 'teacher').length;
  // const adminCount = users.filter(u => u.role === 'admin').length;

  const stats = [
    {
      label: 'Total Users',
      value: users.length,
      icon: Users,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      label: 'Siswa',
      value: students.length,
      icon: GraduationCap,
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
    {
      label: 'Guru',
      value: teachers.length,
      icon: UserCog,
      color: 'text-accent',
      bgColor: 'bg-accent/10',
    },
    {
      label: 'Jumlah Materi',
      value: materials.length + quizzes.length,
      icon: BookOpen,
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
              Admin Dashboard 🛡️
            </h1>
            <p className="text-muted-foreground mt-1">
              Kelola users, konten, and sistem.
            </p>
          </div>
          <Button asChild>
            <Link to="/admin/users">
              <UserPlus className="mr-2 h-4 w-4" />
              Add User
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

        {/* Quick Actions & User List */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Quick Actions */}
          {/* <Card className="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Admin Actions
              </CardTitle>
              <CardDescription>System management tools</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link to="/admin/users">
                <Button variant="outline" className="w-full justify-start h-auto py-3">
                  <Users className="mr-3 h-5 w-5 text-primary" />
                  <div className="text-left">
                    <p className="font-medium">Manage Users</p>
                    <p className="text-xs text-muted-foreground">Create, edit, delete accounts</p>
                  </div>
                </Button>
              </Link>
              <Link to="/admin/content">
                <Button variant="outline" className="w-full justify-start h-auto py-3">
                  <BookOpen className="mr-3 h-5 w-5 text-success" />
                  <div className="text-left">
                    <p className="font-medium">Manage Content</p>
                    <p className="text-xs text-muted-foreground">Review materials & quizzes</p>
                  </div>
                </Button>
              </Link>
              <Link to="/admin/settings">
                <Button variant="outline" className="w-full justify-start h-auto py-3">
                  <Settings className="mr-3 h-5 w-5 text-accent" />
                  <div className="text-left">
                    <p className="font-medium">System Settings</p>
                    <p className="text-xs text-muted-foreground">Configure platform options</p>
                  </div>
                </Button>
              </Link>
            </CardContent>
          </Card> */}

          {/* Recent Users */}
          {/* <Card className="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Recent Users
              </CardTitle>
              <CardDescription>Latest registered accounts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {users.slice(0, 4).map((u) => (
                  <div
                    key={u.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-medium ${
                        u.role === 'admin' ? 'bg-destructive text-destructive-foreground' :
                        u.role === 'teacher' ? 'bg-primary text-primary-foreground' :
                        'bg-accent text-accent-foreground'
                      }`}>
                        {u.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{u.name}</p>
                        <p className="text-xs text-muted-foreground capitalize">{u.role}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card> */}
        </div>

        {/* Content Overview */}
        <Card className="glass">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Ringkasan Konten</CardTitle>
              <CardDescription>Semua materi dan kuis </CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/admin/subjects">
                Lihat Semua
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3 mb-3">
                  <BookOpen className="h-5 w-5 text-primary" />
                  <span className="font-medium">Materi</span>
                </div>
                <p className="text-3xl font-bold">{materials.length}</p>
                <p className="text-sm text-muted-foreground">
                  {/* {materials.filter(m => m.file_type === 'pdf').length} PDFs, {' '}
                  {materials.filter(m => m.file_type === 'ppt').length} PPTs, {' '}
                  {materials.filter(m => m.file_type === 'video').length} Videos */}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3 mb-3">
                  <ClipboardList className="h-5 w-5 text-success" />
                  <span className="font-medium">Kuis</span>
                </div>
                <p className="text-3xl font-bold">{quizzes.length}</p>
                <p className="text-sm text-muted-foreground">
                  {/* {quizzes.filter(q => q.isPublished).length} Publis {' '} */}
                  {/* {quizzes.filter(q => !q.isPublished).length} Drafts */}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
