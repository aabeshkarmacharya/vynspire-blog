import { useSelector } from 'react-redux';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Box, Heading, useToast } from '@chakra-ui/react';
import PostForm, { PostFormValues } from '../../src/components/PostForm';
import { apiPost } from '../../lib/api';

export default function NewPostPage() {
  const auth = useSelector((s: any) => s.auth);
  const router = useRouter();
  const toast = useToast();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!auth?.access) {
      toast({ title: 'Please login to create posts', status: 'info' });
      router.push('/login');
    }
  }, [auth?.access, router, toast]);

  const onSubmit = async (payload: PostFormValues) => {
    setSubmitting(true);
    try {
      const created = await apiPost('/posts/', payload, auth?.access);
      toast({ title: 'Post created', status: 'success' });
      router.push(`/posts/${created.id}`);
    } catch (err: any) {
      toast({ title: 'Create failed', description: err.message, status: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box p={4} maxW="800px" mx="auto">
      <Heading size="lg" mb={4}>New Post</Heading>
      <PostForm onSubmit={onSubmit} submitting={submitting} />
    </Box>
  );
}
