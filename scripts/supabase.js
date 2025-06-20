// supabase.js - Configuração global otimizada
document.addEventListener('DOMContentLoaded', function() {
    // 1. Configuração básica com verificação de segurança
    const supabaseUrl = 'https://hufrtioqiywncqghboal.supabase.co';
    const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh1ZnJ0aW9xaXl3bmNxZ2hib2FsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUxODE3MTksImV4cCI6MjA2MDc1NzcxOX0.SNwH57bVGYwspmsDkRi5kwvZcTiwPba0NOobT-kFko8';
    
    // 2. Verificação básica das credenciais antes de criar o cliente
    if (!supabaseUrl || !supabaseAnonKey) {
        console.error('Erro: URL ou chave do Supabase não configuradas');
        return;
    }

    // 3. Criação do cliente com configurações seguras
    window.supabase = supabase.createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true,
            flowType: 'pkce'
        },
        db: {
            schema: 'public'
        }
    });

    // 4. Verificação otimizada da conexão
    async function verifySupabaseConnection() {
        try {
            console.debug('[Supabase] Iniciando verificação de conexão...');
            
            // Verificação básica de conexão sem consultas desnecessárias
            const { data: { user }, error: authError } = await supabase.auth.getUser();
            
            if (authError) {
                console.debug('[Supabase] Conexão OK, usuário não autenticado');
            } else {
                console.debug('[Supabase] Usuário autenticado:', user.email);
            }
            
            return true;
        } catch (e) {
            console.debug('[Supabase] Conexão estabelecida com funcionalidade limitada');
            return true; // Retorna true mesmo com erro para não bloquear funcionalidades básicas
        }
    }

    // 5. Verificação de bucket de storage otimizada
    window.verifyStorageBucket = async function(bucketName) {
        if (!bucketName) {
            console.error('Nome do bucket não fornecido');
            return false;
        }
        
        try {
            const { data, error } = await supabase
                .storage
                .from(bucketName)
                .list('', { limit: 1 });
            
            return !error;
        } catch (error) {
            console.debug(`[Supabase] Bucket "${bucketName}" não acessível ou não existe`);
            return false;
        }
    };

    // 6. Inicialização silenciosa
    verifySupabaseConnection().then(success => {
        if (!success) {
            console.debug('[Supabase] Conexão com funcionalidade reduzida');
        }
    });
});