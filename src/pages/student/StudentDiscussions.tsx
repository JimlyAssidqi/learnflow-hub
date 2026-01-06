import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  MessageSquare,
  Send,
  BookOpen,
  ArrowLeft
} from 'lucide-react';
import { getMataPelajaranApi } from '@/api/mataPelajaran';
import { getMessageApi, sendMessageApi } from '@/api/chat';
import echo from "@/lib/echo";

interface Subject {
  id: number;
  mata_pelajaran: string;
  teacher: {
    id: number;
    name: string;
  };
}

interface MessageData {
  id: number;
  id_mata_pelajaran: number;
  id_user: number;
  pesan: string;
  created_at: string;
  updated_at: string;
  user: {
    id: number;
    name: string;
    role: string;
  };
}

const StudentDiscussions: React.FC = () => {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [messages, setMessages] = useState<MessageData[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const loadSubjects = async () => {
      const response = await getMataPelajaranApi();
      setSubjects(response.data || []);
    };
    loadSubjects();
  }, []);
  useEffect(() => {
    if (selectedSubject) {
      loadMessages();
    }
  }, [selectedSubject]);
  const loadMessages = async () => {
    if (!selectedSubject) return;
    setLoading(true);
    try {
      const response = await getMessageApi(selectedSubject.id);
      setMessages(response?.data || []);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (!selectedSubject) return;
    const channelName = `diskusi.${selectedSubject.id}`;
    echo.channel(channelName)
      .listen(".diskusi.message", (e: any) => {
        setMessages((prev) => [...prev, e.diskusi]);
      });
    return () => {
      echo.leave(channelName);
    };
  }, [selectedSubject]);
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedSubject || !user) return;
    const message = {
      id_mata_pelajaran: String(selectedSubject.id),
      id_user: user.id,
      pesan: newMessage.trim(),
    };
    const response = await sendMessageApi(message);
    console.log(response)
    setNewMessage('');
  };
  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  const roleColors: Record<string, string> = {
    student: 'bg-accent',
    teacher: 'bg-blue-600 text-white',
    admin: 'bg-destructive',
  };
  const handleSelectSubject = (subject: Subject) => {
    setSelectedSubject(subject);
    setMessages([]);
  };
  const handleBack = () => {
    setSelectedSubject(null);
    setMessages([]);
  };
  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-10rem)]">
        {!selectedSubject ? (
          <div>
            <div className="mb-6">
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <MessageSquare className="h-6 w-6 text-primary" />
                Diskusi
              </h1>
              <p className="text-muted-foreground mt-1">Pilih mata pelajaran untuk melihat diskusi</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {subjects.map((subject) => (
                <Card
                  key={subject.id}
                  className="glass cursor-pointer hover:shadow-lg transition-all hover:scale-[1.02]"
                  onClick={() => handleSelectSubject(subject)}
                >
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-primary" />
                      {subject.mata_pelajaran}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Pengajar: {subject.teacher?.name || 'Tidak ada'}
                    </p>
                  </CardContent>
                </Card>
              ))}
              {subjects.length === 0 && (
                <p className="text-muted-foreground col-span-full text-center py-8">
                  Tidak ada mata pelajaran tersedia
                </p>
              )}
            </div>
          </div>
        ) : (
          <Card className="glass h-full flex flex-col">
            <CardHeader className="pb-3 border-b border-border">
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" onClick={handleBack}>
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-primary" />
                    {selectedSubject.mata_pelajaran}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Pengajar: {selectedSubject.teacher?.name}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
              <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                <div className="space-y-4">
                  {messages.map((msg) => {
                    const isOwn = msg.id_user === Number(user?.id);
                    return (
                      <div
                        key={msg.id}
                        className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : ''}`}
                      >
                        <Avatar className="h-8 w-8 shrink-0">
                          <AvatarFallback className={roleColors[msg.user?.role] || 'bg-muted'}>
                            {msg.user?.name?.split(' ').map(n => n[0]).join('') || '?'}
                          </AvatarFallback>
                        </Avatar>
                        <div className={`max-w-[70%] ${isOwn ? 'items-end' : 'items-start'} flex flex-col`}>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-medium">{msg.user?.name}</span>
                            <Badge variant="outline" className="text-[10px] py-0 px-1.5">
                              {msg.user?.role}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {formatTime(msg.created_at)}
                            </span>
                          </div>
                          <div className={`rounded-lg px-3 py-2 ${isOwn
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                            }`}>
                            <p className="text-sm">{msg.pesan}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={bottomRef} />
                  {messages.length === 0 && !loading && (
                    <div className="text-center py-12">
                      <MessageSquare className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
                      <p className="text-muted-foreground">
                        Belum ada pesan. Mulai diskusi!
                      </p>
                    </div>
                  )}
                </div>
              </ScrollArea>
              <div className="p-4 border-t border-border">
                <form
                  onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
                  className="flex gap-2"
                >
                  <Input
                    placeholder="Ketik pesan..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="flex-1"
                  />
                  <Button type="submit" disabled={!newMessage.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default StudentDiscussions;
