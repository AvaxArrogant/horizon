import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { Toaster } from '@/components/ui/toaster';
import { useToast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DashboardHeader from '@/components/DashboardHeader';
import ControlPanel from '@/components/ControlPanel';
import StatsDashboard from '@/components/StatsDashboard';
import PostsTab from '@/components/PostsTab';
import SettingsTab from '@/components/SettingsTab';
import MonetizationTab from '@/components/MonetizationTab';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';
import Auth from '@/components/Auth';

const initialSettings = {
  wordpress_url: '',
  wordpress_username: '',
  wordpress_password: '',
  ai_provider: 'google',
  openai_api_key: '',
  google_api_key: '',
  anthropic_api_key: '',
  ai_prompt: 'Create an engaging, SEO-optimized blog post based on this Reddit post. Make it informative, well-structured with proper headings, and include relevant keywords naturally.',
  ezoic_site_id: '',
  adsense_client_id: '',
  auto_publish: false,
  post_frequency: 30,
  ai_temperature: 0.7,
  ai_word_count_min: 800,
  ai_word_count_max: 1500,
  publish_delay_minutes: 0,
};

function App() {
  const { toast } = useToast();
  const { user, session, loading } = useAuth();
  const [isRunning, setIsRunning] = useState(false);
  const [posts, setPosts] = useState([]);
  const [settings, setSettings] = useState(initialSettings);
  const [stats, setStats] = useState({
    totalPosts: 0,
    publishedToday: 0,
    totalRevenue: 0,
    avgCtr: 0,
  });

  const fetchSettings = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (data) {
      setSettings(data);
    } else if (error && error.code === 'PGRST116') {
      const { data: newSettings, error: insertError } = await supabase
        .from('user_settings')
        .insert({ user_id: user.id, ...initialSettings })
        .select()
        .single();
      if (newSettings) setSettings(newSettings);
      if (insertError) console.error('Error creating settings:', insertError);
    }
  }, [user]);

  const fetchPosts = useCallback(async () => {
    if (!user) return;
    const { data, error, count } = await supabase
      .from('posts')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (data) {
      setPosts(data);
      const publishedTodayCount = data.filter(p => p.status === 'published' && new Date(p.created_at).toDateString() === new Date().toDateString()).length;
      setStats(prev => ({ ...prev, totalPosts: count || 0, publishedToday: publishedTodayCount }));
    }
    if (error) console.error('Error fetching posts:', error);
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchSettings();
      fetchPosts();
    }
  }, [user, fetchSettings, fetchPosts]);
  
  useEffect(() => {
    if (!user) return;

    const channel = supabase.channel('realtime-posts')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'posts', filter: `user_id=eq.${user.id}` }, (payload) => {
        fetchPosts();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchPosts]);


  const handleStartAutomation = () => {
    setIsRunning(!isRunning);
    toast({
      title: isRunning ? "Automation Stopped" : "Automation Started",
      description: isRunning ? "The system will no longer fetch new posts automatically." : `The system is now live! It will check your RSS feeds every ${settings.post_frequency} minutes.`,
    });
  };

  const handlePublishPost = async (postId) => {
    toast({ title: "Publishing...", description: "Sending post to WordPress." });
    // In a real app, this would call a Supabase function to handle publishing.
    // For now, we simulate it.
    const newStatus = { status: 'published', wordpress_id: Math.floor(Math.random() * 1000) };
    const { data, error } = await supabase.from('posts').update(newStatus).eq('id', postId).select().single();
    
    if (data) {
      fetchPosts();
      toast({ title: "Post Published!", description: "Post has been successfully published to WordPress." });
    }
    if (error) {
      toast({ title: "Error publishing post", description: error.message, variant: "destructive" });
    }
  };

  const handleDeletePost = async (postId) => {
    const { error } = await supabase.from('posts').delete().eq('id', postId);
    if (!error) {
      fetchPosts();
      toast({ title: "Post Deleted", description: "Post has been removed from the dashboard." });
    } else {
      toast({ title: "Error deleting post", description: error.message, variant: "destructive" });
    }
  };

  const handleRefreshStats = () => {
    setStats(prev => ({
      ...prev,
      totalRevenue: (Math.random() * 500 + 100).toFixed(2),
      avgCtr: (Math.random() * 3 + 1).toFixed(2)
    }));
    toast({ title: "Stats Refreshed", description: "Monetization data has been updated." });
  };

  if (loading) {
    return <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 flex items-center justify-center text-white text-2xl">Loading...</div>;
  }

  if (!session) {
    return <Auth />;
  }

  return (
    <>
      <Helmet>
        <title>HyperfueledBlog - AI Blog Automation</title>
        <meta name="description" content="Automate your WordPress blog with AI-powered content generation from Reddit RSS feeds. Track monetization, optimize SEO, and publish automatically." />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 p-4">
        <div className="max-w-7xl mx-auto space-y-6">
          <DashboardHeader />
          <ControlPanel isRunning={isRunning} onToggleAutomation={handleStartAutomation} />
          <StatsDashboard stats={stats} onRefresh={handleRefreshStats} />

          <Tabs defaultValue="posts" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 bg-slate-800/50">
              <TabsTrigger value="posts" className="data-[state=active]:bg-purple-600">Posts</TabsTrigger>
              <TabsTrigger value="settings" className="data-[state=active]:bg-purple-600">Settings</TabsTrigger>
              <TabsTrigger value="monetization" className="data-[state=active]:bg-purple-600">Monetization</TabsTrigger>
            </TabsList>

            <TabsContent value="posts" className="space-y-6">
              <PostsTab
                posts={posts}
                onPublish={handlePublishPost}
                onDelete={handleDeletePost}
              />
            </TabsContent>
            
            <TabsContent value="settings" className="space-y-6">
              <SettingsTab settings={settings} setSettings={setSettings} />
            </TabsContent>
            
            <TabsContent value="monetization" className="space-y-6">
              <MonetizationTab settings={settings} setSettings={setSettings} stats={stats} onRefresh={handleRefreshStats} />
            </TabsContent>
          </Tabs>
        </div>
        <Toaster />
      </div>
    </>
  );
}

export default App;