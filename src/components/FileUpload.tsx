import React, { useEffect, useState } from 'react';
import { 
  Box, 
  VStack, 
  Button, 
  Text, 
  Container,
  useColorModeValue,
  Heading,
  SimpleGrid,
  Icon,
  useToast,
} from '@chakra-ui/react';
import { Sparkle, Database, Rocket } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface FileUploadProps {
  onUpload: (data: any[]) => void;
  onStart: () => void;
  onSignOut: () => void;
}

export function FileUpload({ onUpload, onStart, onSignOut }: FileUploadProps) {
  const [loading, setLoading] = useState(false);
  const bgHover = useColorModeValue('gray.50', 'gray.700');
  const cardBg = useColorModeValue('white', 'gray.800');
  const toast = useToast();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  const handleLoadFromDatabase = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Nie jesteś zalogowany');

      // First get the last assessment ID from user preferences
      const { data: prefData, error: prefError } = await supabase
        .from('user_preferences')
        .select('last_assessment_id')
        .eq('user_id', user.id)
        .single();

      if (prefError && prefError.code !== 'PGRST116') throw prefError;

      const assessmentId = prefData?.last_assessment_id;

      // If we have a last assessment ID, get that specific assessment
      let query = supabase
        .from('harmony_assessments')
        .select('*')
        .eq('user_id', user.id);

      if (assessmentId) {
        query = query.eq('id', assessmentId);
      } else {
        query = query.order('created_at', { ascending: false }).limit(1);
      }

      const { data, error } = await query.single();

      if (error) {
        if (error.code === 'PGRST116') {
          toast({
            title: 'Brak danych',
            description: 'Nie znaleziono żadnych zapisanych analiz',
            status: 'info',
            duration: 5000,
          });
          return;
        }
        throw error;
      }

      if (!data) {
        toast({
          title: 'Brak danych',
          description: 'Nie znaleziono żadnych zapisanych analiz',
          status: 'info',
          duration: 5000,
        });
        return;
      }

      // Sort areas based on order_sequence if available
      const areas = [...data.areas];
      if (data.order_sequence) {
        areas.sort((a, b) => {
          const aIndex = data.order_sequence.indexOf(a.order);
          const bIndex = data.order_sequence.indexOf(b.order);
          return aIndex - bIndex;
        });
      }

      onUpload(areas);
      toast({
        title: 'Dane wczytane pomyślnie',
        status: 'success',
        duration: 3000,
      });
    } catch (error: any) {
      console.error('Błąd wczytywania:', error);
      toast({
        title: 'Błąd wczytywania danych',
        description: error.message,
        status: 'error',
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxW="container.md" py={12}>
      <VStack spacing={12}>
        <VStack spacing={6} textAlign="center">
          <Icon as={Sparkle} w={12} h={12} color="blue.500" />
          <Heading size="2xl" fontWeight="bold">
            Harmony Life
          </Heading>
          <Text fontSize="xl" color={useColorModeValue('gray.600', 'gray.400')} maxW="md">
            Odkryj równowagę w swoim życiu i stwórz harmonijną przyszłość
          </Text>
        </VStack>

        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8} w="full">
          <Box
            p={8}
            bg={cardBg}
            borderRadius="xl"
            boxShadow="sm"
            _hover={{ transform: 'translateY(-2px)', transition: 'all 0.2s' }}
          >
            <VStack spacing={6} align="flex-start">
              <Icon as={Rocket} w={16} h={16} color="blue.500" />
              <Heading size="md">Rozpocznij od Nowa</Heading>
              <Text color={useColorModeValue('gray.600', 'gray.400')}>
                Zacznij swoją podróż ku lepszemu życiu z czystą kartą
              </Text>
              <Button
                leftIcon={<Icon as={Sparkle} />}
                colorScheme="blue"
                size="lg"
                w="full"
                onClick={onStart}
              >
                Rozpocznij Analizę
              </Button>
            </VStack>
          </Box>

          <Box
            p={8}
            bg={cardBg}
            borderRadius="xl"
            boxShadow="sm"
            _hover={{ 
              transform: 'translateY(-2px)',
              transition: 'all 0.2s',
              bg: bgHover 
            }}
          >
            <VStack spacing={6} align="flex-start">
              <Icon as={Database} w={16} h={16} color="blue.500" />
              <Heading size="md">Kontynuuj Podróż</Heading>
              <Text color={useColorModeValue('gray.600', 'gray.400')}>
                Wczytaj poprzednią analizę z bazy danych
              </Text>
              <Button
                leftIcon={<Icon as={Database} />}
                variant="outline"
                colorScheme="blue"
                size="lg"
                w="full"
                onClick={handleLoadFromDatabase}
                isLoading={loading}
              >
                Wczytaj Analizę
              </Button>
            </VStack>
          </Box>
        </SimpleGrid>
      </VStack>
    </Container>
  );
}