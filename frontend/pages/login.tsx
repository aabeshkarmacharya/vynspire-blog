import { useEffect, useState } from 'react';
import { Box, Button, FormControl, FormLabel, Input, Heading, useToast } from '@chakra-ui/react';
import { useDispatch, useSelector } from 'react-redux';
import { loginSuccess } from '../lib/store';
import { apiPost } from '../lib/api';
import { decodeJwt, JwtPayload } from '../lib/jwt';
import { useRouter } from 'next/router';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
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
      const data = await apiPost('/login/', { username, password });
      const { access, refresh } = (data.tokens || {}) as { access?: string; refresh?: string };
      if (!access) throw new Error('No access token');
      const payload = (decodeJwt(access) || {}) as JwtPayload;
      const user = { id: payload.sub ? parseInt(String(payload.sub), 10) : null, username: payload.username };
      dispatch(loginSuccess({ access, refresh: refresh ?? null, user }));
      toast({ title: 'Logged in', status: 'success' });
      router.push('/');
    } catch (err: any) {
      toast({ title: 'Login failed', description: err.message || 'Error', status: 'error' });
    } finally {
      setLoading(false);
    }
  };

  if (auth?.access) {
    return <Box p={4}>Redirecting...</Box>;
  }

  return (
    <Box p={4} maxW="480px" mx="auto">
      <Heading size="md" mb={4}>Login</Heading>
      <Box as="form" onSubmit={onSubmit}>
        <FormControl mb={3}>
          <FormLabel>Username</FormLabel>
          <Input value={username} onChange={(e) => setUsername(e.target.value)} />
        </FormControl>
        <FormControl mb={3}>
          <FormLabel>Password</FormLabel>
          <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </FormControl>
        <Button colorScheme="teal" type="submit" isLoading={loading}>Login</Button>
      </Box>
    </Box>
  );
}
