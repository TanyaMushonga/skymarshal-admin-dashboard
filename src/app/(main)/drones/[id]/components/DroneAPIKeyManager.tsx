'use client';

import { useState, useEffect } from 'react';
import { Key, RefreshCw, Copy, Check, Eye, EyeOff, Trash2, Plus, ShieldAlert } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import Modal from '@/components/ui/Modal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

interface APIKey {
  id: string | number;
  name: string;
  prefix: string;
  is_active?: boolean;
  created_at?: string;
}

interface DroneAPIKeyManagerProps {
  droneId: string;
  initialKeys?: APIKey[] | null;
}

export default function DroneAPIKeyManager({ droneId, initialKeys }: DroneAPIKeyManagerProps) {
  const [keys, setKeys] = useState<APIKey[]>(initialKeys || []);
  const [rawKey, setRawKey] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showKey, setShowKey] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [revokeConfirmOpen, setRevokeConfirmOpen] = useState(false);
  const [pendingRevokeId, setPendingRevokeId] = useState<string | number | null>(null);

  const fetchKeys = async () => {
    try {
      const data = await api.get<APIKey[]>(`/drones/${droneId}/keys/`);
      setKeys(data);
    } catch (error) {
      console.error('Failed to fetch keys:', error);
    }
  };

  useEffect(() => {
    if (!initialKeys) {
      fetchKeys();
    }
  }, [droneId]);

  const generateKey = async () => {
    if (!newKeyName.trim()) {
      toast.error('Please provide a name for the key');
      return;
    }
    
    setIsLoading(true);
    try {
      const data = await api.post<APIKey & { raw_key: string }>(
        `/drones/${droneId}/generate_key/`,
        { name: newKeyName }
      );
      setRawKey(data.raw_key);
      setNewKeyName('');
      setIsModalOpen(false);
      fetchKeys();
      toast.success('API Key generated successfully');
    } catch (error) {
      console.error('Failed to generate API key:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRevokeClick = (keyId: string | number) => {
    setPendingRevokeId(keyId);
    setRevokeConfirmOpen(true);
  };

  const confirmRevokeKey = async () => {
    if (pendingRevokeId === null) return;
    
    setIsLoading(true);
    try {
      await api.post(`/drones/${droneId}/revoke_key/`, { key_id: pendingRevokeId });
      toast.success('API Key revoked');
      fetchKeys();
    } catch (error) {
      console.error('Failed to revoke key:', error);
    } finally {
      setIsLoading(false);
      setRevokeConfirmOpen(false);
      setPendingRevokeId(null);
    }
  };

  const copyToClipboard = () => {
    if (!rawKey) return;
    navigator.clipboard.writeText(rawKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.info('API Key copied to clipboard');
  };

  return (
    <div className="border-t border-border pt-6 mt-2">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
          <Key size={16} className="text-primary" />
          Authentication & API
        </h3>
        <button
          onClick={() => setIsModalOpen(true)}
          className="text-[10px] bg-primary/10 hover:bg-primary/20 text-primary px-2 py-1 rounded flex items-center gap-1 font-bold transition-colors"
        >
          <Plus size={12} />
          New Key
        </button>
      </div>

      <div className="space-y-2">
        {keys.length === 0 ? (
          <p className="text-xs text-muted-foreground italic text-center py-4 bg-muted/20 rounded-lg">
            No active keys found.
          </p>
        ) : (
          keys.filter(k => k.is_active !== false).map((apiKey) => (
            <div key={apiKey.id} className="group relative bg-muted/30 border border-border/50 rounded-lg p-3 hover:bg-muted/50 transition-all">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-bold text-foreground">{apiKey.name}</p>
                  <p className="text-[10px] font-mono text-muted-foreground mt-0.5">
                    Prefix: <span className="text-foreground font-semibold">{apiKey.prefix.substring(0, 5)}...</span>
                  </p>
                </div>
                <button
                  onClick={() => handleRevokeClick(apiKey.id)}
                  className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-destructive/10 text-destructive rounded-md transition-all"
                  title="Revoke Key"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <p className="text-[10px] text-muted-foreground mt-4 leading-relaxed text-center px-2">
        API keys are used for secure ESP32-CAM communication. 
        Revoked keys cannot be restored.
      </p>

      {/* Generation Success Modal */}
      <Modal 
        isOpen={!!rawKey} 
        onClose={() => setRawKey(null)} 
        title="Key Generated Successfully"
      >
        <div className="space-y-4 py-2">
          <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-primary uppercase">Raw API Key</span>
              <span className="text-[10px] text-amber-600 font-bold animate-pulse flex items-center gap-1">
                <ShieldAlert size={10} /> SHOWING ONCE
              </span>
            </div>
            
            <div className="relative group">
              <input
                type={showKey ? "text" : "password"}
                readOnly
                value={rawKey || ''}
                className="w-full bg-background border border-border rounded-lg py-2 px-3 pr-20 text-xs font-mono text-foreground focus:ring-1 focus:ring-primary/20 outline-none"
              />
              <div className="absolute right-1 top-1 flex gap-1">
                <button
                  onClick={() => setShowKey(!showKey)}
                  className="p-1.5 hover:bg-muted rounded-md text-muted-foreground transition-colors"
                >
                  {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
                <button
                  onClick={copyToClipboard}
                  className="p-1.5 hover:bg-muted rounded-md text-muted-foreground transition-colors"
                >
                  {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                </button>
              </div>
            </div>
            
            <p className="text-[10px] text-muted-foreground leading-relaxed">
              <span className="text-amber-600 font-bold">CRITICAL:</span> Copy this key now! 
              It will <span className="text-foreground font-bold">never</span> be shown again for security reasons.
            </p>
          </div>
          
          <button
            onClick={() => setRawKey(null)}
            className="w-full py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl text-sm font-bold transition-all shadow-sm"
          >
            I have saved the key securely
          </button>
        </div>
      </Modal>

      {/* Create Key Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Generate New API Key"
      >
        <div className="space-y-4 py-2">
          <div>
            <label className="block text-xs font-bold text-muted-foreground uppercase mb-1.5 ml-1">
              Key Name
            </label>
            <input
              type="text"
              placeholder="e.g. ESP32-CAM North Gate"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              autoFocus
            />
            <p className="text-[10px] text-muted-foreground mt-2 ml-1">
              Give your key a descriptive name to track its usage.
            </p>
          </div>

          <div className="pt-2 flex gap-2">
            <button
              onClick={generateKey}
              disabled={isLoading}
              className="flex-1 py-2.5 bg-primary hover:bg-primary/90 disabled:opacity-50 text-primary-foreground rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2"
            >
              {isLoading ? <RefreshCw size={14} className="animate-spin" /> : <Plus size={14} />}
              Generate Key
            </button>
            <button
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2.5 bg-muted hover:bg-muted/80 text-foreground rounded-xl text-sm font-bold transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={revokeConfirmOpen}
        onClose={() => {
          setRevokeConfirmOpen(false);
          setPendingRevokeId(null);
        }}
        onConfirm={confirmRevokeKey}
        title="Revoke API Key"
        description="Are you sure you want to revoke this key? It will immediately stop working and this action cannot be undone."
        confirmText="Revoke Key"
        variant="destructive"
        loading={isLoading}
      />
    </div>
  );
}
