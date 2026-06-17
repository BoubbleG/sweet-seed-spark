import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Restaurant, Category, Product, ProductOptionGroup, ProductOption } from '@/types';

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

      // Buscar grupos de opções e opções para todos os produtos visíveis
      const productIds = (products || []).map((p: any) => p.id);
      let groups: any[] = [];
      let options: any[] = [];
      if (productIds.length > 0) {
        const { data: g, error: gErr } = await supabase
          .from('product_option_groups' as any)
          .select('*')
          .in('product_id', productIds)
          .order('display_order', { ascending: true });
        if (gErr) throw gErr;
        groups = g || [];
        const groupIds = groups.map((x: any) => x.id);
        if (groupIds.length > 0) {
          const { data: o, error: oErr } = await supabase
            .from('product_options' as any)
            .select('*')
            .in('group_id', groupIds)
            .eq('is_available', true)
            .order('display_order', { ascending: true });
          if (oErr) throw oErr;
          options = o || [];
        }
      }

      const optionsByGroup = new Map<string, ProductOption[]>();
      for (const o of options) {
        const arr = optionsByGroup.get(o.group_id) || [];
        arr.push({ ...o, extra_price: Number(o.extra_price ?? 0) });
        optionsByGroup.set(o.group_id, arr);
      }
      const groupsByProduct = new Map<string, ProductOptionGroup[]>();
      for (const g of groups) {
        const arr = groupsByProduct.get(g.product_id) || [];
        arr.push({ ...g, options: optionsByGroup.get(g.id) || [] });
        groupsByProduct.set(g.product_id, arr);
      }

      const enriched = (products || []).map((p: any) => ({
        ...p,
        option_groups: groupsByProduct.get(p.id) || [],
      }));

      return {
        categories: categories as Category[],
        products: enriched as Product[],
      };
    },
    enabled: !!restaurantId,
  });
}
