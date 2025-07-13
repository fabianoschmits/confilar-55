import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.5';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AdminRequest {
  action: 'get_users' | 'get_user_details' | 'assign_role' | 'remove_role' | 'delete_post';
  payload?: any;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client with service role
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Create regular client for user authentication
    const authHeader = req.headers.get('Authorization')!;
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify user is admin
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle();

    if (roleError || !roleData) {
      return new Response(
        JSON.stringify({ error: 'Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { action, payload }: AdminRequest = await req.json();

    let result;

    switch (action) {
      case 'get_users':
        // Get users with their profiles and roles
        const { data: users, error: usersError } = await supabaseAdmin
          .from('profiles')
          .select(`
            *,
            user_roles(role)
          `);
        
        if (usersError) throw usersError;
        result = users;
        break;

      case 'get_user_details':
        if (!payload?.userId) {
          throw new Error('User ID required');
        }
        
        const { data: userDetails, error: detailsError } = await supabaseAdmin
          .from('profiles')
          .select(`
            *,
            user_roles(role)
          `)
          .eq('user_id', payload.userId)
          .single();
        
        if (detailsError) throw detailsError;
        result = userDetails;
        break;

      case 'assign_role':
        if (!payload?.userId || !payload?.role) {
          throw new Error('User ID and role required');
        }
        
        const { data: assignResult, error: assignError } = await supabaseAdmin
          .rpc('assign_user_role', {
            target_user_id: payload.userId,
            new_role: payload.role,
            reason: payload.reason || 'Admin assignment'
          });
        
        if (assignError) throw assignError;
        result = { success: true };
        break;

      case 'remove_role':
        if (!payload?.userId) {
          throw new Error('User ID required');
        }
        
        const { data: removeResult, error: removeError } = await supabaseAdmin
          .rpc('remove_user_role', {
            target_user_id: payload.userId,
            reason: payload.reason || 'Admin removal'
          });
        
        if (removeError) throw removeError;
        result = { success: true };
        break;

      case 'delete_post':
        if (!payload?.postId || !payload?.postType) {
          throw new Error('Post ID and type required');
        }
        
        const table = payload.postType === 'work' ? 'work_posts' : 'posts';
        const { error: deleteError } = await supabaseAdmin
          .from(table)
          .delete()
          .eq('id', payload.postId);
        
        if (deleteError) throw deleteError;
        result = { success: true };
        break;

      default:
        throw new Error('Invalid action');
    }

    return new Response(
      JSON.stringify({ data: result }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Admin operation error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});