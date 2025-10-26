import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import LoginForm from '@/components/LoginForm';
import DashboardHeader from '@/components/DashboardHeader';
import StatsCards from '@/components/StatsCards';
import CardsTab from '@/components/CardsTab';
import TransferTab from '@/components/TransferTab';
import HistoryTab from '@/components/HistoryTab';

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

const AUTH_API = 'https://functions.poehali.dev/920a2dcf-5083-486d-b287-86ac496b21f0';

export default function Index() {
  const { toast } = useToast();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeView, setActiveView] = useState<'login' | 'register' | 'dashboard'>('login');
  const [currentUser, setCurrentUser] = useState('');
  const [userId, setUserId] = useState<number | null>(null);
  
  const [cards, setCards] = useState<BankCard[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const [transferAmount, setTransferAmount] = useState('');
  const [transferRecipient, setTransferRecipient] = useState('');
  const [selectedCard, setSelectedCard] = useState('1');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const username = formData.get('email') as string;
    const password = formData.get('password') as string;
    
    try {
      const response = await fetch(AUTH_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'login', username, password })
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        setIsLoggedIn(true);
        setIsAdmin(data.user.is_admin);
        setCurrentUser(data.user.username);
        setUserId(data.user.id);
        setActiveView('dashboard');
        
        toast({
          title: data.user.is_admin ? "Добро пожаловать, Администратор! 👑" : "Добро пожаловать! 👋",
          description: data.user.is_admin ? "Вы вошли с правами администратора" : "Вы успешно вошли в систему",
        });
      } else {
        toast({
          title: "Ошибка входа",
          description: data.error || "Неверные учетные данные",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось подключиться к серверу",
        variant: "destructive",
      });
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const username = formData.get('username') as string;
    const email = formData.get('reg-email') as string;
    const password = formData.get('reg-password') as string;
    const full_name = formData.get('name') as string;
    
    try {
      const response = await fetch(AUTH_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'register', username, email, password, full_name })
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        setIsLoggedIn(true);
        setIsAdmin(data.user.is_admin);
        setCurrentUser(data.user.username);
        setUserId(data.user.id);
        setActiveView('dashboard');
        
        toast({
          title: "Регистрация завершена! 🎉",
          description: "Ваш аккаунт успешно создан",
        });
      } else {
        toast({
          title: "Ошибка регистрации",
          description: data.error || "Пользователь уже существует",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось подключиться к серверу",
        variant: "destructive",
      });
    }
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
      <LoginForm
        activeView={activeView}
        onLogin={handleLogin}
        onRegister={handleRegister}
        onSwitchView={setActiveView}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      <DashboardHeader isAdmin={isAdmin} />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 animate-fade-in">
          <h2 className="text-3xl font-bold mb-2">Добро пожаловать! 👋</h2>
          <p className="text-muted-foreground">Управляйте своими финансами легко и удобно</p>
        </div>

        <StatsCards cards={cards} transactions={transactions} />

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

          <TabsContent value="cards">
            <CardsTab cards={cards} onIssueCard={handleIssueCard} />
          </TabsContent>

          <TabsContent value="transfer">
            <TransferTab
              cards={cards}
              selectedCard={selectedCard}
              transferAmount={transferAmount}
              transferRecipient={transferRecipient}
              onCardChange={setSelectedCard}
              onAmountChange={setTransferAmount}
              onRecipientChange={setTransferRecipient}
              onTransfer={handleTransfer}
            />
          </TabsContent>

          <TabsContent value="history">
            <HistoryTab transactions={transactions} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}