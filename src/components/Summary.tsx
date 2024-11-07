import {
  VStack,
  ButtonGroup,
  Button,
  Text,
  Container,
  Icon,
  useToast,
  Heading,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useDisclosure,
} from '@chakra-ui/react';
import { Database, Save } from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { SortableArea } from './SortableArea';
import { Area } from '../types/harmony';
import { supabase } from '../lib/supabase';
import { useRef } from 'react';

interface SummaryProps {
  areas: Area[];
  onAreasChange: (areas: Area[]) => void;
  onBack: () => void;
  onSignOut: () => void;
  onSaveStateChange: (hasUnsavedChanges: boolean) => void;
}

export function Summary({ areas, onAreasChange, onBack, onSignOut, onSaveStateChange }: SummaryProps) {
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef<HTMLButtonElement>(null);
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = ({ active, over }: any) => {
    if (over && active.id !== over.id) {
      const oldIndex = areas.findIndex((area) => area.id === active.id);
      const newIndex = areas.findIndex((area) => area.id === over.id);
      
      const newAreas = arrayMove(areas, oldIndex, newIndex).map((area, index) => ({
        ...area,
        order: index,
      }));
      
      onAreasChange(newAreas);
      onSaveStateChange(true);
    }
  };

  const handleSaveToSupabase = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Nie jesteś zalogowany');

      const orderSequence = areas.map(area => area.order);

      const { data, error } = await supabase
        .from('harmony_assessments')
        .insert([
          {
            user_id: user.id,
            areas: areas.map(area => ({
              id: area.id,
              name: area.name,
              score: area.score,
              notes: area.notes,
              order: area.order
            })),
            order_sequence: orderSequence
          }
        ])
        .select()
        .single();

      if (error) throw error;

      // Update user preferences with the last assessment
      if (data) {
        await supabase
          .from('user_preferences')
          .upsert({
            user_id: user.id,
            last_assessment_id: data.id
          }, {
            onConflict: 'user_id'
          });
      }

      onSaveStateChange(false);
      toast({
        title: 'Zapisano',
        description: 'Twoja analiza została zapisana w bazie danych',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error: any) {
      console.error('Błąd podczas zapisywania:', error);
      toast({
        title: 'Błąd zapisu',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleSignOut = () => {
    if (areas.some(area => area.notes || area.score !== 5)) {
      onOpen();
    } else {
      onSignOut();
    }
  };

  return (
    <Container maxW="container.md" py={8}>
      <VStack spacing={8}>
        <VStack spacing={4} textAlign="center">
          <Heading size="lg">Podsumowanie Analizy</Heading>
          <Text color="gray.600">
            Przeciągnij obszary, aby ustalić ich priorytety
          </Text>
        </VStack>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={areas.map(area => area.id)}
            strategy={verticalListSortingStrategy}
          >
            <VStack spacing={3} w="full">
              {areas.map((area) => (
                <SortableArea key={area.id} area={area} />
              ))}
            </VStack>
          </SortableContext>
        </DndContext>

        <ButtonGroup spacing={4} w="full">
          <Button
            leftIcon={<Icon as={Save} />}
            colorScheme="blue"
            size="lg"
            onClick={handleSaveToSupabase}
            flex={1}
          >
            Zapisz
          </Button>
          <Button
            variant="ghost"
            onClick={onBack}
            size="lg"
            flex={1}
          >
            Wróć do Edycji
          </Button>
        </ButtonGroup>
      </VStack>

      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Niezapisane zmiany
            </AlertDialogHeader>

            <AlertDialogBody>
              Masz niezapisane zmiany. Czy chcesz je zapisać przed wylogowaniem?
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                Anuluj
              </Button>
              <Button
                colorScheme="red"
                onClick={onSignOut}
                ml={3}
              >
                Wyloguj bez zapisywania
              </Button>
              <Button
                colorScheme="blue"
                onClick={async () => {
                  await handleSaveToSupabase();
                  onSignOut();
                }}
                ml={3}
              >
                Zapisz i wyloguj
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Container>
  );
}