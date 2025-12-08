import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { getAllItems, addItem, getItemsByIndex } from '@/lib/db';
import { Material, ChatMessage } from '@/types';
import { 
  MessageSquare, 
  Send,
  BookOpen
} from 'lucide-react';

const StudentDiscussions: React.FC = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadMaterials = async () => {
      const allMaterials = await getAllItems<Material>('materials');
      setMaterials(allMaterials);
      
      const materialParam = searchParams.get('material');
      if (materialParam) {
        const found = allMaterials.find(m => m.id === materialParam);
        if (found) setSelectedMaterial(found);
      }
    };
    loadMaterials();
  }, [searchParams]);

  useEffect(() => {
    const loadMessages = async () => {
      if (!selectedMaterial) return;
      const materialMessages = await getItemsByIndex<ChatMessage>(
        'chatMessages', 
        'materialId', 
        selectedMaterial.id
      );
      setMessages(materialMessages.sort((a, b) => 
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      ));
    };
    loadMessages();
  }, [selectedMaterial]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedMaterial || !user) return;

    const message: ChatMessage = {
      id: `msg-${Date.now()}`,
      materialId: selectedMaterial.id,
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      message: newMessage.trim(),
      createdAt: new Date().toISOString(),
    };

    await addItem('chatMessages', message);
    setMessages(prev => [...prev, message]);
    setNewMessage('');
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const roleColors = {
    student: 'bg-accent',
    teacher: 'bg-primary',
    admin: 'bg-destructive',
  };

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-10rem)]">
        <div className="grid md:grid-cols-3 gap-6 h-full">
          {/* Materials List */}
          <Card className="glass md:col-span-1">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                Materials
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[calc(100vh-16rem)]">
                <div className="space-y-2 pr-4">
                  {materials.map((material) => (
                    <button
                      key={material.id}
                      onClick={() => setSelectedMaterial(material)}
                      className={`w-full text-left p-3 rounded-lg transition-colors ${
                        selectedMaterial?.id === material.id
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-muted'
                      }`}
                    >
                      <p className="font-medium text-sm truncate">{material.title}</p>
                      <p className={`text-xs mt-1 ${
                        selectedMaterial?.id === material.id
                          ? 'text-primary-foreground/80'
                          : 'text-muted-foreground'
                      }`}>
                        by {material.teacherName}
                      </p>
                    </button>
                  ))}
                  {materials.length === 0 && (
                    <p className="text-center text-muted-foreground py-4">
                      No materials available
                    </p>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Chat Area */}
          <Card className="glass md:col-span-2 flex flex-col">
            <CardHeader className="pb-3 border-b border-border">
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                {selectedMaterial ? selectedMaterial.title : 'Select a material'}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col p-0">
              {selectedMaterial ? (
                <>
                  {/* Messages */}
                  <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                    <div className="space-y-4">
                      {messages.map((msg) => {
                        const isOwn = msg.userId === user?.id;
                        return (
                          <div
                            key={msg.id}
                            className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : ''}`}
                          >
                            <Avatar className="h-8 w-8 shrink-0">
                              <AvatarFallback className={roleColors[msg.userRole]}>
                                {msg.userName.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div className={`max-w-[70%] ${isOwn ? 'items-end' : 'items-start'} flex flex-col`}>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-medium">{msg.userName}</span>
                                <Badge variant="outline" className="text-[10px] py-0 px-1.5">
                                  {msg.userRole}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {formatTime(msg.createdAt)}
                                </span>
                              </div>
                              <div className={`rounded-lg px-3 py-2 ${
                                isOwn 
                                  ? 'bg-primary text-primary-foreground' 
                                  : 'bg-muted'
                              }`}>
                                <p className="text-sm">{msg.message}</p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      {messages.length === 0 && (
                        <div className="text-center py-12">
                          <MessageSquare className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
                          <p className="text-muted-foreground">
                            No messages yet. Start the discussion!
                          </p>
                        </div>
                      )}
                    </div>
                  </ScrollArea>

                  {/* Message Input */}
                  <div className="p-4 border-t border-border">
                    <form 
                      onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
                      className="flex gap-2"
                    >
                      <Input
                        placeholder="Type your message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        className="flex-1"
                      />
                      <Button type="submit" disabled={!newMessage.trim()}>
                        <Send className="h-4 w-4" />
                      </Button>
                    </form>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <MessageSquare className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      Select a material to view its discussion
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentDiscussions;
