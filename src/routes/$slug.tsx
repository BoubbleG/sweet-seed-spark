import { createFileRoute } from "@tanstack/react-router";
import { useParams } from "@tanstack/react-router";
import { useRestaurant, useMenu } from "@/hooks/use-restaurant";
import { useCart } from "@/hooks/use-cart";
import { formatCurrency, generateWhatsAppMessage } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ShoppingCart, Phone, Clock, MapPin, Instagram } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/$slug")({
  component: RestaurantPublicMenu,
});

function RestaurantPublicMenu() {
  const { slug } = useParams({ from: '/$slug' });
  const { data: restaurant, isLoading: restLoading } = useRestaurant(slug);
  const { data: menu, isLoading: menuLoading } = useMenu(restaurant?.id || '');
  const { items, addItem, getTotal } = useCart();
  const [showOrder, setShowOrder] = useState(false);

  if (restLoading || menuLoading) return <div className="p-12 text-center">Carregando cardápio...</div>;
  if (!restaurant) return <div className="p-12 text-center">Restaurante não encontrado.</div>;

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <div className="h-48 bg-cover bg-center" style={{ backgroundImage: `url(${restaurant.banner_url || 'https://images.unsplash.com/photo-1504674900247-0877df9cc836'})` }} />
      
      <div className="px-6 -mt-12 relative z-10">
        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <div className="flex items-center gap-4 mb-4">
            {restaurant.logo_url && <img src={restaurant.logo_url} className="w-16 h-16 rounded-full border-2" />}
            <div>
              <h1 className="text-2xl font-bold">{restaurant.name}</h1>
              <p className="text-sm text-slate-500 capitalize">{restaurant.business_type}</p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-4 text-sm text-slate-600 mb-4">
            <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {restaurant.average_delivery_time}</span>
            <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {restaurant.city}</span>
            {restaurant.instagram && <span className="flex items-center gap-1"><Instagram className="w-4 h-4" /> {restaurant.instagram}</span>}
          </div>
        </div>

        {menu?.categories.map(cat => (
          <div key={cat.id} className="mt-8">
            <h2 className="text-xl font-bold mb-4">{cat.name}</h2>
            <div className="grid gap-4">
              {menu.products.filter(p => p.category_id === cat.id).map(prod => (
                <Card key={prod.id}>
                  <CardContent className="p-4 flex gap-4">
                    {prod.image_url && <img src={prod.image_url} className="w-20 h-20 rounded-lg object-cover" />}
                    <div className="flex-1">
                      <h3 className="font-semibold">{prod.name}</h3>
                      <p className="text-sm text-slate-500">{prod.description}</p>
                      <div className="flex justify-between items-center mt-2">
                        <span className="font-bold text-primary">{formatCurrency(prod.price)}</span>
                        <Button size="sm" onClick={() => addItem(prod)}>Adicionar</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>

      {items.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t z-50">
          <Button className="w-full h-12 text-lg" onClick={() => setShowOrder(true)}>
            <ShoppingCart className="w-5 h-5 mr-2" />
            Ver Carrinho ({items.length}) - {formatCurrency(getTotal())}
          </Button>
        </div>
      )}
    </div>
  );
}
