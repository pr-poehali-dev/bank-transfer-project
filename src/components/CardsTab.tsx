import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import Icon from '@/components/ui/icon';

interface BankCard {
  id: string;
  number: string;
  balance: number;
  type: 'virtual' | 'physical';
  color: string;
  owner: string;
}

interface CardsTabProps {
  cards: BankCard[];
  onIssueCard: () => void;
}

export default function CardsTab({ cards, onIssueCard }: CardsTabProps) {
  return (
    <div className="space-y-6 animate-scale-in">
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
              <Button onClick={onIssueCard} className="w-full bg-gradient-to-r from-purple-500 to-pink-500">
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
    </div>
  );
}
