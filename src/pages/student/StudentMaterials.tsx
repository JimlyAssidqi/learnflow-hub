import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { getAllItems, addItem } from '@/lib/db';
import { Material, OfflineMaterial, Subject } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { 
  BookOpen, 
  Download, 
  FileText, 
  Presentation, 
  Video,
  Search,
  CheckCircle2,
  MessageSquare,
  Library,
  ArrowLeft,
  FileType
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { getMataPelajaranApi } from '@/api/mataPelajaran';
import { getMateriByMataPelajaranApi } from '@/api/materi';

const API_URL = import.meta.env.VITE_API_URL;

const typeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  pdf: FileText,
  ppt: Presentation,
  video: Video,
};

const typeColors: Record<string, string> = {
  pdf: 'bg-destructive/10 text-destructive',
  ppt: 'bg-accent/10 text-accent-foreground',
  video: 'bg-info/10 text-info',
};

const StudentMaterials: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [offlineMaterials, setOfflineMaterials] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [downloading, setDownloading] = useState<number | null>(null);

  useEffect(() => {
    loadSubjects();
    loadOfflineMaterials();
  }, []);

  const loadSubjects = async () => {
    const response = await getMataPelajaranApi();
    setSubjects(response.data);
  };

  const loadOfflineMaterials = async () => {
    const allOffline = await getAllItems<OfflineMaterial>('offlineMaterials');
    setOfflineMaterials(allOffline.map(o => o.materialId));
  };

  useEffect(() => {
    if (selectedSubject) {
      loadMaterials();
    }
  }, [selectedSubject]);

  const loadMaterials = async () => {
    if (!selectedSubject) return;
    const response = await getMateriByMataPelajaranApi(selectedSubject.id);
    setMaterials(response.materi);
  };

  const filteredMaterials = materials.filter(m =>
    m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDownload = async (material: Material) => {
    if (!material.id) return;
    setDownloading(material.id);
    
    try {
      // Open file in new tab for download
      window.open(`${API_URL}/${material.file_url}`, '_blank');

      // Save to offline storage
      const offlineMaterial: OfflineMaterial = {
        id: `offline-${material.id}`,
        materialId: String(material.id),
        title: material.title,
        fileName: material.fileName || material.file,
        fileBlob: new Blob(),
        cachedAt: new Date().toISOString(),
      };

      await addItem('offlineMaterials', offlineMaterial);
      setOfflineMaterials(prev => [...prev, String(material.id)]);

      toast({
        title: 'Downloaded successfully!',
        description: 'Material saved for offline access.',
      });
    } catch (error) {
      toast({
        title: 'Download failed',
        description: 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setDownloading(null);
    }
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
              Pilih mata pelajaran untuk melihat materi
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
                        <CardDescription>Klik untuk lihat materi</CardDescription>
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
                    Silakan hubungi admin atau guru.
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
                Browse and download study materials
              </p>
            </div>
          </div>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search materials..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Materials Grid */}
        {filteredMaterials.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMaterials.map((material) => {
              const Icon = typeIcons[material.file_type || ''] ?? FileType;
              const isOffline = offlineMaterials.includes(String(material.id));
              
              return (
                <Card key={material.id} className="glass glass-hover">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <Badge className={typeColors[material.file_type || ''] || 'bg-secondary'}>
                        <Icon className="h-3 w-3 mr-1" />
                        {(material.file_type || 'file').toUpperCase()}
                      </Badge>
                      {isOffline && (
                        <Badge variant="outline" className="text-success border-success">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Saved
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-lg mt-2">{material.title}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {material.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>by {material.teacherName || 'Teacher'}</span>
                        {material.fileSize && <span>{formatFileSize(material.fileSize)}</span>}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          className="flex-1"
                          onClick={() => handleDownload(material)}
                          disabled={downloading === material.id}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          {downloading === material.id ? 'Downloading...' : 'Download'}
                        </Button>
                        <Button variant="outline" size="icon" asChild>
                          <Link to={`/student/discussions?material=${material.id}`}>
                            <MessageSquare className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground">No materials found</h3>
            <p className="text-muted-foreground mt-1">
              {searchQuery ? 'Try a different search term' : 'Check back later for new content'}
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default StudentMaterials;
