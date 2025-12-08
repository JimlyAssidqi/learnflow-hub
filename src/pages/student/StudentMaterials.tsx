import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { getAllItems, addItem, getItem } from '@/lib/db';
import { Material, OfflineMaterial } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { 
  BookOpen, 
  Download, 
  FileText, 
  Presentation, 
  Video,
  Search,
  CheckCircle2,
  MessageSquare
} from 'lucide-react';
import { Link } from 'react-router-dom';

const typeIcons = {
  pdf: FileText,
  ppt: Presentation,
  video: Video,
};

const typeColors = {
  pdf: 'bg-destructive/10 text-destructive',
  ppt: 'bg-accent/10 text-accent-foreground',
  video: 'bg-info/10 text-info',
};

const StudentMaterials: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [offlineMaterials, setOfflineMaterials] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [downloading, setDownloading] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      const [allMaterials, allOffline] = await Promise.all([
        getAllItems<Material>('materials'),
        getAllItems<OfflineMaterial>('offlineMaterials'),
      ]);
      setMaterials(allMaterials);
      setOfflineMaterials(allOffline.map(o => o.materialId));
    };
    loadData();
  }, []);

  const filteredMaterials = materials.filter(m =>
    m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDownload = async (material: Material) => {
    setDownloading(material.id);
    
    try {
      // Simulate file download with a demo blob
      const demoContent = `This is a demo ${material.type.toUpperCase()} file for: ${material.title}\n\n${material.description}`;
      const blob = new Blob([demoContent], { type: 'text/plain' });
      
      // Save to offline storage
      const offlineMaterial: OfflineMaterial = {
        id: `offline-${material.id}`,
        materialId: material.id,
        title: material.title,
        fileName: material.fileName,
        fileBlob: blob,
        cachedAt: new Date().toISOString(),
      };

      await addItem('offlineMaterials', offlineMaterial);
      setOfflineMaterials(prev => [...prev, material.id]);
      
      // Trigger browser download
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = material.fileName;
      a.click();
      URL.revokeObjectURL(url);

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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Learning Materials</h1>
            <p className="text-muted-foreground mt-1">
              Browse and download study materials
            </p>
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
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMaterials.map((material) => {
            const Icon = typeIcons[material.type];
            const isOffline = offlineMaterials.includes(material.id);
            
            return (
              <Card key={material.id} className="glass glass-hover">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <Badge className={typeColors[material.type]}>
                      <Icon className="h-3 w-3 mr-1" />
                      {material.type.toUpperCase()}
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
                      <span>by {material.teacherName}</span>
                      <span>{formatFileSize(material.fileSize)}</span>
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

        {filteredMaterials.length === 0 && (
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
