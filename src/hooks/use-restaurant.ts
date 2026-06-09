import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Restaurant, Category, Product } from '@/types';

export function useRestaurant(slug: string) {
  return useQuery({
    queryKey: ['restaurant', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .eq('slug', slug)
        .single();

      if (error) throw error;
      return data as Restaurant;
    },
    enabled: !!slug,
  });
}

export function useMenu(restaurantId: string) {
  return useQuery({
    queryKey: ['menu', restaurantId],
    queryFn: async () => {
      const { data: categories, error: catError } = await supabase
        .from('categories')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .eq('status', 'active')
        .order('display_order', { ascending: true });

      if (catError) throw catError;

      const { data: products, error: prodError } = await supabase
        .from('products')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .eq('is_available', true);

      if (prodError) throw prodError;

      return {
        categories: categories as Category[],
        products: products as Product[],
      };
    },
    enabled: !!restaurantId,
  });
}
