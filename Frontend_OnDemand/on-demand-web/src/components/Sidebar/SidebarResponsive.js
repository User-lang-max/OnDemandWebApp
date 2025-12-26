import React from "react";
import {
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  useDisclosure,
  Button,
  Icon,
  useColorModeValue,
} from "@chakra-ui/react";
import { FiMenu } from "react-icons/fi";

function SidebarResponsive(props) {
  const { logoText, routes } = props;
  const { isOpen, onOpen, onClose } = useDisclosure();

  const bgDrawer = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("gray.800", "white");

  return (
    <>
      <Button
        display={{ sm: "inline-block", md: "none" }}
        onClick={onOpen}
        variant="ghost"
        p="0"
      >
        <Icon as={FiMenu} w="20px" h="20px" color={textColor} />
      </Button>
      <Drawer isOpen={isOpen} onClose={onClose} placement="left">
        <DrawerOverlay />
        <DrawerContent bg={bgDrawer}>
          <DrawerHeader>
            <Text fontSize="xl" fontWeight="bold" color="blue.500">
              {logoText}
            </Text>
          </DrawerHeader>
          <DrawerBody>
            {/* Vous pouvez ajouter le contenu de la sidebar ici */}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
}

export default SidebarResponsive;
