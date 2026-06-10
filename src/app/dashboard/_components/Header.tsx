// src/app/dashboard/_components/Header.tsx
'use client';

import { useAuth } from '@/firebase/provider';
import { signOut } from 'firebase/auth';
import { auth } from '@/firebase/config';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LogOut, User } from 'lucide-react';

export function Header() {
  const { currentUser, userData } = useAuth();

  const handleLogout = async () => {
    await signOut(auth);
  };

  return (
    <header className="h-16 border-b border-zinc-800 bg-zinc-900 px-6 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <h2 className="text-xl font-semibold text-zinc-100">
          {userData?.barId ? `Bar: ${userData.name}` : 'Dashboard'}
        </h2>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-sm font-medium">{userData?.name || currentUser?.email}</p>
          <p className="text-xs text-emerald-500 capitalize">{userData?.role}</p>
        </div>

        <Avatar>
          <AvatarImage src={userData?.avatarUrl} />
          <AvatarFallback>
            <User className="w-5 h-5" />
          </AvatarFallback>
        </Avatar>

        <Button 
          variant="ghost" 
          size="icon"
          onClick={handleLogout}
          className="text-zinc-400 hover:text-red-400"
        >
          <LogOut className="w-5 h-5" />
        </Button>
      </div>
    </header>
  );
}