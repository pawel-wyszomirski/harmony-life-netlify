import { useState } from 'react';
import {
  VStack,
  ButtonGroup,
  Button,
  Progress,
  Text,
  Container,
  Box,
  HStack,
  Icon,
  Tooltip,
  useColorModeValue,
} from '@chakra-ui/react';
import { LogOut } from 'lucide-react';
import { HarmonyArea } from './HarmonyArea';
import { Area } from '../types/harmony';

interface HarmonyModelProps {
  areas: Area[];
  onAreasChange: (areas: Area[]) => void;
  onComplete: () => void;
  onSignOut: () => void;
}

export function HarmonyModel({ areas, onAreasChange, onComplete, onSignOut }: HarmonyModelProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.600', 'gray.400');
  const progressBg = useColorModeValue('gray.100', 'gray.700');
  const progressFilledBg = useColorModeValue('blue.500', 'blue.400');

  const handleScoreChange = (score: number) => {
    const newAreas = areas.map((area, idx) =>
      idx === currentStep ? { ...area, score } : area
    );
    onAreasChange(newAreas);
  };

  const handleNotesChange = (notes: string) => {
    const newAreas = areas.map((area, idx) =>
      idx === currentStep ? { ...area, notes } : area
    );
    onAreasChange(newAreas);
  };

  const progress = ((currentStep + 1) / areas.length) * 100;

  const handleProgressClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const progressBar = event.currentTarget;
    const rect = progressBar.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const percentage = (x / rect.width) * 100;
    const step = Math.floor((percentage / 100) * areas.length);
    setCurrentStep(Math.min(Math.max(0, step), areas.length - 1));
  };

  const renderProgressSteps = () => {
    return areas.map((area, index) => {
      const stepProgress = ((index + 1) / areas.length) * 100;
      const isActive = index <= currentStep;
      
      return (
        <Tooltip 
          key={area.id} 
          label={area.name}
          placement="top"
          hasArrow
        >
          <Box
            position="absolute"
            left={`${(index / (areas.length - 1)) * 100}%`}
            transform="translateX(-50%)"
            top="50%"
            marginTop="-8px"
            width="16px"
            height="16px"
            borderRadius="full"
            bg={isActive ? progressFilledBg : progressBg}
            cursor="pointer"
            transition="all 0.2s"
            _hover={{
              transform: "translateX(-50%) scale(1.2)",
              boxShadow: "md"
            }}
            onClick={(e) => {
              e.stopPropagation();
              setCurrentStep(index);
            }}
            zIndex={1}
          />
        </Tooltip>
      );
    });
  };

  return (
    <Container maxW="container.md" py={8}>
      <VStack spacing={8} w="full">
        <Box 
          w="full" 
          bg={bg} 
          p={6} 
          borderRadius="xl" 
          boxShadow="sm"
          borderWidth="1px"
          borderColor={borderColor}
        >
          <Box 
            position="relative" 
            cursor="pointer"
            onClick={handleProgressClick}
            h="8px"
          >
            <Progress 
              value={progress} 
              size="md" 
              colorScheme="blue" 
              borderRadius="full"
              bg={progressBg}
              sx={{
                '& > div': {
                  transition: 'width 0.2s'
                }
              }}
            />
            {renderProgressSteps()}
          </Box>
          <Text color={textColor} textAlign="center" mt={4} fontSize="sm">
            Krok {currentStep + 1} z {areas.length}
          </Text>
        </Box>

        <HarmonyArea
          area={areas[currentStep]}
          onScoreChange={handleScoreChange}
          onNotesChange={handleNotesChange}
        />
        
        <ButtonGroup spacing={4} w="full">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(prev => prev - 1)}
            isDisabled={currentStep === 0}
            size="lg"
            flex={1}
          >
            Poprzedni
          </Button>
          {currentStep === areas.length - 1 ? (
            <Button 
              colorScheme="blue" 
              onClick={onComplete}
              size="lg"
              flex={1}
            >
              Zakończ
            </Button>
          ) : (
            <Button 
              colorScheme="blue"
              onClick={() => setCurrentStep(prev => prev + 1)}
              size="lg"
              flex={1}
            >
              Następny
            </Button>
          )}
        </ButtonGroup>
      </VStack>
    </Container>
  );
}