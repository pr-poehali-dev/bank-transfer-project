import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

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

interface StatsCardsProps {
  cards: BankCard[];
  transactions: Transaction[];
}

export default function StatsCards({ cards, transactions }: StatsCardsProps) {
  const totalBalance = cards.reduce((sum, card) => sum + card.balance, 0);

  return (
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
  );
}
