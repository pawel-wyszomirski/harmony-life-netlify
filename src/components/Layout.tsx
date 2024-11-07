import React from 'react';
import { Box, Button, HStack, Icon, useColorMode } from '@chakra-ui/react';
import { MoonStar, Sun, LogOut } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  showThemeToggle?: boolean;
  onSignOut?: () => void;
}

export function Layout({ children, showThemeToggle = true, onSignOut }: LayoutProps) {
  const { colorMode, toggleColorMode } = useColorMode();

  return (
    <Box 
      minH="100vh" 
      bg={colorMode === 'dark' ? 'gray.900' : 'gray.50'}
      position="relative"
    >
      {showThemeToggle && (
        <HStack 
          position="absolute" 
          top="4" 
          right="4" 
          spacing={2}
          bg={colorMode === 'dark' ? 'gray.800' : 'white'}
          p={2}
          borderRadius="lg"
          boxShadow="sm"
          border="1px solid"
          borderColor={colorMode === 'dark' ? 'gray.700' : 'gray.200'}
        >
          <Button
            onClick={toggleColorMode}
            variant="ghost"
            size="md"
            aria-label="Przełącz motyw"
            colorScheme="gray"
            p={2}
            minW="auto"
            h="auto"
          >
            <Icon as={colorMode === 'dark' ? Sun : MoonStar} boxSize={5} />
          </Button>
          {onSignOut && (
            <>
              <Box 
                w="1px" 
                h="5" 
                bg={colorMode === 'dark' ? 'gray.600' : 'gray.200'} 
              />
              <Button
                onClick={onSignOut}
                variant="ghost"
                size="md"
                aria-label="Wyloguj się"
                colorScheme="gray"
                p={2}
                minW="auto"
                h="auto"
              >
                <Icon as={LogOut} boxSize={5} />
              </Button>
            </>
          )}
        </HStack>
      )}
      <Box py={8} px={4} maxW="container.lg" mx="auto">
        {children}
      </Box>
    </Box>
  );
}