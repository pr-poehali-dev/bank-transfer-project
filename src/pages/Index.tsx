import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

interface BankCard {
  id: string;
  number: string;
  balance: number;
  type: 'virtual' | 'physical';
  color: string;
  owner: string;
}

interface Transaction {
  id: string;
  type: 'incoming' | 'outgoing';
  amount: number;
  recipient: string;
  date: string;
  status: 'completed' | 'pending';
}

export default function Index() {
  const { toast } = useToast();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeView, setActiveView] = useState<'login' | 'register' | 'dashboard'>('login');
  const [currentUser, setCurrentUser] = useState('');
  
  const [cards, setCards] = useState<BankCard[]>([
    {
      id: '1',
      number: '4532 •••• •••• 8901',
      balance: 125430.50,
      type: 'virtual',
      color: 'from-purple-500 to-pink-500',
      owner: 'Алексей Иванов'
    },
    {
      id: '2',
      number: '5421 •••• •••• 3456',
      balance: 48250.00,
      type: 'physical',
      color: 'from-blue-500 to-cyan-500',
      owner: 'Алексей Иванов'
    }
  ]);

  const [transactions, setTransactions] = useState<Transaction[]>([
    { id: '1', type: 'incoming', amount: 15000, recipient: 'Мария Петрова', date: '2025-10-26 14:30', status: 'completed' },
    { id: '2', type: 'outgoing', amount: 3200, recipient: 'Ozon', date: '2025-10-26 12:15', status: 'completed' },
    { id: '3', type: 'outgoing', amount: 850, recipient: 'Starbucks', date: '2025-10-25 18:45', status: 'completed' },
    { id: '4', type: 'incoming', amount: 52000, recipient: 'Зарплата', date: '2025-10-25 09:00', status: 'completed' },
  ]);

  const [transferAmount, setTransferAmount] = useState('');
  const [transferRecipient, setTransferRecipient] = useState('');
  const [selectedCard, setSelectedCard] = useState('1');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    
    if (email === 'XeX' && password === '18181818') {
      setIsLoggedIn(true);
      setIsAdmin(true);
      setCurrentUser('XeX');
      setActiveView('dashboard');
      toast({
        title: "Добро пожаловать, Администратор! 👑",
        description: "Вы вошли с правами администратора",
      });
    } else {
      setIsLoggedIn(true);
      setIsAdmin(false);
      setCurrentUser(email);
      setActiveView('dashboard');
      toast({
        title: "Добро пожаловать! 👋",
        description: "Вы успешно вошли в систему",
      });
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggedIn(true);
    setActiveView('dashboard');
    toast({
      title: "Регистрация завершена! 🎉",
      description: "Ваш аккаунт успешно создан",
    });
  };

  const handleTransfer = () => {
    if (!transferAmount || !transferRecipient) {
      toast({
        title: "Ошибка",
        description: "Заполните все поля",
        variant: "destructive",
      });
      return;
    }

    const newTransaction: Transaction = {
      id: String(Date.now()),
      type: 'outgoing',
      amount: parseFloat(transferAmount),
      recipient: transferRecipient,
      date: new Date().toLocaleString('ru-RU'),
      status: 'completed'
    };

    setTransactions([newTransaction, ...transactions]);
    
    const updatedCards = cards.map(card => 
      card.id === selectedCard 
        ? { ...card, balance: card.balance - parseFloat(transferAmount) }
        : card
    );
    setCards(updatedCards);

    toast({
      title: "Перевод выполнен! ✅",
      description: `${transferAmount} ₽ отправлено получателю ${transferRecipient}`,
    });

    setTransferAmount('');
    setTransferRecipient('');
  };

  const handleIssueCard = () => {
    const colors = [
      'from-orange-500 to-red-500',
      'from-green-500 to-emerald-500',
      'from-indigo-500 to-purple-500',
      'from-yellow-500 to-orange-500'
    ];
    
    const newCard: BankCard = {
      id: String(Date.now()),
      number: `${Math.floor(1000 + Math.random() * 9000)} •••• •••• ${Math.floor(1000 + Math.random() * 9000)}`,
      balance: 0,
      type: 'virtual',
      color: colors[Math.floor(Math.random() * colors.length)],
      owner: 'Алексей Иванов'
    };

    setCards([...cards, newCard]);
    toast({
      title: "Карта выпущена! 💳",
      description: "Виртуальная карта успешно создана",
    });
  };

  if (!isLoggedIn) {
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
                <form onSubmit={handleLogin} className="space-y-4">
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
                      onClick={() => setActiveView('register')}
                      className="text-purple-600 hover:underline font-medium"
                    >
                      Зарегистрироваться
                    </button>
                  </p>
                </form>
              ) : (
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Имя</Label>
                    <Input id="name" placeholder="Иван Иванов" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-email">Email</Label>
                    <Input id="reg-email" type="email" placeholder="example@email.com" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-password">Пароль</Label>
                    <Input id="reg-password" type="password" required />
                  </div>
                  <Button type="submit" className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                    Создать аккаунт
                  </Button>
                  <p className="text-sm text-center text-muted-foreground">
                    Уже есть аккаунт?{' '}
                    <button
                      type="button"
                      onClick={() => setActiveView('login')}
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

  const totalBalance = cards.reduce((sum, card) => sum + card.balance, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
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

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 animate-fade-in">
          <h2 className="text-3xl font-bold mb-2">Добро пожаловать! 👋</h2>
          <p className="text-muted-foreground">Управляйте своими финансами легко и удобно</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3 mb-8 animate-slide-up">
          <Card className="bg-gradient-to-br from-purple-500 to-pink-500 text-white border-0 shadow-xl">
            <CardHeader>
              <CardDescription className="text-purple-100">Общий баланс</CardDescription>
              <CardTitle className="text-4xl font-bold">
                {totalBalance.toLocaleString('ru-RU')} ₽
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-purple-100">
                <Icon name="TrendingUp" size={16} />
                <span>+12.5% за месяц</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <CardDescription>Карт активно</CardDescription>
              <CardTitle className="text-4xl font-bold">{cards.length}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Icon name="CreditCard" size={16} />
                <span>{cards.filter(c => c.type === 'virtual').length} виртуальных</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <CardDescription>Операций за месяц</CardDescription>
              <CardTitle className="text-4xl font-bold">{transactions.length}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Icon name="ArrowRightLeft" size={16} />
                <span>Все выполнены</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="cards" className="space-y-6">
          <TabsList className="bg-white/80 backdrop-blur-xl p-1">
            <TabsTrigger value="cards" className="gap-2">
              <Icon name="CreditCard" size={16} />
              Карты
            </TabsTrigger>
            <TabsTrigger value="transfer" className="gap-2">
              <Icon name="Send" size={16} />
              Переводы
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-2">
              <Icon name="History" size={16} />
              История
            </TabsTrigger>
          </TabsList>

          <TabsContent value="cards" className="space-y-6 animate-scale-in">
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-bold">Мои карты</h3>
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                    <Icon name="Plus" size={18} />
                    Выпустить карту
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Выпуск новой карты</DialogTitle>
                    <DialogDescription>
                      Создайте виртуальную карту для онлайн-покупок
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Тип карты</Label>
                      <Select defaultValue="virtual">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="virtual">Виртуальная карта</SelectItem>
                          <SelectItem value="physical">Физическая карта</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button onClick={handleIssueCard} className="w-full bg-gradient-to-r from-purple-500 to-pink-500">
                      Выпустить карту
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {cards.map((card, index) => (
                <Card 
                  key={card.id} 
                  className={`border-0 shadow-xl bg-gradient-to-br ${card.color} text-white overflow-hidden relative hover:scale-105 transition-transform`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardDescription className="text-white/80 text-xs">
                          {card.type === 'virtual' ? 'Виртуальная' : 'Физическая'}
                        </CardDescription>
                        <CardTitle className="text-white mt-1">{card.owner}</CardTitle>
                      </div>
                      <Icon name="CreditCard" size={32} className="text-white/40" />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="font-mono text-xl tracking-wider">
                      {card.number}
                    </div>
                    <Separator className="bg-white/20" />
                    <div>
                      <div className="text-xs text-white/80 mb-1">Баланс</div>
                      <div className="text-3xl font-bold">
                        {card.balance.toLocaleString('ru-RU')} ₽
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="transfer" className="animate-scale-in">
            <Card className="max-w-2xl mx-auto border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="text-2xl">Новый перевод</CardTitle>
                <CardDescription>Отправьте деньги на карту или по номеру телефона</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Карта списания</Label>
                  <Select value={selectedCard} onValueChange={setSelectedCard}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {cards.map(card => (
                        <SelectItem key={card.id} value={card.id}>
                          {card.number} - {card.balance.toLocaleString('ru-RU')} ₽
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Получатель</Label>
                  <Input 
                    placeholder="Номер карты или телефона"
                    value={transferRecipient}
                    onChange={(e) => setTransferRecipient(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Сумма перевода</Label>
                  <Input 
                    type="number"
                    placeholder="0.00"
                    value={transferAmount}
                    onChange={(e) => setTransferAmount(e.target.value)}
                  />
                </div>

                <Button 
                  onClick={handleTransfer}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-lg h-12"
                >
                  <Icon name="Send" size={20} className="mr-2" />
                  Отправить перевод
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="animate-scale-in">
            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="text-2xl">История операций</CardTitle>
                <CardDescription>Все ваши транзакции за последнее время</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {transactions.map((transaction) => (
                    <div 
                      key={transaction.id}
                      className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-purple-50 to-pink-50 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          transaction.type === 'incoming' 
                            ? 'bg-green-100 text-green-600' 
                            : 'bg-orange-100 text-orange-600'
                        }`}>
                          <Icon 
                            name={transaction.type === 'incoming' ? 'ArrowDownLeft' : 'ArrowUpRight'} 
                            size={24} 
                          />
                        </div>
                        <div>
                          <p className="font-semibold">{transaction.recipient}</p>
                          <p className="text-sm text-muted-foreground">{transaction.date}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-xl font-bold ${
                          transaction.type === 'incoming' ? 'text-green-600' : 'text-orange-600'
                        }`}>
                          {transaction.type === 'incoming' ? '+' : '-'}
                          {transaction.amount.toLocaleString('ru-RU')} ₽
                        </p>
                        <Badge variant={transaction.status === 'completed' ? 'default' : 'secondary'}>
                          {transaction.status === 'completed' ? 'Выполнено' : 'В обработке'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}