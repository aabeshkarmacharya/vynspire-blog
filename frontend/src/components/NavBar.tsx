import Link from 'next/link';
import { Flex, Spacer, Button, Text } from '@chakra-ui/react';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../lib/store';

export default function NavBar() {
  const auth = useSelector((s: any) => s.auth);
  const dispatch = useDispatch();
  const isAuthed = !!auth?.access;
  return (
    <Flex as="nav" p={4} borderBottom="1px solid #eee" align="center" gap={3}>
      <Link href="/">
        <Text fontWeight="bold">Blog</Text>
      </Link>
      <Spacer />
      {isAuthed ? (
        <>
          <Text mr={2}>Hello, {auth?.user?.username || 'user'}</Text>
          <Link href="/posts/new"><Button colorScheme="teal" size="sm" mr={2}>Create Post</Button></Link>
          <Button size="sm" onClick={() => dispatch(logout())}>Logout</Button>
        </>
      ) : (
        <>
          <Link href="/login"><Button size="sm" mr={2}>Login</Button></Link>
          <Link href="/register"><Button size="sm" variant="outline">Register</Button></Link>
        </>
      )}
    </Flex>
  );
}
