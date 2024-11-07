import { useState } from 'react';
import {
  Box,
  Button,
  Container,
  Divider,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Stack,
  Text,
  useColorModeValue,
  useToast,
  Icon,
  VStack,
} from '@chakra-ui/react';
import { Mail, LogIn } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface AuthProps {
  onAuthSuccess: () => void;
}

export function Auth({ onAuthSuccess }: AuthProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      onAuthSuccess();
    } catch (error: any) {
      toast({
        title: 'Błąd logowania',
        description: error.message,
        status: 'error',
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSignUp = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) throw error;
      toast({
        title: 'Sprawdź swoją skrzynkę email',
        description: 'Wysłaliśmy link weryfikacyjny na podany adres email.',
        status: 'success',
        duration: 5000,
      });
    } catch (error: any) {
      toast({
        title: 'Błąd rejestracji',
        description: error.message,
        status: 'error',
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });
      if (error) throw error;
    } catch (error: any) {
      toast({
        title: 'Błąd logowania przez Google',
        description: error.message,
        status: 'error',
        duration: 5000,
      });
    }
  };

  return (
    <Container maxW="md" py={12}>
      <Box
        bg={bgColor}
        p={8}
        borderWidth="1px"
        borderColor={borderColor}
        borderRadius="xl"
        boxShadow="sm"
      >
        <VStack spacing={6}>
          <Icon as={LogIn} w={12} h={12} color="blue.500" />
          <Heading size="lg">Zaloguj się</Heading>
          
          <Button
            w="full"
            size="lg"
            onClick={handleGoogleLogin}
            leftIcon={<Icon as={Mail} />}
            colorScheme="red"
          >
            Kontynuuj z Google
          </Button>

          <Divider />

          <form onSubmit={handleEmailLogin} style={{ width: '100%' }}>
            <Stack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Email</FormLabel>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="twoj@email.com"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Hasło</FormLabel>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="********"
                />
              </FormControl>

              <Button
                type="submit"
                colorScheme="blue"
                size="lg"
                isLoading={loading}
                w="full"
              >
                Zaloguj się
              </Button>

              <Button
                variant="outline"
                onClick={handleEmailSignUp}
                isLoading={loading}
                w="full"
              >
                Zarejestruj się
              </Button>
            </Stack>
          </form>
        </VStack>
      </Box>
    </Container>
  );
}