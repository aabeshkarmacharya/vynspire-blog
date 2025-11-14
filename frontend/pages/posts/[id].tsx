import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Box, Heading, Text, Button, useToast, Flex } from '@chakra-ui/react';
import Link from 'next/link';
import { apiGet, apiDelete } from '../../lib/api';
import { useSelector } from 'react-redux';
import Time from '../../src/components/Time';

type Post = { id: number; title: string; content: string; author: number; created_at: string };

export default function PostDetailPage() {
  const router = useRouter();
  const toast = useToast();
  const { id } = router.query as { id?: string };
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const auth = useSelector((s: any) => s.auth);
  const isAuthor = !!(auth?.user?.id && post?.author && Number(auth.user.id) === Number(post.author));

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

  const onDelete = async () => {
    setDeleting(true);
    try {
      await apiDelete(`/posts/${id}`, auth?.access);
      toast({ title: 'Deleted', status: 'success' });
      router.push('/');
    } catch (err: any) {
      toast({ title: 'Delete failed', description: err.message, status: 'error' });
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <Box p={4}>Loading...</Box>;
  if (!post) return <Box p={4}>Not found</Box>;

  return (
    <Box p={4} maxW="800px" mx="auto">
      <Heading>{post.title}</Heading>
      <Text fontSize="sm" color="gray.600" mb={4}>by {post.author} · <Time iso={post.created_at} /></Text>
      <Text whiteSpace="pre-wrap">{post.content}</Text>

      <Flex mt={4} gap={2}>
        <Button as={Link as any} href="/" variant="outline">Back</Button>
        {isAuthor && (
          <>
            <Button as={Link as any} href={`/posts/${post.id}/edit`} colorScheme="teal">Edit</Button>
            <Button colorScheme="red" onClick={onDelete} isLoading={deleting}>Delete</Button>
          </>
        )}
      </Flex>
    </Box>
  );
}
