
import { Box, useStyleConfig } from "@chakra-ui/react";

function Card(props) {
  const { variant, children, ...rest } = props;
  const styles = useStyleConfig("Card", { variant });
  
  return (
    <Box
      __css={styles}
      {...rest}
      borderRadius="15px"
      boxShadow="0px 3.5px 5.5px rgba(0, 0, 0, 0.02)"
      bg="white"
      _dark={{
        bg: "gray.800",
      }}
    >
      {children}
    </Box>
  );
}

export default Card;
