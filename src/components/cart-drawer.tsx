import { useState } from "react";
import { useCart } from "@/hooks/use-cart";
import { formatCurrency, generateWhatsAppMessage } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trash2, Plus, Minus, X } from "lucide-react";
import { Restaurant } from "@/types";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  restaurant: Restaurant;
}

export function CartDrawer({ isOpen, onClose, restaurant }: CartDrawerProps) {
  const { items, removeItem, updateQuantity, getTotal, clearCart } = useCart();
  const [customer, setCustomer] = useState({
    name: "",
    phone: "",
    address: "",
    neighborhood: "",
    reference: "",
    paymentMethod: "Cartão",
    changeFor: "",
    generalNotes: ""
  });

  const subtotal = getTotal();
  const deliveryFee = restaurant.delivery_fee || 0;
  const total = subtotal + deliveryFee;

  const handleSendOrder = () => {
    if (!customer.name || !customer.phone || !customer.address || !customer.neighborhood) {
      alert("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    const message = generateWhatsAppMessage(
      restaurant.name,
      items,
      customer,
      subtotal,
      deliveryFee,
      total
    );

    window.open(`https://wa.me/${restaurant.whatsapp}?text=${message}`, "_blank");
    clearCart();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] h-[90vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-6 border-b flex flex-row items-center justify-between">
          <DialogTitle>Seu Pedido</DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 p-6">
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Itens</h3>
              {items.map((item) => (
                <div key={item.id} className="flex gap-3 pb-4 border-b">
                  {item.image_url && (
                    <img src={item.image_url} alt={item.name} className="w-16 h-16 rounded-md object-cover" />
                  )}
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <h4 className="font-medium">{item.name}</h4>
                      <button onClick={() => removeItem(item.id)} className="text-red-500">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-sm text-slate-500 mb-2">{formatCurrency(item.price)}</p>
                    <div className="flex items-center gap-3">
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-8 w-8 rounded-full"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <span className="w-4 text-center">{item.quantity}</span>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-8 w-8 rounded-full"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Seus Dados</h3>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Nome *</Label>
                  <Input 
                    id="name" 
                    value={customer.name} 
                    onChange={(e) => setCustomer({...customer, name: e.target.value})} 
                    placeholder="Seu nome completo"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phone">Telefone/WhatsApp *</Label>
                  <Input 
                    id="phone" 
                    value={customer.phone} 
                    onChange={(e) => setCustomer({...customer, phone: e.target.value})} 
                    placeholder="(00) 00000-0000"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="address">Endereço *</Label>
                  <Input 
                    id="address" 
                    value={customer.address} 
                    onChange={(e) => setCustomer({...customer, address: e.target.value})} 
                    placeholder="Rua, número, apto"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="neighborhood">Bairro *</Label>
                  <Input 
                    id="neighborhood" 
                    value={customer.neighborhood} 
                    onChange={(e) => setCustomer({...customer, neighborhood: e.target.value})} 
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="reference">Ponto de Referência</Label>
                  <Input 
                    id="reference" 
                    value={customer.reference} 
                    onChange={(e) => setCustomer({...customer, reference: e.target.value})} 
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="payment">Forma de Pagamento</Label>
                  <select 
                    id="payment"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={customer.paymentMethod}
                    onChange={(e) => setCustomer({...customer, paymentMethod: e.target.value})}
                  >
                    <option value="Cartão">Cartão (Maquininha)</option>
                    <option value="Pix">Pix</option>
                    <option value="Dinheiro">Dinheiro</option>
                  </select>
                </div>
                {customer.paymentMethod === "Dinheiro" && (
                  <div className="grid gap-2">
                    <Label htmlFor="change">Troco para quanto?</Label>
                    <Input 
                      id="change" 
                      value={customer.changeFor} 
                      onChange={(e) => setCustomer({...customer, changeFor: e.target.value})} 
                      placeholder="Ex: 50"
                    />
                  </div>
                )}
                <div className="grid gap-2">
                  <Label htmlFor="notes">Observações do Pedido</Label>
                  <Textarea 
                    id="notes" 
                    value={customer.generalNotes} 
                    onChange={(e) => setCustomer({...customer, generalNotes: e.target.value})} 
                  />
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>

        <div className="p-6 border-t bg-slate-50 space-y-3">
          <div className="flex justify-between text-sm">
            <span>Subtotal</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm text-green-600">
            <span>Taxa de Entrega</span>
            <span>{deliveryFee === 0 ? 'Grátis' : formatCurrency(deliveryFee)}</span>
          </div>
          <div className="flex justify-between text-lg font-bold">
            <span>Total</span>
            <span>{formatCurrency(total)}</span>
          </div>
          <Button className="w-full h-12 text-lg" onClick={handleSendOrder}>
            Enviar Pedido via WhatsApp
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
