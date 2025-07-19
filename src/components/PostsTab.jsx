import React from 'react';
import { motion } from 'framer-motion';
import { Bot, Rss, Eye, Edit, Trash2, Upload, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';

const PostCard = ({ post, onPublish, onDelete }) => {
  const { toast } = useToast();

  const getStatusBadge = (status) => {
    switch (status) {
      case 'published':
        return 'bg-green-600 hover:bg-green-700';
      case 'draft':
        return 'bg-slate-500 hover:bg-slate-600';
      case 'generated':
        return 'bg-blue-600 hover:bg-blue-700';
      case 'error':
        return 'bg-red-600 hover:bg-red-700';
      default:
        return 'bg-secondary';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="p-6 bg-slate-800/50 border-slate-700 hover:border-purple-500/50 transition-colors">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="lg:w-48 h-32 bg-slate-700 rounded-lg overflow-hidden flex-shrink-0">
            <img 
              alt={post.image_alt_text || `Blog post image for ${post.title}`}
              className="w-full h-full object-cover"
              src={post.image_url || "https://images.unsplash.com/photo-1504983875-d3b163aba9e6"} />
          </div>
          <div className="flex-1 space-y-3">
            <div className="flex items-start justify-between">
              <h3 className="text-xl font-semibold text-white line-clamp-2">{post.title}</h3>
              <Badge className={getStatusBadge(post.status)}>
                {post.status}
              </Badge>
            </div>
            <p className="text-slate-300 line-clamp-2">{post.summary}</p>
            <div className="flex items-center gap-4 text-sm text-slate-400">
              <span>SEO Score: {post.seo_score || 'N/A'}</span>
              <span>Created: {new Date(post.created_at).toLocaleDateString()}</span>
              {post.wordpress_id && <span>WP ID: {post.wordpress_id}</span>}
            </div>
            <div className="flex gap-2 flex-wrap">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm"><Eye className="mr-2 h-4 w-4" />Preview</Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-slate-800 border-slate-700">
                  <DialogHeader><DialogTitle className="text-white">{post.title}</DialogTitle></DialogHeader>
                  <div className="space-y-4 text-slate-300">
                    <div className="w-full h-64 bg-slate-700 rounded-lg overflow-hidden">
                        <img 
                          alt={post.image_alt_text || `Preview image for ${post.title}`}
                          className="w-full h-full object-cover"
                          src={post.image_url || "https://images.unsplash.com/photo-1504983875-d3b163aba9e6"} />
                    </div>
                    <p><strong>Summary:</strong> {post.summary}</p>
                    <div className="prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: post.content }} />
                  </div>
                </DialogContent>
              </Dialog>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm"><FileText className="mr-2 h-4 w-4" />Logs</Button>
                </DialogTrigger>
                <DialogContent className="bg-slate-800 border-slate-700">
                  <DialogHeader><DialogTitle className="text-white">Generation Logs</DialogTitle></DialogHeader>
                  <div className="space-y-2 text-slate-300 max-h-96 overflow-y-auto">
                    {(post.logs || []).map((log, index) => (
                      <div key={index} className="text-sm p-2 bg-slate-700/50 rounded">
                        <span className="font-mono text-xs text-slate-400">{new Date(log.timestamp).toLocaleString()}: </span>
                        <span className={log.level === 'ERROR' ? 'text-red-400' : 'text-green-400'}>{log.level}: </span>
                        <span>{log.message}</span>
                      </div>
                    ))}
                  </div>
                </DialogContent>
              </Dialog>
              {post.status !== 'published' && (
                <Button size="sm" onClick={() => onPublish(post.id)} className="bg-green-600 hover:bg-green-700">
                  <Upload className="mr-2 h-4 w-4" />Publish
                </Button>
              )}
              <Button variant="destructive" size="sm" onClick={() => onDelete(post.id)}>
                <Trash2 className="mr-2 h-4 w-4" />Delete
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

const PostsTab = ({ posts, onPublish, onDelete }) => (
  <>
    <div className="flex justify-between items-center">
      <h2 className="text-2xl font-bold text-white">Content Pipeline</h2>
    </div>
    <div className="grid gap-6">
      {posts.length === 0 ? (
        <Card className="p-12 text-center bg-slate-800/50 border-slate-700">
          <Rss className="h-16 w-16 text-slate-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No Posts Yet</h3>
          <p className="text-slate-400">Your generated posts will appear here. Add an RSS feed and start the automation!</p>
        </Card>
      ) : (
        posts.map((post) => (
          <PostCard key={post.id} post={post} onPublish={onPublish} onDelete={onDelete} />
        ))
      )}
    </div>
  </>
);

export default PostsTab;