import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Save, Plus, Trash2, Edit, X, Check, Zap } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';

const RssFeedManager = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [feeds, setFeeds] = useState([]);
  const [newFeed, setNewFeed] = useState({ name: '', url: '', category: '' });
  const [editingFeed, setEditingFeed] = useState(null);
  const [isGenerating, setIsGenerating] = useState(null);

  const fetchFeeds = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase.from('rss_feeds').select('*').eq('user_id', user.id).order('created_at');
    if (error) toast({ title: 'Error fetching feeds', description: error.message, variant: 'destructive' });
    else setFeeds(data);
  }, [user, toast]);

  useEffect(() => {
    fetchFeeds();
  }, [fetchFeeds]);

  const handleAddFeed = async () => {
    if (!newFeed.name || !newFeed.url) {
      toast({ title: 'Missing fields', description: 'Please provide a name and URL.', variant: 'destructive' });
      return;
    }
    const { data, error } = await supabase.from('rss_feeds').insert({ ...newFeed, user_id: user.id }).select().single();
    if (error) toast({ title: 'Error adding feed', description: error.message, variant: 'destructive' });
    else {
      setFeeds([...feeds, data]);
      setNewFeed({ name: '', url: '', category: '' });
      toast({ title: 'Feed added successfully!' });
    }
  };

  const handleUpdateFeed = async () => {
    const { data, error } = await supabase.from('rss_feeds').update({ name: editingFeed.name, url: editingFeed.url, category: editingFeed.category }).eq('id', editingFeed.id).select().single();
    if (error) toast({ title: 'Error updating feed', description: error.message, variant: 'destructive' });
    else {
      setFeeds(feeds.map(f => f.id === editingFeed.id ? data : f));
      setEditingFeed(null);
      toast({ title: 'Feed updated successfully!' });
    }
  };

  const handleDeleteFeed = async (id) => {
    await supabase.from('posts').delete().eq('rss_feed_id', id);
    const { error } = await supabase.from('rss_feeds').delete().eq('id', id);
    if (error) toast({ title: 'Error deleting feed', description: error.message, variant: 'destructive' });
    else {
      setFeeds(feeds.filter(f => f.id !== id));
      toast({ title: 'Feed deleted successfully!' });
    }
  };

  const handleGenerateNow = async (feedId) => {
    setIsGenerating(feedId);
    toast({ title: 'Processing Feed...', description: 'Checking for new content and starting AI generation.' });
    const { data, error } = await supabase.functions.invoke('process-feed', {
      body: { feedId },
    });
    if (error) {
      toast({ title: 'Error Processing Feed', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Feed Processed!', description: data.message });
    }
    setIsGenerating(null);
  };

  return (
    <Card className="p-6 bg-slate-800/50 border-slate-700">
      <h3 className="text-xl font-semibold text-white mb-4">Reddit RSS Feeds</h3>
      <div className="space-y-4">
        {feeds.map(feed => (
          <div key={feed.id} className="flex items-center gap-2 p-2 bg-slate-700/50 rounded-md">
            {editingFeed?.id === feed.id ? (
              <>
                <Input value={editingFeed.name} onChange={e => setEditingFeed({...editingFeed, name: e.target.value})} placeholder="Feed Name" className="bg-slate-600 border-slate-500 text-white"/>
                <Input value={editingFeed.url} onChange={e => setEditingFeed({...editingFeed, url: e.target.value})} placeholder="Feed URL" className="bg-slate-600 border-slate-500 text-white"/>
                <Input value={editingFeed.category} onChange={e => setEditingFeed({...editingFeed, category: e.target.value})} placeholder="Category" className="bg-slate-600 border-slate-500 text-white"/>
                <Button size="icon" variant="ghost" onClick={handleUpdateFeed}><Check className="h-4 w-4 text-green-400"/></Button>
                <Button size="icon" variant="ghost" onClick={() => setEditingFeed(null)}><X className="h-4 w-4"/></Button>
              </>
            ) : (
              <>
                <div className="flex-1 font-medium">{feed.name}</div>
                <div className="flex-1 text-slate-400 truncate">{feed.url}</div>
                <div className="flex-1 text-slate-300">{feed.category || 'N/A'}</div>
                <Button size="icon" variant="ghost" onClick={() => handleGenerateNow(feed.id)} disabled={isGenerating === feed.id}>
                  <Zap className={`h-4 w-4 ${isGenerating === feed.id ? 'animate-pulse text-yellow-400' : 'text-green-400'}`}/>
                </Button>
                <Button size="icon" variant="ghost" onClick={() => setEditingFeed(feed)}><Edit className="h-4 w-4"/></Button>
                <Button size="icon" variant="ghost" onClick={() => handleDeleteFeed(feed.id)}><Trash2 className="h-4 w-4 text-red-400"/></Button>
              </>
            )}
          </div>
        ))}
      </div>
      <div className="flex items-end gap-2 mt-4 pt-4 border-t border-slate-700">
        <Input value={newFeed.name} onChange={e => setNewFeed({...newFeed, name: e.target.value})} placeholder="Feed Name (e.g., Futurology)" className="bg-slate-700 border-slate-600 text-white"/>
        <Input value={newFeed.url} onChange={e => setNewFeed({...newFeed, url: e.target.value})} placeholder="https://www.reddit.com/r/Futurology/.rss" className="bg-slate-700 border-slate-600 text-white"/>
        <Input value={newFeed.category} onChange={e => setNewFeed({...newFeed, category: e.target.value})} placeholder="WordPress Category" className="bg-slate-700 border-slate-600 text-white"/>
        <Button onClick={handleAddFeed} className="bg-purple-600 hover:bg-purple-700"><Plus className="mr-2 h-4 w-4"/>Add Feed</Button>
      </div>
    </Card>
  );
};

const AiPromptManager = () => {
    return (
        <Card className="p-6 bg-slate-800/50 border-slate-700">
            <h3 className="text-xl font-semibold text-white mb-4">AI Prompt Templates</h3>
            <p className="text-slate-400">🚧 Custom prompt management per feed is coming soon! For now, you can edit the global prompt below.</p>
        </Card>
    );
}

const SettingsTab = ({ settings, setSettings }) => {
  const { toast } = useToast();
  const { user } = useAuth();

  const handleInputChange = (e) => {
    const { id, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [id]: type === 'checkbox' ? checked : value,
    }));
  };
  
  const handleSliderChange = (id, value) => {
    setSettings(prev => ({ ...prev, [id]: value[0] }));
  };

  const handleSelectChange = (id, value) => {
    setSettings(prev => ({ ...prev, [id]: value }));
  };

  const handleSaveSettings = async () => {
    const { id, created_at, updated_at, user_id, ...updateData } = settings;
    const { error } = await supabase.from('user_settings').update(updateData).eq('user_id', user.id);
    if (error) {
      toast({ title: "Error Saving Settings", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Settings Saved!", description: "Your configuration has been updated." });
    }
  };

  const renderApiKeyInput = () => {
    switch (settings.ai_provider) {
      case 'openai':
        return (
          <div className="space-y-2">
            <Label htmlFor="openai_api_key" className="text-white">OpenAI API Key</Label>
            <Input id="openai_api_key" type="password" placeholder="sk-..." value={settings.openai_api_key || ''} onChange={handleInputChange} className="bg-slate-700 border-slate-600 text-white" />
          </div>
        );
      case 'google':
        return (
          <div className="space-y-2">
            <Label htmlFor="google_api_key" className="text-white">Google AI API Key</Label>
            <Input id="google_api_key" type="password" placeholder="AIza..." value={settings.google_api_key || ''} onChange={handleInputChange} className="bg-slate-700 border-slate-600 text-white" />
          </div>
        );
      case 'anthropic':
        return (
          <div className="space-y-2">
            <Label htmlFor="anthropic_api_key" className="text-white">Anthropic API Key</Label>
            <Input id="anthropic_api_key" type="password" placeholder="sk-ant-..." value={settings.anthropic_api_key || ''} onChange={handleInputChange} className="bg-slate-700 border-slate-600 text-white" />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <RssFeedManager />
      
      <Card className="p-6 bg-slate-800/50 border-slate-700">
        <h3 className="text-xl font-semibold text-white mb-6">WordPress Integration</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="wordpress_url" className="text-white">WordPress URL</Label>
            <Input id="wordpress_url" placeholder="https://yourblog.com" value={settings.wordpress_url || ''} onChange={handleInputChange} className="bg-slate-700 border-slate-600 text-white" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="wordpress_username" className="text-white">WP Username</Label>
            <Input id="wordpress_username" placeholder="admin" value={settings.wordpress_username || ''} onChange={handleInputChange} className="bg-slate-700 border-slate-600 text-white" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="wordpress_password" className="text-white">WP Application Password</Label>
            <Input id="wordpress_password" type="password" placeholder="xxxx xxxx xxxx xxxx" value={settings.wordpress_password || ''} onChange={handleInputChange} className="bg-slate-700 border-slate-600 text-white" />
          </div>
        </div>
      </Card>
      
      <AiPromptManager />

      <Card className="p-6 bg-slate-800/50 border-slate-700">
        <h3 className="text-xl font-semibold text-white mb-6">Global AI Configuration</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-white">AI Provider</Label>
              <Select onValueChange={(value) => handleSelectChange('ai_provider', value)} value={settings.ai_provider || 'google'}>
                <SelectTrigger className="w-full bg-slate-700 border-slate-600 text-white">
                  <SelectValue placeholder="Select AI Provider" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700 text-white">
                  <SelectItem value="google">Google (Gemini)</SelectItem>
                  <SelectItem value="openai">OpenAI (GPT-4o)</SelectItem>
                  <SelectItem value="anthropic">Anthropic (Claude)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {renderApiKeyInput()}
            <div className="space-y-2">
                <Label htmlFor="ai_temperature" className="text-white">AI Temperature: {settings.ai_temperature}</Label>
                <Slider id="ai_temperature" defaultValue={[settings.ai_temperature || 0.7]} max={1} step={0.1} onValueChange={(value) => handleSliderChange('ai_temperature', value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="ai_prompt" className="text-white">Global Content Generation Prompt</Label>
            <Textarea id="ai_prompt" rows={8} value={settings.ai_prompt || ''} onChange={handleInputChange} className="bg-slate-700 border-slate-600 text-white" />
          </div>
        </div>
      </Card>

      <Card className="p-6 bg-slate-800/50 border-slate-700">
        <h3 className="text-xl font-semibold text-white mb-6">Automation Rules</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label htmlFor="post_frequency" className="text-white">Feed Refresh Interval (minutes)</Label>
            <Input id="post_frequency" type="number" min="15" value={settings.post_frequency || 30} onChange={handleInputChange} className="bg-slate-700 border-slate-600 text-white" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="publish_delay_minutes" className="text-white">Publish Delay (minutes)</Label>
            <Input id="publish_delay_minutes" type="number" min="0" value={settings.publish_delay_minutes || 0} onChange={handleInputChange} className="bg-slate-700 border-slate-600 text-white" />
          </div>
          <div className="space-y-2 flex flex-col justify-end">
             <div className="flex items-center space-x-2 mt-6">
              <input type="checkbox" id="auto_publish" checked={settings.auto_publish || false} onChange={(e) => setSettings(prev => ({...prev, auto_publish: e.target.checked}))} className="h-4 w-4 rounded accent-purple-500" />
              <Label htmlFor="auto_publish" className="text-slate-300">Auto-publish generated posts</Label>
            </div>
          </div>
        </div>
      </Card>
      
      <Button onClick={handleSaveSettings} className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-lg py-6">
        <Save className="mr-2 h-5 w-5" /> Save All Settings
      </Button>
    </div>
  );
};

export default SettingsTab;