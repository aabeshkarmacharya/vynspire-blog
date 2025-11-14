import React, { useEffect, useRef, useState } from 'react';
import { Box, Button, FormControl, FormLabel, Input, Heading, useToast } from '@chakra-ui/react';
import { apiPost } from '../lib/api';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const router = useRouter();
  const auth = useSelector((s: any) => s.auth);

  // If already logged in, redirect to home
  useEffect(() => {
    if (auth?.access) {
      router.replace('/');
    }
  }, [auth?.access, router]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiPost('/register/', { username, password });
      toast({ title: 'Registered successfully', description: 'Please login now', status: 'success' });
      router.push('/login');
    } catch (err: any) {
      toast({ title: 'Registration failed', description: err.message || 'Error', status: 'error' });
    } finally {
      setLoading(false);
    }
  };

  if (auth?.access) {
    return <Box p={4}>Redirecting...</Box>;
  }

  return (
    <Box p={4} maxW="480px" mx="auto">
      <Heading size="md" mb={4}>Register</Heading>
      <Box as="form" onSubmit={onSubmit}>
        <FormControl mb={3}>
          <FormLabel>Username</FormLabel>
          <Input value={username} onChange={(e) => setUsername(e.target.value)} />
        </FormControl>
        <FormControl mb={3}>
          <FormLabel>Password</FormLabel>
          <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </FormControl>
        <Button colorScheme="teal" type="submit" isLoading={loading}>Register</Button>
      </Box>
    </Box>
  );
}
