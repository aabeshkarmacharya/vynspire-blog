import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Box, Heading, useToast } from '@chakra-ui/react';
import { useSelector } from 'react-redux';
import PostForm, { PostFormValues } from '../../../src/components/PostForm';
import { apiGet, apiPut } from '../../../lib/api';

type Post = { id: number; title: string; content: string; author: number; created_at: string };

export default function EditPostPage() {
  const router = useRouter();
  const toast = useToast();
  const { id } = router.query as { id?: string };
  const auth = useSelector((s: any) => s.auth);
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!auth?.access) {
      toast({ title: 'Please login to edit posts', status: 'info' });
      router.push('/login');
      return;
    }
  }, [auth?.access, router, toast]);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const data = await apiGet(`/posts/${id}`);
        setPost(data as Post);
      } catch (err: any) {
        toast({ title: 'Failed to load', description: err.message, status: 'error' });
      } finally {
        setLoading(false);
      }
    })();
  }, [id, toast]);

  const isAuthor = !!(auth?.user?.id && post?.author && Number(auth.user.id) === Number(post.author));

  const onSubmit = async ({ title, content }: PostFormValues) => {
    if (!isAuthor) {
      toast({ title: 'Forbidden', description: 'Only author can edit', status: 'error' });
      return;
    }
    setSaving(true);
    try {
      const updated = await apiPut(`/posts/${id}`, { title, content }, auth?.access);
      toast({ title: 'Updated', status: 'success' });
      router.push(`/posts/${updated.id}`);
    } catch (err: any) {
      toast({ title: 'Update failed', description: err.message, status: 'error' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Box p={4}>Loading...</Box>;
  if (!post) return <Box p={4}>Not found</Box>;
  if (!isAuthor) return <Box p={4}>You are not the author of this post.</Box>;

  return (
    <Box p={4} maxW="800px" mx="auto">
      <Heading size="lg" mb={4}>Edit Post</Heading>
      <PostForm initial={{ title: post.title, content: post.content }} onSubmit={onSubmit} submitting={saving} />
    </Box>
  );
}
