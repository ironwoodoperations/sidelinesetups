import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useEvents() {
  return useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('is_active', true)
        .eq('archived', false)
        .order('start_date');
      if (error) throw error;
      return data;
    },
  });
}

export function usePackages() {
  return useQuery({
    queryKey: ['packages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('packages')
        .select('*')
        .eq('is_active', true)
        .order('display_order');
      if (error) throw error;
      return data;
    },
  });
}

export function useParks() {
  return useQuery({
    queryKey: ['parks'],
    queryFn: async () => {
      const { data, error } = await supabase.from('parks').select('*');
      if (error) throw error;
      return data;
    },
  });
}

export function useFields(parkId?: string) {
  return useQuery({
    queryKey: ['fields', parkId],
    queryFn: async () => {
      let q = supabase.from('fields').select('*');
      if (parkId) q = q.eq('park_id', parkId);
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
    enabled: !!parkId,
  });
}

export function useSpots(fieldId?: string) {
  return useQuery({
    queryKey: ['spots', fieldId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('spots')
        .select('*')
        .eq('field_id', fieldId!);
      if (error) throw error;
      return data;
    },
    enabled: !!fieldId,
  });
}

export function useAddOns() {
  return useQuery({
    queryKey: ['add_ons'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('add_ons')
        .select('*')
        .eq('is_active', true)
        .order('display_order');
      if (error) throw error;
      return data;
    },
  });
}

export function useFaqItems() {
  return useQuery({
    queryKey: ['faq_items'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('faq_items')
        .select('*')
        .eq('is_active', true)
        .order('display_order');
      if (error) throw error;
      return data;
    },
  });
}

export function useLocks(date?: string, fieldId?: string) {
  return useQuery({
    queryKey: ['locks', date, fieldId],
    queryFn: async () => {
      let q = supabase.from('locks').select('*').eq('status', 'active');
      if (date) q = q.eq('date', date);
      if (fieldId) q = q.eq('field_id', fieldId);
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
    enabled: !!date && !!fieldId,
  });
}

export function useDiscountCode(code: string) {
  return useQuery({
    queryKey: ['discount_code', code],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('discount_codes')
        .select('*')
        .eq('code', code.toUpperCase())
        .eq('is_active', true)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: false, // manually triggered
  });
}

export function useEquipment() {
  return useQuery({
    queryKey: ['equipment'],
    queryFn: async () => {
      const { data, error } = await supabase.from('equipment').select('*');
      if (error) throw error;
      return data;
    },
  });
}
