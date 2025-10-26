import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';

interface LoginFormProps {
  activeView: 'login' | 'register';
  onLogin: (e: React.FormEvent) => void;
  onRegister: (e: React.FormEvent) => void;
  onSwitchView: (view: 'login' | 'register') => void;
}

export default function LoginForm({ activeView, onLogin, onRegister, onSwitchView }: LoginFormProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl mb-4 shadow-lg">
            <Icon name="Wallet" size={40} className="text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            NeoBank
          </h1>
          <p className="text-muted-foreground mt-2">Банк нового поколения</p>
        </div>

        <Card className="border-0 shadow-2xl backdrop-blur-xl bg-white/80">
          <CardHeader>
            <CardTitle className="text-2xl">{activeView === 'login' ? 'Вход' : 'Регистрация'}</CardTitle>
            <CardDescription>
              {activeView === 'login' 
                ? 'Войдите в свой аккаунт' 
                : 'Создайте новый аккаунт'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {activeView === 'login' ? (
              <form onSubmit={onLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email или логин</Label>
                  <Input id="email" name="email" placeholder="example@email.com" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Пароль</Label>
                  <Input id="password" name="password" type="password" required />
                </div>
                <Button type="submit" className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                  Войти
                </Button>
                <p className="text-sm text-center text-muted-foreground">
                  Нет аккаунта?{' '}
                  <button
                    type="button"
                    onClick={() => onSwitchView('register')}
                    className="text-purple-600 hover:underline font-medium"
                  >
                    Зарегистрироваться
                  </button>
                </p>
              </form>
            ) : (
              <form onSubmit={onRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Имя пользователя</Label>
                  <Input id="username" name="username" placeholder="username" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Полное имя</Label>
                  <Input id="name" name="name" placeholder="Иван Иванов" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-email">Email</Label>
                  <Input id="reg-email" name="reg-email" type="email" placeholder="example@email.com" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-password">Пароль</Label>
                  <Input id="reg-password" name="reg-password" type="password" required />
                </div>
                <Button type="submit" className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                  Создать аккаунт
                </Button>
                <p className="text-sm text-center text-muted-foreground">
                  Уже есть аккаунт?{' '}
                  <button
                    type="button"
                    onClick={() => onSwitchView('login')}
                    className="text-purple-600 hover:underline font-medium"
                  >
                    Войти
                  </button>
                </p>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}