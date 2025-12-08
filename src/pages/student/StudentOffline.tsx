import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getAllItems, deleteItem } from '@/lib/db';
import { OfflineMaterial } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { 
  Download, 
  FileText, 
  Trash2,
  FolderOpen,
  WifiOff
} from 'lucide-react';

const StudentOffline: React.FC = () => {
  const { toast } = useToast();
  const [offlineMaterials, setOfflineMaterials] = useState<OfflineMaterial[]>([]);

  useEffect(() => {
    const loadOffline = async () => {
      const materials = await getAllItems<OfflineMaterial>('offlineMaterials');
      setOfflineMaterials(materials);
    };
    loadOffline();
  }, []);

  const openMaterial = (material: OfflineMaterial) => {
    const url = URL.createObjectURL(material.fileBlob);
    window.open(url, '_blank');
  };

  const removeMaterial = async (materialId: string) => {
    await deleteItem('offlineMaterials', materialId);
    setOfflineMaterials(prev => prev.filter(m => m.id !== materialId));
    toast({
      title: 'Removed from offline',
      description: 'Material deleted from local storage.',
    });
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatSize = (blob: Blob) => {
    const bytes = blob.size;
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
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <WifiOff className="h-8 w-8 text-primary" />
              Offline Materials
            </h1>
            <p className="text-muted-foreground mt-1">
              Access your downloaded materials without internet
            </p>
          </div>
          <Badge variant="secondary" className="w-fit">
            {offlineMaterials.length} saved
          </Badge>
        </div>

        {/* Materials Grid */}
        {offlineMaterials.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {offlineMaterials.map((material) => (
              <Card key={material.id} className="glass glass-hover">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base truncate">
                        {material.title}
                      </CardTitle>
                      <CardDescription className="truncate">
                        {material.fileName}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>Saved {formatDate(material.cachedAt)}</span>
                      <span>{formatSize(material.fileBlob)}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        className="flex-1"
                        onClick={() => openMaterial(material)}
                      >
                        <FolderOpen className="h-4 w-4 mr-2" />
                        Open
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => removeMaterial(material.id)}
                        className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="glass">
            <CardContent className="py-12">
              <div className="text-center">
                <Download className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground">
                  No offline materials
                </h3>
                <p className="text-muted-foreground mt-1 max-w-sm mx-auto">
                  Download materials from the Materials page to access them offline.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Info Card */}
        <Card className="bg-muted/50 border-dashed">
          <CardContent className="py-4">
            <div className="flex items-start gap-3">
              <WifiOff className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium text-foreground">Offline Access</p>
                <p className="text-sm text-muted-foreground">
                  Downloaded materials are stored in your browser and can be accessed 
                  even without an internet connection. They will persist until you 
                  clear your browser data or remove them manually.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default StudentOffline;
