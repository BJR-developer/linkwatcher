'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import AddUrlDialog from './add-url-dialog';
import DeleteUrlDialog from './delete-url-dialog';
import { formatDistanceToNow } from 'date-fns';

interface Url {
  _id: string;
  url: string;
  status: 'up' | 'down' | 'pending';
  lastChecked: string | null;
  checksCount: number;
  checkInterval: number;
  lastStatus?: {
    code: number;
    message: string;
  };
}

export default function UrlMonitor() {
  const [urls, setUrls] = useState<Url[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [deleteUrlId, setDeleteUrlId] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchUrls = async () => {
    try {
      const response = await fetch('/api/urls');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setUrls(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch URLs. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUrls();
  }, []);

  const handleAddUrl = async (newUrl: Omit<Url, '_id'>) => {
    try {
      const response = await fetch('/api/urls', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newUrl),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setUrls((prev) => [data, ...prev]);
      setIsAddDialogOpen(false);
      toast({
        title: 'Success',
        description: 'URL has been added successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add URL. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteUrl = async (id: string, password: string) => {
    try {
      const response = await fetch(`/api/urls/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete URL');
      }

      setUrls((prev) => prev.filter((url) => url._id !== id));
      setDeleteUrlId(null);
      toast({
        title: 'Success',
        description: 'URL has been deleted successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete URL',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">LinkWatcher</h1>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add URL
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : urls.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">No URLs added yet. Add one to start monitoring!</p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {urls.map((url) => (
            <Card key={url._id} className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="space-y-1">
                  <h3 className="font-medium truncate" title={url.url}>
                    {url.url}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Checks every {url.checkInterval} days
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setDeleteUrlId(url._id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div
                    className={`h-2 w-2 rounded-full ${
                      url.status === 'up'
                        ? 'bg-green-500'
                        : url.status === 'down'
                        ? 'bg-red-500'
                        : 'bg-yellow-500'
                    }`}
                  />
                  <span className="text-sm capitalize">{url.status}</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Checked {url.checksCount} times
                </p>
                {url.lastChecked && (
                  <p className="text-sm text-muted-foreground">
                    Last check: {formatDistanceToNow(new Date(url.lastChecked), { addSuffix: true })}
                  </p>
                )}
                {url.lastStatus && (
                  <p className="text-sm text-muted-foreground">
                    Status: {url.lastStatus.code} - {url.lastStatus.message}
                  </p>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      <AddUrlDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSubmit={handleAddUrl}
      />

      <DeleteUrlDialog
        open={!!deleteUrlId}
        onOpenChange={() => setDeleteUrlId(null)}
        onConfirm={(password) => deleteUrlId && handleDeleteUrl(deleteUrlId, password)}
      />
    </div>
  );
}