import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface DashboardHeaderProps {
  isAdmin: boolean;
}

export default function DashboardHeader({ isAdmin }: DashboardHeaderProps) {
  return (
    <header className="bg-white/80 backdrop-blur-xl border-b sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl">
            <Icon name="Wallet" size={24} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            NeoBank
          </h1>
        </div>
        
        <div className="flex items-center gap-4">
          {isAdmin && (
            <Button variant="outline" className="gap-2">
              <Icon name="Settings" size={18} />
              Админ-панель
            </Button>
          )}
          <Button variant="ghost" className="gap-2">
            <Icon name="User" size={18} />
            Профиль
          </Button>
        </div>
      </div>
    </header>
  );
}
