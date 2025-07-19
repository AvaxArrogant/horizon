import React from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { DollarSign, RefreshCw, Save } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';

const MonetizationTab = ({ settings, setSettings, stats, onRefresh }) => {
  const { toast } = useToast();
  const { user } = useAuth();

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setSettings(prev => ({ ...prev, [id]: value }));
  };

  const handleSaveMonetization = async () => {
    const { error } = await supabase
      .from('user_settings')
      .update({
        ezoic_site_id: settings.ezoic_site_id,
        adsense_client_id: settings.adsense_client_id,
      })
      .eq('user_id', user.id);

    if (error) {
      toast({ title: "Error Saving Settings", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Monetization Settings Saved", description: "Your ad network settings have been updated." });
    }
  };

  return (
    <div className="grid gap-6">
      <Card className="p-6 bg-slate-800/50 border-slate-700">
        <h3 className="text-xl font-semibold text-white mb-6">Monetization Settings</h3>
        <div className="grid gap-6">
          <div className="space-y-2">
            <Label htmlFor="ezoic_site_id" className="text-white">Ezoic Site ID</Label>
            <Input id="ezoic_site_id" placeholder="123456" value={settings.ezoic_site_id || ''} onChange={handleInputChange} className="bg-slate-700 border-slate-600 text-white" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="adsense_client_id" className="text-white">Google AdSense Client ID</Label>
            <Input id="adsense_client_id" placeholder="ca-pub-xxxxxxxxxxxxxxxx" value={settings.adsense_client_id || ''} onChange={handleInputChange} className="bg-slate-700 border-slate-600 text-white" />
          </div>
          <Button onClick={handleSaveMonetization} className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
            <Save className="mr-2 h-4 w-4" /> Save Monetization Settings
          </Button>
        </div>
      </Card>

      <Card className="p-6 bg-slate-800/50 border-slate-700">
        <h3 className="text-xl font-semibold text-white mb-6">Revenue Analytics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="text-lg font-medium text-purple-300">Ezoic Performance (Simulated)</h4>
            <div className="space-y-2">
              <div className="flex justify-between"><span className="text-slate-300">Page Views:</span><span className="text-white font-semibold">12,543</span></div>
              <div className="flex justify-between"><span className="text-slate-300">Revenue:</span><span className="text-green-400 font-semibold">${(stats.totalRevenue * 0.6).toFixed(2)}</span></div>
              <div className="flex justify-between"><span className="text-slate-300">ePMV:</span><span className="text-white font-semibold">$4.23</span></div>
            </div>
          </div>
          <div className="space-y-4">
            <h4 className="text-lg font-medium text-blue-300">AdSense Performance (Simulated)</h4>
            <div className="space-y-2">
              <div className="flex justify-between"><span className="text-slate-300">Impressions:</span><span className="text-white font-semibold">8,921</span></div>
              <div className="flex justify-between"><span className="text-slate-300">Revenue:</span><span className="text-green-400 font-semibold">${(stats.totalRevenue * 0.4).toFixed(2)}</span></div>
              <div className="flex justify-between"><span className="text-slate-300">CTR:</span><span className="text-white font-semibold">{stats.avgCtr}%</span></div>
            </div>
          </div>
        </div>
        <Button onClick={onRefresh} className="mt-6 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700">
          <RefreshCw className="mr-2 h-4 w-4" /> Refresh Analytics
        </Button>
      </Card>
    </div>
  );
};

export default MonetizationTab;