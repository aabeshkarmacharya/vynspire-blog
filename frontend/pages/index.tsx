import Link from 'next/link';
import { Box, Heading, Text, Button, Flex } from '@chakra-ui/react';
import { API_BASE } from '../lib/api';
import Time from '../src/components/Time';
import { useSelector } from 'react-redux';
import type { GetServerSideProps } from 'next';

type Post = { id: number; title: string; content: string; author: number; created_at: string };
type PageData = {
  count: number;
  page: number;
  page_size: number;
  total_pages: number;
  results: Post[];
};

export const getServerSideProps: GetServerSideProps<{ data: PageData }> = async (context) => {
  const page = parseInt((context.query.page as string) || '1', 10);
  const page_size = parseInt((context.query.page_size as string) || '10', 10);
  try {
    const res = await fetch(`${API_BASE}/posts/?page=${page}&page_size=${page_size}`);
    const data = (await res.json()) as PageData;
    return { props: { data } };
  } catch (e) {
    return {
      props: {
        data: { count: 0, page: 1, page_size: 10, total_pages: 0, results: [] },
      },
    };
  }
};

export default function Home({ data }: { data: PageData }) {
  const auth = useSelector((s: any) => s.auth);
  const isAuthed = !!auth?.access;
  const { results = [], page = 1, total_pages = 1, page_size = 10, count = 0 } = data || ({} as PageData);

  const prevPage = page > 1 ? page - 1 : null;
  const nextPage = page < total_pages ? page + 1 : null;

  return (
    <Box p={4} maxW="800px" mx="auto">
      <Flex align="center" justify="space-between" mb={4}>
        <Heading size="lg">Posts</Heading>
        {isAuthed && (
          <Link href="/posts/new"><Button colorScheme="teal">Create Post</Button></Link>
        )}
      </Flex>
      {results.length === 0 && <Text>No posts yet.</Text>}
      {results.map((p) => (
        <Box key={p.id} p={4} borderWidth="1px" borderRadius="md" mb={3}>
          <Link href={`/posts/${p.id}`}><Heading size="md">{p.title}</Heading></Link>
          <Text fontSize="sm" color="gray.600">by user {p.author} · <Time iso={p.created_at} /></Text>
          <Text mt={2} noOfLines={3}>{p.content}</Text>
        </Box>
      ))}
      <Flex mt={4} gap={2}>
        <Button as={Link as any} href={`/?page=1&page_size=${page_size}`} isDisabled={page === 1}>First</Button>
        <Button as={Link as any} href={`/?page=${prevPage || 1}&page_size=${page_size}`} isDisabled={!prevPage}>Prev</Button>
        <Box px={3} py={2}>Page {page} / {total_pages} ({count})</Box>
        <Button as={Link as any} href={`/?page=${nextPage || page}&page_size=${page_size}`} isDisabled={!nextPage}>Next</Button>
        <Button as={Link as any} href={`/?page=${total_pages || 1}&page_size=${page_size}`} isDisabled={page === total_pages}>Last</Button>
      </Flex>
    </Box>
  );
}
