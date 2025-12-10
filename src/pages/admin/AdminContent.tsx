import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getAllItems, deleteItem } from '@/lib/db';
import { Material, Quiz } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { 
  BookOpen, 
  ClipboardList,
  Trash2,
  FileText,
  Presentation,
  Video,
  CheckCircle2,
  XCircle
} from 'lucide-react';

const typeIcons = {
  pdf: FileText,
  ppt: Presentation,
  video: Video,
};

const AdminContent: React.FC = () => {
  const { toast } = useToast();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);

  useEffect(() => {
    const loadData = async () => {
      const [allMaterials, allQuizzes] = await Promise.all([
        getAllItems<Material>('materials'),
        getAllItems<Quiz>('quizzes'),
      ]);
      setMaterials(allMaterials);
      setQuizzes(allQuizzes);
    };
    loadData();
  }, []);

  const deleteMaterial = async (id: number) => {
    await deleteItem('materials', String(id));
    setMaterials(prev => prev.filter(m => m.id !== id));
    toast({ title: 'Material deleted' });
  };

  const deleteQuiz = async (id: string) => {
    await deleteItem('quizzes', id);
    setQuizzes(prev => prev.filter(q => q.id !== id));
    toast({ title: 'Quiz deleted' });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Content Management</h1>
          <p className="text-muted-foreground mt-1">
            Review and manage all platform content
          </p>
        </div>

        <Tabs defaultValue="materials">
          <TabsList>
            <TabsTrigger value="materials" className="gap-2">
              <BookOpen className="h-4 w-4" />
              Materials ({materials.length})
            </TabsTrigger>
            <TabsTrigger value="quizzes" className="gap-2">
              <ClipboardList className="h-4 w-4" />
              Quizzes ({quizzes.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="materials" className="mt-6">
            <Card className="glass">
              <CardHeader>
                <CardTitle>All Materials</CardTitle>
                <CardDescription>Learning resources uploaded by teachers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {materials.map((material) => {
                    const Icon = typeIcons[material.file_type || 'pdf'];
                    return (
                      <div
                        key={material.id}
                        className="flex items-center justify-between p-4 rounded-lg bg-muted/50"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-primary/10">
                            <Icon className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{material.title}</p>
                            <p className="text-sm text-muted-foreground">
                              by {material.teacherName} • {material.downloadCount} downloads
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant="secondary">
                            {(material.file_type || 'file').toUpperCase()}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive"
                            onClick={() => material.id && deleteMaterial(material.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                  {materials.length === 0 && (
                    <div className="text-center py-8">
                      <BookOpen className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
                      <p className="text-muted-foreground">No materials uploaded</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="quizzes" className="mt-6">
            <Card className="glass">
              <CardHeader>
                <CardTitle>All Quizzes</CardTitle>
                <CardDescription>Quizzes created by teachers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {quizzes.map((quiz) => (
                    <div
                      key={quiz.id}
                      className="flex items-center justify-between p-4 rounded-lg bg-muted/50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-success/10">
                          <ClipboardList className="h-5 w-5 text-success" />
                        </div>
                        <div>
                          <p className="font-medium">{quiz.title}</p>
                          <p className="text-sm text-muted-foreground">
                            by {quiz.teacherName} • {quiz.questions.length} questions
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant={quiz.isPublished ? 'default' : 'secondary'}>
                          {quiz.isPublished ? (
                            <><CheckCircle2 className="h-3 w-3 mr-1" />Published</>
                          ) : (
                            <><XCircle className="h-3 w-3 mr-1" />Draft</>
                          )}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => deleteQuiz(quiz.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {quizzes.length === 0 && (
                    <div className="text-center py-8">
                      <ClipboardList className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
                      <p className="text-muted-foreground">No quizzes created</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default AdminContent;
