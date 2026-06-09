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
      <DialogContent className="sm:max-w-[450px] h-[100vh] sm:h-[90vh] flex flex-col p-0 overflow-hidden bg-[#FDF5E6] border-none shadow-2xl">
        <DialogHeader className="p-6 pb-2 flex flex-row items-center justify-between border-none">
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full bg-white shadow-sm">
             <X className="w-5 h-5 text-[#3B2C24]" />
          </Button>
          <DialogTitle className="text-lg font-black text-[#3B2C24]">Meu pedido</DialogTitle>
          <Button variant="ghost" size="icon" className="rounded-full bg-white shadow-sm">
             <Trash2 className="w-5 h-5 text-zinc-300" onClick={clearCart} />
          </Button>
        </DialogHeader>

        <ScrollArea className="flex-1 px-6">
          <div className="space-y-8 pt-4 pb-10">
            {/* Delivery Alert Mock */}
            <div className="bg-[#FEF9EF] border border-[#E29B5D]/20 rounded-2xl p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-[#E29B5D]/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-[#E29B5D]" />
              </div>
              <div>
                <p className="text-[11px] font-black text-[#3B2C24]">Entrega em até 45 min</p>
                <p className="text-[10px] text-[#A89284]">R$ 5,99 • Grátis acima de R$ 60</p>
              </div>
            </div>

            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4 p-2">
                  {item.image_url && (
                    <img src={item.image_url} alt={item.name} className="w-16 h-16 rounded-2xl object-cover shadow-sm" />
                  )}
                  <div className="flex-1 flex flex-col justify-between py-0.5">
                    <div className="flex justify-between items-start">
                      <h4 className="text-sm font-black text-[#3B2C24]">{item.name}</h4>
                    </div>
                    <p className="text-xs font-black text-[#3B2C24]">{formatCurrency(item.price)}</p>
                  </div>
                  <div className="flex items-center gap-3 bg-white px-3 py-1 rounded-full shadow-sm border border-zinc-50 h-fit self-center">
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="text-zinc-300 hover:text-zinc-500">
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-xs font-black text-[#3B2C24] min-w-[12px] text-center">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="text-[#3B2C24]">
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2 text-[#3B2C24]">
                <Plus className="w-4 h-4" />
                <h3 className="text-xs font-black uppercase tracking-widest">Observação do pedido</h3>
              </div>
              <Textarea 
                value={customer.generalNotes} 
                onChange={(e) => setCustomer({...customer, generalNotes: e.target.value})} 
                placeholder="Ex: Sem cebola, molho à parte..."
                className="bg-white border-zinc-100 rounded-2xl text-xs min-h-[80px] focus-visible:ring-[#E29B5D]"
              />
            </div>

            <div className="space-y-3 pt-4">
              <div className="flex justify-between text-xs font-bold text-[#A89284]">
                <span>Subtotal</span>
                <span className="text-[#3B2C24]">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-xs font-bold text-[#A89284]">
                <div className="flex items-center gap-1">
                  <span>Taxa de entrega</span>
                  <div className="w-3 h-3 rounded-full border border-[#A89284] flex items-center justify-center text-[8px]">i</div>
                </div>
                <span className="text-[#3B2C24]">{formatCurrency(deliveryFee)}</span>
              </div>
              <div className="flex justify-between text-base font-black text-[#3B2C24] pt-2">
                <span>Total</span>
                <span className="text-[#10B981]">{formatCurrency(total)}</span>
              </div>
            </div>

            <div className="space-y-6 pt-6 border-t border-zinc-100">
              <div className="flex justify-between items-start">
                <div className="flex gap-3">
                  <MapPin className="w-5 h-5 text-[#3B2C24]" />
                  <div>
                    <h4 className="text-[11px] font-black text-[#3B2C24]">Endereço de entrega</h4>
                    <p className="text-[10px] text-[#A89284] mt-0.5">Rua das Palmeiras, 123<br />Jardim do Sol, São Paulo - SP</p>
                  </div>
                </div>
                <button className="text-[10px] font-black text-[#3B2C24] uppercase tracking-widest">Alterar</button>
              </div>

              <div className="flex justify-between items-start">
                <div className="flex gap-3">
                  <User className="w-5 h-5 text-[#3B2C24]" />
                  <div>
                    <h4 className="text-[11px] font-black text-[#3B2C24]">Seus dados</h4>
                    <p className="text-[10px] text-[#A89284] mt-0.5">João da Silva<br />(11) 98765-4321</p>
                  </div>
                </div>
                <button className="text-[10px] font-black text-[#3B2C24] uppercase tracking-widest">Alterar</button>
              </div>
            </div>
          </div>
        </ScrollArea>

        <div className="p-6 bg-[#FDF5E6]">
          <Button 
            className="w-full h-14 bg-[#25D366] hover:bg-[#128C7E] text-white rounded-2xl flex items-center justify-center gap-3 shadow-lg shadow-green-500/20 group overflow-hidden" 
            onClick={handleSendOrder}
          >
            <div className="w-6 h-6 flex items-center justify-center">
               <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            </div>
            <span className="font-black text-xs uppercase tracking-widest">Enviar pedido no WhatsApp</span>
          </Button>
          <p className="text-center text-[9px] text-zinc-400 mt-4 flex items-center justify-center gap-1.5">
             <span className="w-3 h-3 rounded-full border border-zinc-300 flex items-center justify-center">🔒</span>
             Pedido enviado diretamente para o restaurante
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
