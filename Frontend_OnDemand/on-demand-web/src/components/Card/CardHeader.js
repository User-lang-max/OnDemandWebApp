import { Box, useStyleConfig } from "@chakra-ui/react";

function CardHeader(props) {
  const { variant, children, ...rest } = props;
  const styles = useStyleConfig("CardHeader", { variant });
  
  return (
    <Box
      __css={styles}
      {...rest}
      borderBottom="1px solid"
      borderColor="gray.200"
      _dark={{
        borderColor: "gray.600",
      }}
      px="22px"
      py="16px"
    >
      {children}
    </Box>
  );
}

export default CardHeader;
