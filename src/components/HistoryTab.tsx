import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

interface Transaction {
  id: string;
  type: 'incoming' | 'outgoing';
  amount: number;
  recipient: string;
  date: string;
  status: 'completed' | 'pending';
}

interface HistoryTabProps {
  transactions: Transaction[];
}

export default function HistoryTab({ transactions }: HistoryTabProps) {
  return (
    <div className="animate-scale-in">
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
    </div>
  );
}
