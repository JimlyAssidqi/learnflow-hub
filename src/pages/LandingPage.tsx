import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useRef, useEffect } from 'react';
import logo from '../../public/img/logo.png'
import {
  GraduationCap,
  BookOpen,
  ClipboardList,
  Users,
  MessageSquare,
  Download,
  ArrowRight,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

const features = [
  {
    icon: BookOpen,
    title: 'Materi Pembelajaran',
    description: 'Akses PDF, presentasi, dan video yang diunggah oleh guru.',
  },
  {
    icon: ClipboardList,
    title: 'Kuis Interaktif',
    description: 'Uji pengetahuan Anda dengan kuis yang dinilai otomatis dan umpan balik instan.',
  },
  {
    icon: MessageSquare,
    title: 'Forum Diskusi',
    description: 'Berinteraksi dengan guru dan teman melalui diskusi spesifik materi.',
  },
  {
    icon: Download,
    title: 'Akses Offline',
    description: 'Unduh materi dan belajar kapan saja, bahkan tanpa internet.',
  },
  {
    icon: Users,
    title: 'Pelacakan Kemajuan',
    description: 'Pantau perjalanan belajar Anda dengan analisis terperinci.',
  },
  {
    icon: Sparkles,
    title: 'Antarmuka Modern',
    description: 'Nikmati pengalaman belajar yang indah dan intuitif.',
  },
];

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed left-0 right-0 top-0 z-50 border-b border-border bg-card/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-primary">
              <GraduationCap className="h-5 w-5 text-primary-foreground" />
            </div>
            <p className='text-lg md:text-2xl font-bold'><span className='text-blue-600'>Era</span>Pintar.</p>
          </Link>
          <div className="flex items-center gap-3">
            {/* <Button className='text-blue-600' variant="ghost" asChild>
              <Link to="/login">Masuk</Link>
            </Button> */}
            <Button className='bg-blue-600 font-medium'>
              <Link to="/login">Masuk</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 md:py-52">
        <div className="container relative mx-auto px-4 text-center">
          <div className="animate-slide-up">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-6">
              <Sparkles className="h-4 w-4" />
              Modern E-Learning Platform
            </div>

            <h1 className="text-4xl md:text-6xl font-bold text-foreground max-w-4xl mx-auto leading-tight">
              Success Spirit{' '}
              <span className="text-blue-600 font-extrabold">Creative.</span>
            </h1>

            <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Akses kumpulan materi, evaluasi mandiri melalui kuis, sesi diskusi terjadwal, dan mudah diakses dimanapun untuk melanjutkan proses belajar.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" asChild className="text-base px-8">
                <Link to="/register">
                  Mulai Belajar
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* <section className="w-full min-h-screen flex items-center justify-center px-8 py-12">
        <div className="max-w-7xl w-full grid grid-cols-1 md:grid-cols-2 gap-16 items-center">

          <div>
            <h1 className="text-5xl md:text-6xl font-bold leading-tight text-gray-900">
              Success
              <span className="text-gray-700"> Spirit</span>
            </h1>

            <h1 className="text-5xl md:text-6xl font-bold leading-tight text-gray-400">
              Creative<span className="text-purple-500">.</span>
            </h1>

            <Link to="/register">
              <button className="mt-6 px-6 py-3 bg-blue-700 text-white rounded-full shadow-md hover:bg-blue-600 transition flex items-center gap-2">
                Lanjutkan belajar ⚡
              </button>
            </Link>

            <p className="mt-6 text-gray-600 text-lg max-w-lg">
              Selamat datang di Sistem Pembelajaran Daring Universitas Amikom Purwokerto.
            </p>

            <p className="text-purple-600 italic text-lg">
              Belajar begitu menyenangkan seperti bermain.
            </p>
          </div>

          <div className="flex justify-center">
            <img
              src={logo}
              alt="ELS Logo"
              className="w-[420px] md:w-[600px] drop-shadow-lg"
            />
          </div>

        </div>
      </section> */}

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Semua yang Anda Butuhkan untuk Belajar
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Fitur-fitur canggih yang dirancang untuk pendidikan modern
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card
                key={feature.title}
                className="glass glass-hover animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardContent className="p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 mb-4">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary">
                <GraduationCap className="h-4 w-4 text-primary-foreground" />
              </div>
              <p className='text-lg md:text-2xl font-bold'><span className='text-blue-600'>Era</span>Pintar.</p>

            </div>
            <p className="text-sm text-muted-foreground">
              © 2025 EraPintar. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
