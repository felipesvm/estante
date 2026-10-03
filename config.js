// Configuração do Supabase.
// A chave "publishable" é pública por natureza: ela pode ficar no navegador.
// Quem protege os seus livros são as regras de acesso (RLS) criadas em supabase/schema.sql.
window.ESTANTE_CONFIG = {
  supabaseUrl: 'https://lamlskoonjjfffhkdrda.supabase.co',
  supabaseKey: 'sb_publishable_lAolYTdC2UTMjczZtqljAA_WUlAYnOJ',
  // Usado só para o medidor de espaço na barra lateral (plano gratuito: 1 GB).
  storageLimitMB: 1024
};
