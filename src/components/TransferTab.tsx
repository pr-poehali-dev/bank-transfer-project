import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';

interface BankCard {
  id: string;
  number: string;
  balance: number;
  type: 'virtual' | 'physical';
  color: string;
  owner: string;
}

interface TransferTabProps {
  cards: BankCard[];
  selectedCard: string;
  transferAmount: string;
  transferRecipient: string;
  onCardChange: (value: string) => void;
  onAmountChange: (value: string) => void;
  onRecipientChange: (value: string) => void;
  onTransfer: () => void;
}

export default function TransferTab({
  cards,
  selectedCard,
  transferAmount,
  transferRecipient,
  onCardChange,
  onAmountChange,
  onRecipientChange,
  onTransfer
}: TransferTabProps) {
  return (
    <div className="animate-scale-in">
      <Card className="max-w-2xl mx-auto border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl">Новый перевод</CardTitle>
          <CardDescription>Отправьте деньги на карту или по номеру телефона</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Карта списания</Label>
            <Select value={selectedCard} onValueChange={onCardChange}>
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
              onChange={(e) => onRecipientChange(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Сумма перевода</Label>
            <Input 
              type="number"
              placeholder="0.00"
              value={transferAmount}
              onChange={(e) => onAmountChange(e.target.value)}
            />
          </div>

          <Button 
            onClick={onTransfer}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-lg h-12"
          >
            <Icon name="Send" size={20} className="mr-2" />
            Отправить перевод
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
