import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_TASK_COMMENTS } from '../../graphql/queries';
import { CREATE_TASK_COMMENT, UPDATE_TASK_COMMENT, DELETE_TASK_COMMENT } from '../../graphql/mutations';
import type { TaskComment, TaskCommentInput } from '../../types';
import LoadingSpinner from '../common/LoadingSpinner';

interface CommentSectionProps {
  taskId: string;
  taskTitle: string;
}

export default function CommentSection({ taskId, taskTitle }: CommentSectionProps) {
  const [newComment, setNewComment] = useState('');
  const [authorEmail, setAuthorEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  const { loading, error, data, refetch } = useQuery(GET_TASK_COMMENTS, {
    variables: { taskId },
  });

  const [createComment] = useMutation(CREATE_TASK_COMMENT);
  const [updateComment] = useMutation(UPDATE_TASK_COMMENT);
  const [deleteComment] = useMutation(DELETE_TASK_COMMENT);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !authorEmail.trim()) return;

    setIsSubmitting(true);
    try {
      const input: TaskCommentInput = {
        taskId,
        content: newComment.trim(),
        authorEmail: authorEmail.trim(),
      };

      const result = await createComment({
        variables: { input },
      });

      if (result.data?.createTaskComment?.success) {
        setNewComment('');
        refetch();
      } else {
        alert('Failed to add comment: ' + (result.data?.createTaskComment?.errors?.join(', ') || 'Unknown error'));
      }
    } catch (error: any) {
      alert('Error adding comment: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async (commentId: string) => {
    if (!editContent.trim()) return;

    try {
      const result = await updateComment({
        variables: {
          id: commentId,
          content: editContent.trim(),
        },
      });

      if (result.data?.updateTaskComment?.success) {
        setEditingComment(null);
        setEditContent('');
        refetch();
      } else {
        alert('Failed to update comment: ' + (result.data?.updateTaskComment?.errors?.join(', ') || 'Unknown error'));
      }
    } catch (error: any) {
      alert('Error updating comment: ' + error.message);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) {
      return;
    }

    try {
      const result = await deleteComment({
        variables: { id: commentId },
      });

      if (result.data?.deleteTaskComment?.success) {
        refetch();
      } else {
        alert('Failed to delete comment: ' + (result.data?.deleteTaskComment?.errors?.join(', ') || 'Unknown error'));
      }
    } catch (error: any) {
      alert('Error deleting comment: ' + error.message);
    }
  };

  const startEdit = (comment: TaskComment) => {
    setEditingComment(comment.id);
    setEditContent(comment.content);
  };

  const cancelEdit = () => {
    setEditingComment(null);
    setEditContent('');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInHours * 60);
      return diffInMinutes <= 1 ? 'Just now' : `${diffInMinutes} minutes ago`;
    } else if (diffInHours < 24) {
      const hours = Math.floor(diffInHours);
      return `${hours} hour${hours === 1 ? '' : 's'} ago`;
    } else if (diffInHours < 168) {
      const days = Math.floor(diffInHours / 24);
      return `${days} day${days === 1 ? '' : 's'} ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    }
  };

  if (loading) {
    return (
      <div className="py-4">
        <LoadingSpinner text="Loading comments..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-4 text-center">
        <p className="text-red-600 text-sm">Error loading comments: {error.message}</p>
        <button onClick={() => refetch()} className="text-primary-600 text-sm hover:underline mt-2">
          Try again
        </button>
      </div>
    );
  }

  const comments: TaskComment[] = data?.taskComments || [];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Comments ({comments.length})
        </h3>
        <p className="text-sm text-gray-600">Discuss about "{taskTitle}"</p>
      </div>

      {/* Add new comment form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Your Email</label>
          <input
            type="email"
            value={authorEmail}
            onChange={(e) => setAuthorEmail(e.target.value)}
            className="input"
            placeholder="Enter your email"
            required
          />
        </div>
        <div>
          <label className="label">Add a comment</label>
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="input"
            rows={3}
            placeholder="Write your comment here..."
            required
          />
        </div>
        <button
          type="submit"
          disabled={isSubmitting || !newComment.trim() || !authorEmail.trim()}
          className="btn-primary"
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Adding...
            </>
          ) : (
            'Add Comment'
          )}
        </button>
      </form>

      {/* Comments list */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <div className="text-center py-8">
            <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p className="text-gray-500 text-sm">No comments yet. Be the first to comment!</p>
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-primary-600 text-sm font-medium">
                      {comment.authorEmail.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{comment.authorEmail}</p>
                    <p className="text-xs text-gray-500">{formatDate(comment.createdAt)}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => startEdit(comment)}
                    className="text-gray-400 hover:text-gray-600 text-xs"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(comment.id)}
                    className="text-gray-400 hover:text-red-600 text-xs"
                  >
                    Delete
                  </button>
                </div>
              </div>

              {editingComment === comment.id ? (
                <div className="space-y-2">
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="input text-sm"
                    rows={3}
                  />
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(comment.id)}
                      className="btn-primary btn-sm"
                      disabled={!editContent.trim()}
                    >
                      Save
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="btn-secondary btn-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{comment.content}</p>
              )}

              {comment.updatedAt !== comment.createdAt && editingComment !== comment.id && (
                <p className="text-xs text-gray-400 mt-2">
                  Edited {formatDate(comment.updatedAt)}
                </p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}