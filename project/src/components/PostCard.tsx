import React, { useState } from 'react';
import { Heart, MessageCircle, Flame } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { Post } from '../types';
import { useReactions } from '../hooks/useReactions';
import { ElderlyReactions } from './ElderlyReactions';
import { PostMenu } from './PostMenu';
import { supabase } from '../lib/supabase';

interface PostCardProps {
  post: Post;
  onDelete?: () => void;
}

export const PostCard: React.FC<PostCardProps> = ({ post, onDelete }) => {
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isLiking, setIsLiking] = useState(false);
  const [isCommenting, setIsCommenting] = useState(false);
  const [optimisticLikeCount, setOptimisticLikeCount] = useState(post.likes_count);
  const [optimisticHasLiked, setOptimisticHasLiked] = useState(post.user_has_liked);
  const [optimisticComments, setOptimisticComments] = useState<Post['reactions']>([]);
  const { toggleLike, addComment } = useReactions();
  const [isOwner, setIsOwner] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  React.useEffect(() => {
    checkOwnership();
  }, []);

  const checkOwnership = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setIsOwner(user?.id === post.user_id);
  };

  const handleDelete = async () => {
    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', post.id);

      if (error) throw error;
      onDelete?.();
    } catch (err) {
      console.error('Error deleting post:', err);
    }
  };

  const comments = [...(post.reactions?.filter(
    (reaction) => reaction.reaction_type === 'COMMENT'
  ) || []), ...optimisticComments];

  const elderlyReactions = post.reactions?.filter(
    (reaction) => reaction.reaction_type === 'SLIDESHOW' && reaction.emoji_type
  ) || [];

  const handleLike = async () => {
    if (isLiking) return;
    try {
      setIsLiking(true);
      setOptimisticHasLiked(!optimisticHasLiked);
      setOptimisticLikeCount(optimisticHasLiked ? optimisticLikeCount - 1 : optimisticLikeCount + 1);
      
      await toggleLike(post.id);
    } catch (err) {
      setOptimisticHasLiked(!optimisticHasLiked);
      setOptimisticLikeCount(optimisticHasLiked ? optimisticLikeCount + 1 : optimisticLikeCount - 1);
      console.error('Error liking post:', err);
    } finally {
      setIsLiking(false);
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isCommenting || !newComment.trim()) return;
    
    try {
      setIsCommenting(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('name, avatar_url')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;

      const optimisticComment = {
        id: `temp-${Date.now()}`,
        user_id: user.id,
        reaction_type: 'COMMENT' as const,
        comment: newComment.trim(),
        created_at: new Date().toISOString(),
        user: {
          name: profile.name,
          avatar_url: profile.avatar_url
        }
      };

      setOptimisticComments(prev => [...prev, optimisticComment]);
      setNewComment('');

      await addComment(post.id, newComment.trim());
    } catch (err) {
      console.error('Error adding comment:', err);
      setOptimisticComments(prev => prev.filter(c => c.id !== `temp-${Date.now()}`));
    } finally {
      setIsCommenting(false);
    }
  };

  // Check if the image is vertical based on URL parameters
  const isVertical = post.media_url.includes('orientation=vertical');

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden transform transition-transform duration-200 hover:translate-y-[-2px] hover:shadow-md">
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center flex-1">
            <img
              src={post.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100'}
              alt={post.username}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div className="ml-3">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-gray-800">{post.username}</h3>
                <div className="flex items-center bg-orange-100 px-2 py-0.5 rounded-full">
                  <Flame className="w-4 h-4 text-orange-500 mr-1" />
                  <span className="text-sm font-medium text-orange-600">
                    {post.streak_count} day{post.streak_count !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
              <p className="text-xs text-gray-500">
                {formatDistanceToNow(new Date(post.timestamp), { addSuffix: true })}
              </p>
            </div>
          </div>
          {isOwner && <PostMenu onDelete={handleDelete} isOwner={isOwner} />}
        </div>
      </div>

      <div className={`relative ${isVertical ? 'aspect-[10/16]' : 'aspect-[16/10]'}`}>
        {post.media_type === 'video' ? (
          <video
            src={post.media_url}
            className="w-full h-full object-cover"
            controls
          />
        ) : (
          <img
            src={post.media_url}
            alt="Post content"
            className={`w-full h-full object-cover ${!imageLoaded ? 'opacity-0' : 'opacity-100'}`}
            style={{ transition: 'opacity 0.3s ease-in-out' }}
            onLoad={() => setImageLoaded(true)}
            loading="lazy"
          />
        )}
      </div>

      <div className="p-4">
        <div className="flex gap-4 mb-4">
          <button
            onClick={handleLike}
            disabled={isLiking}
            className={`flex items-center gap-1 transition-colors ${
              optimisticHasLiked
                ? 'text-red-500'
                : 'text-gray-500 hover:text-red-500'
            }`}
          >
            <Heart className={`w-6 h-6 ${optimisticHasLiked ? 'fill-current' : ''}`} />
            {optimisticLikeCount > 0 && (
              <span className="text-sm font-medium">{optimisticLikeCount}</span>
            )}
          </button>
          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-1 text-gray-500 hover:text-primary-500 transition-colors"
          >
            <MessageCircle className="w-6 h-6" />
            {comments.length > 0 && (
              <span className="text-sm font-medium">{comments.length}</span>
            )}
          </button>
        </div>

        <p className="text-gray-800 mb-2">
          <span className="font-semibold">{post.username}</span>{' '}
          {post.caption}
        </p>

        {elderlyReactions.length > 0 && (
          <ElderlyReactions reactions={elderlyReactions} />
        )}

        {showComments && (
          <div className="mt-4 space-y-4">
            <div className="max-h-60 overflow-y-auto space-y-3">
              {comments.map((reaction) => (
                <div key={reaction.id} className="flex items-start gap-2">
                  <img
                    src={reaction.user?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100'}
                    alt={reaction.user?.name || 'User'}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div className="flex-1 bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm text-gray-900">
                        {reaction.user?.name}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(reaction.created_at), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 mt-1">{reaction.comment}</p>
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={handleComment} className="relative mt-3">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="w-full pl-4 pr-12 py-2 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <button
                type="submit"
                disabled={isCommenting || !newComment.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-primary-600 hover:text-primary-700 disabled:text-gray-400"
              >
                <MessageCircle className="w-5 h-5" />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};