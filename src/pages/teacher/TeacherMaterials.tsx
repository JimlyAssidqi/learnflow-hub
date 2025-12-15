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
  Library,
  ArrowLeft,
  FileType,
  ChevronRight,
  BookOpenCheck
} from 'lucide-react';
import { getMataPelajaranApi, getMataPelajaranByGuruApi } from '@/api/mataPelajaran';
import { getMateriByGuruAndMapelApi, getMateriByMataPelajaranApi, hapusMateriApi, tambahMateriApi } from '@/api/materi';
import { Link } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL;

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
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'pdf' as 'pdf' | 'ppt' | 'video',
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    loadSubjects();
  }, []);
  
  const loadSubjects = async () => {
    const allSubjects = await getMataPelajaranByGuruApi(user?.id || '');
    setSubjects(allSubjects.data);
  };

  useEffect(() => {
    loadMaterials();
  }, [user, selectedSubject]);
  
  const loadMaterials = async () => {
    if (!user || !selectedSubject) return;
    // const response = await getMateriByMataPelajaranApi(selectedSubject.id);
    const response = await getMateriByGuruAndMapelApi(user.id, selectedSubject.id);
    setMaterials(response.materi);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (ext === 'pdf') setFormData(prev => ({ ...prev, type: 'pdf' }));
      else if (['ppt', 'pptx'].includes(ext || '')) setFormData(prev => ({ ...prev, type: 'ppt' }));
      else if (['mp4', 'webm', 'mov'].includes(ext || '')) setFormData(prev => ({ ...prev, type: 'video' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedFile || !selectedSubject) return;

    const formDataApi = new FormData();
    formDataApi.append("mata_pelajaran_id", String(selectedSubject.id));
    formDataApi.append("teacher_id", String(user.id));
    formDataApi.append("title", formData.title);
    formDataApi.append("description", formData.description);
    formDataApi.append("file", selectedFile); // <--- PENTING: FILE ASLI, BUKAN NAMA FILE

    await tambahMateriApi(formDataApi);
    loadMaterials();

    setIsDialogOpen(false);
    setFormData({ title: "", description: "", type: "pdf" });
    setSelectedFile(null);

    toast({
      title: "Material uploaded!",
      description: "Students can now access this material.",
    });
  };


  const handleDelete = async (materialId: number) => {
    await hapusMateriApi(materialId);
    loadMaterials();
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

  // Subject Selection View
  if (!selectedSubject) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Learning Materials</h1>
            <p className="text-muted-foreground mt-1">
              Pilih mata pelajaran untuk mengelola materi
            </p>
          </div>

          {subjects.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {subjects.map((subject) => (
                <Card
                  key={subject.id}
                  className="glass glass-hover cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
                  onClick={() => setSelectedSubject(subject)}
                >
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-xl bg-primary/10">
                        <Library className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{subject.mata_pelajaran}</CardTitle>
                        <CardDescription>Klik untuk kelola materi</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="glass">
              <CardContent className="py-12">
                <div className="text-center">
                  <Library className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground">Belum ada mata pelajaran</h3>
                  <p className="text-muted-foreground mt-1">
                    Hubungi admin untuk menambahkan mata pelajaran.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DashboardLayout>
    );
  }

  // Materials View for Selected Subject
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => setSelectedSubject(null)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-bold text-foreground">{selectedSubject.mata_pelajaran}</h1>
                <Badge variant="secondary">
                  <Library className="h-3 w-3 mr-1" />
                  Mata Pelajaran
                </Badge>
              </div>
              <p className="text-muted-foreground mt-1">
                Kelola materi untuk mata pelajaran ini
              </p>
            </div>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Upload Materi
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload Materi Baru</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <p className="text-sm font-medium text-primary">
                    Mata Pelajaran: {selectedSubject.mata_pelajaran}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="title">Judul Materi</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Contoh: Pengenalan React"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Deskripsi</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Deskripsi singkat tentang materi..."
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Tipe Materi</Label>
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
                        {selectedFile ? selectedFile.name : 'Klik untuk upload atau drag and drop'}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        PDF, PPT, atau Video (max 50MB)
                      </p>
                    </label>
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={!selectedFile}>
                  Upload Materi
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Materials Grid */}
        {materials.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {materials.map((material) => {
              const Icon = typeIcons[material.file_type] ?? FileType; 
              return (
                <Card key={material.id} className="glass glass-hover">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <Badge variant="secondary">
                        <Icon className="h-3 w-3 mr-1" />
                        {material.file_type.toUpperCase()}
                      </Badge>
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
                      <Link
                        to={`${API_URL}/${material.file_url}`}
                        target="_blank"
                        rel="noopener noreferrer">
                          <span className="flex items-center gap-1 underline">
                            <BookOpen className="h-4 w-4" />
                            {material.downloadCount} buka
                          </span>
                        </Link>
                      {/* <span>{formatFileSize(material.fileSize)}</span> */}
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
                <h3 className="text-lg font-medium text-foreground">Belum ada materi</h3>
                <p className="text-muted-foreground mt-1">
                  Upload materi pertama untuk mata pelajaran ini.
                </p>
                <Button className="mt-4" onClick={() => setIsDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Upload Materi
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
