import { useState, useEffect } from 'react';
import { Box, Button, FormControl, FormLabel, Input, Textarea, useToast } from '@chakra-ui/react';

export type PostFormValues = { title: string; content: string };

export default function PostForm({
  initial = { title: '', content: '' },
  onSubmit,
  submitting = false,
}: {
  initial?: PostFormValues;
  onSubmit: (values: PostFormValues) => Promise<void> | void;
  submitting?: boolean;
}) {
  const [title, setTitle] = useState<string>(initial.title || '');
  const [content, setContent] = useState<string>(initial.content || '');
  const toast = useToast();

  useEffect(() => {
    setTitle(initial.title || '');
    setContent(initial.content || '');
  }, [initial.title, initial.content]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      toast({ title: 'Validation', description: 'Title and content are required', status: 'error' });
      return;
    }
    await onSubmit({ title: title.trim(), content: content.trim() });
  };

  return (
    <Box as="form" onSubmit={handleSubmit} maxW="600px" mx="auto" p={4}>
      <FormControl mb={3}>
        <FormLabel>Title</FormLabel>
        <Input value={title} autoFocus={true} onChange={(e) => setTitle(e.target.value)} />
      </FormControl>
      <FormControl mb={3}>
        <FormLabel>Content</FormLabel>
        <Textarea rows={8} value={content} onChange={(e) => setContent(e.target.value)} />
      </FormControl>
      <Button colorScheme="teal" type="submit" isLoading={submitting}>Save</Button>
    </Box>
  );
}
