import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getAllItems, addItem, updateItem, deleteItem } from '@/lib/db';
import { User, UserForAdmin, UserRole } from '@/types';
import { useToast } from '@/hooks/use-toast';
import {
  Users,
  Plus,
  Edit,
  Trash2,
  Search
} from 'lucide-react';
import { getUserApi, hapusUserApi, ubahUserApi } from '@/api/user';
import { registerUserApi } from '@/api/auth';

const roleColors = {
  admin: 'bg-destructive text-destructive-foreground',
  teacher: 'bg-primary text-primary-foreground',
  student: 'bg-accent text-accent-foreground',
};

const AdminUsers: React.FC = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<UserForAdmin[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserForAdmin | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student' as UserRole,
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    const allUsers = await getUserApi();
    const formattedUsers: UserForAdmin[] = allUsers.users.map((u: any) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      createdAt: u.created_at,
    }));
    setUsers(formattedUsers);
  };

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const resetForm = () => {
    setFormData({ name: '', email: '', password: '', role: 'student' });
    setEditingUser(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingUser) {
        // ========== UPDATE USER (opsional, backend belum ada) ==========
        const result = await ubahUserApi(editingUser.id, {
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          password: formData.password.trim(),  // jika API tidak perlu password, hapus baris ini
          role: formData.role,
        });
        if (result?.message || result?.user) {
          toast({
            title: "User updated successfully",
            description: editingUser.email,
          });

          // Reload users from backend
          const allUsers = await getUserApi();
          const formatted = allUsers.users.map((u: any) => ({
            id: u.id,
            name: u.name,
            email: u.email,
            role: u.role,
            createdAt: u.created_at,
          }));
          setUsers(formatted);
        } else {
          toast({
            title: "Failed to update user",
            description: result?.error || "Unknown error",
            variant: "destructive",
          });
        }
      } else {
        // ========== REGISTER USER ==========
        const result = await registerUserApi({
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          password: formData.password.trim(),
          role: formData.role,
        });

        if (result?.message || result?.user) {
          toast({
            title: "User registered successfully",
            description: formData.email,
          });

          // Reload users from backend
          const allUsers = await getUserApi();
          setUsers(allUsers.users);
        } else {
          toast({
            title: "Failed to create user",
            description: result?.error || "Unknown error",
            variant: "destructive",
          });
        }
      }

      setIsDialogOpen(false);
      resetForm();

    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong during registration",
        variant: "destructive",
      });
    }
  };


  const handleEdit = (user: UserForAdmin) => {
    setEditingUser(user);
    setFormData({ name: user.name, email: user.email, password: user.password, role: user.role });
    setIsDialogOpen(true);
  };

  const handleDelete = async (userId: number) => {
    await hapusUserApi(userId);
    loadUsers();
    toast({ title: 'User deleted successfully' });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">User Management</h1>
            <p className="text-muted-foreground mt-1">
              Create, edit, and manage user accounts
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingUser ? 'Edit User' : 'Add New User'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="John Doe"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="john@example.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="Buat password"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, role: value as UserRole }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="teacher">Teacher</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full">
                  {editingUser ? 'Update User' : 'Create User'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Users List */}
        <Card className="glass">
          <CardHeader>
            <CardTitle>All Users</CardTitle>
            <CardDescription>{users.length} total users</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className={roleColors[user.role]}>
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className={roleColors[user.role]}>
                      {user.role}
                    </Badge>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleEdit(user)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                        onClick={() => handleDelete(user.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              {filteredUsers.length === 0 && (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
                  <p className="text-muted-foreground">
                    {searchQuery ? 'No users found' : 'No users yet'}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdminUsers;
