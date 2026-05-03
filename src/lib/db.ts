import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

export interface LocalConfig {
  id: string;
  nombre: string;
  slug: string;
  reproductor_api_key?: string;
  reproductor_type?: string;
  auto_aceptar: boolean;
}

export interface Peticion {
  id: string;
  local_id: string;
  cancion: string;
  artista: string;
  caratula?: string;
  votos: number;
  estado: 'pendiente' | 'aceptada' | 'reproducida';
  youtube_url?: string;
  duration?: string;
  requested_by?: string;
  created_at: string;
}

export async function getLocalBySlug(slug: string): Promise<LocalConfig | null> {
  const { data, error } = await (createClient(await cookies()))
    .from('locales')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !data) return null;
  return data as LocalConfig;
}

export async function createLocal(slug: string, nombre: string, autoAceptar: boolean = false): Promise<LocalConfig | null> {
  const { data, error } = await (createClient(await cookies()))
    .from('locales')
    .insert([{ slug, nombre, auto_aceptar: autoAceptar }])
    .select()
    .single();

  if (error || !data) {
    console.error('Error creating local:', error);
    return null;
  }
  return data as LocalConfig;
}

export async function getPeticiones(localId: string, estado: 'pendiente' | 'aceptada' | 'reproducida'): Promise<Peticion[]> {
  const { data, error } = await (createClient(await cookies()))
    .from('peticiones')
    .select('*')
    .eq('local_id', localId)
    .eq('estado', estado)
    .order('created_at', { ascending: true });

  if (error) return [];
  return data as Peticion[];
}

export async function addPeticion(peticion: Omit<Peticion, 'id' | 'created_at' | 'votos'>): Promise<Peticion | null> {
  const { data, error } = await (createClient(await cookies()))
    .from('peticiones')
    .insert([peticion])
    .select()
    .single();

  if (error) {
    console.error('Error adding peticion:', error);
    return null;
  }
  return data as Peticion;
}

export async function updatePeticionEstado(id: string, estado: 'pendiente' | 'aceptada' | 'reproducida'): Promise<boolean> {
  const { error } = await (createClient(await cookies()))
    .from('peticiones')
    .update({ estado })
    .eq('id', id);

  return !error;
}

export async function updateLocalConfig(id: string, config: Partial<LocalConfig>): Promise<boolean> {
  const { error } = await (createClient(await cookies()))
    .from('locales')
    .update(config)
    .eq('id', id);

  return !error;
}

export async function deletePeticion(id: string): Promise<boolean> {
  const { error } = await (createClient(await cookies()))
    .from('peticiones')
    .delete()
    .eq('id', id);

  return !error;
}

export async function deleteAllPendientes(localId: string): Promise<boolean> {
  const { error } = await (createClient(await cookies()))
    .from('peticiones')
    .delete()
    .eq('local_id', localId)
    .eq('estado', 'pendiente');

  return !error;
}

export async function updateAllPendientesToAceptada(localId: string): Promise<boolean> {
  const { error } = await (createClient(await cookies()))
    .from('peticiones')
    .update({ estado: 'aceptada' })
    .eq('local_id', localId)
    .eq('estado', 'pendiente');

  return !error;
}

export async function deleteAllExceptFirst(localId: string): Promise<boolean> {
  const all = await (createClient(await cookies()))
    .from('peticiones')
    .select('id')
    .eq('local_id', localId)
    .eq('estado', 'aceptada')
    .order('created_at', { ascending: true });

  if (all.error || !all.data || all.data.length <= 1) return !all.error;

  const idsToDelete = all.data.slice(1).map(r => r.id);
  const { error } = await (createClient(await cookies()))
    .from('peticiones')
    .delete()
    .in('id', idsToDelete);

  return !error;
}
