import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getItemsByIndex, addItem, deleteItem, getAllItems } from '@/lib/db';
import { Material, Subject } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { 
  BookOpen, 
  Plus, 
  FileText, 
  Presentation, 
  Video,
  Upload,
  Trash2,
  Download,
  Library
} from 'lucide-react';

const typeIcons = {
  pdf: FileText,
  ppt: Presentation,
  video: Video,
};

const TeacherMaterials: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'pdf' as 'pdf' | 'ppt' | 'video',
    subjectId: '',
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;
      const [userMaterials, allSubjects] = await Promise.all([
        getItemsByIndex<Material>('materials', 'teacherId', user.id),
        getAllItems<Subject>('subjects')
      ]);
      setMaterials(userMaterials);
      setSubjects(allSubjects);
    };
    loadData();
  }, [user]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Auto-detect type from extension
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (ext === 'pdf') setFormData(prev => ({ ...prev, type: 'pdf' }));
      else if (['ppt', 'pptx'].includes(ext || '')) setFormData(prev => ({ ...prev, type: 'ppt' }));
      else if (['mp4', 'webm', 'mov'].includes(ext || '')) setFormData(prev => ({ ...prev, type: 'video' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedFile || !formData.subjectId) return;

    const selectedSubject = subjects.find(s => String(s.id) === formData.subjectId);
    
    const newMaterial: Material = {
      id: `material-${Date.now()}`,
      title: formData.title,
      description: formData.description,
      type: formData.type,
      fileName: selectedFile.name,
      fileSize: selectedFile.size,
      fileUrl: '',
      teacherId: user.id,
      teacherName: user.name,
      createdAt: new Date().toISOString(),
      downloadCount: 0,
      subjectId: formData.subjectId,
      subjectName: selectedSubject?.mata_pelajaran || '',
    };

    await addItem('materials', newMaterial);
    setMaterials(prev => [...prev, newMaterial]);
    setIsDialogOpen(false);
    setFormData({ title: '', description: '', type: 'pdf', subjectId: '' });
    setSelectedFile(null);

    toast({
      title: 'Material uploaded!',
      description: 'Students can now access this material.',
    });
  };

  const handleDelete = async (materialId: string) => {
    await deleteItem('materials', materialId);
    setMaterials(prev => prev.filter(m => m.id !== materialId));
    toast({
      title: 'Material deleted',
      description: 'The material has been removed.',
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Learning Materials</h1>
            <p className="text-muted-foreground mt-1">
              Upload and manage your course materials
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Upload Material
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload New Material</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="subject">Mata Pelajaran</Label>
                  <Select
                    value={formData.subjectId}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, subjectId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih mata pelajaran..." />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.length > 0 ? (
                        subjects.map((subject) => (
                          <SelectItem key={subject.id} value={String(subject.id)}>
                            {subject.mata_pelajaran}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="none" disabled>
                          Belum ada mata pelajaran
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., Introduction to React"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Brief description of the material..."
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Material Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as any }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">PDF Document</SelectItem>
                      <SelectItem value="ppt">Presentation</SelectItem>
                      <SelectItem value="video">Video</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="file">File</Label>
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                    <input
                      id="file"
                      type="file"
                      className="hidden"
                      accept=".pdf,.ppt,.pptx,.mp4,.webm,.mov"
                      onChange={handleFileChange}
                    />
                    <label htmlFor="file" className="cursor-pointer">
                      <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">
                        {selectedFile ? selectedFile.name : 'Click to upload or drag and drop'}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        PDF, PPT, or Video (max 50MB)
                      </p>
                    </label>
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={!selectedFile || !formData.subjectId}>
                  Upload Material
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Materials Grid */}
        {materials.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {materials.map((material) => {
              const Icon = typeIcons[material.type];
              return (
                <Card key={material.id} className="glass glass-hover">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex gap-2 flex-wrap">
                        <Badge variant="secondary">
                          <Icon className="h-3 w-3 mr-1" />
                          {material.type.toUpperCase()}
                        </Badge>
                        {material.subjectName && (
                          <Badge variant="outline" className="text-primary border-primary">
                            <Library className="h-3 w-3 mr-1" />
                            {material.subjectName}
                          </Badge>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                        onClick={() => handleDelete(material.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <CardTitle className="text-lg mt-2">{material.title}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {material.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Download className="h-4 w-4" />
                        {material.downloadCount} downloads
                      </span>
                      <span>{formatFileSize(material.fileSize)}</span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="glass">
            <CardContent className="py-12">
              <div className="text-center">
                <BookOpen className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground">No materials yet</h3>
                <p className="text-muted-foreground mt-1">
                  Upload your first learning material to get started.
                </p>
                <Button className="mt-4" onClick={() => setIsDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Upload Material
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default TeacherMaterials;
